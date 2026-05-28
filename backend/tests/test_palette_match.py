"""Backend tests for Palette Match — covers auth (Bearer), artists, projects, AI,
proposals, escrow, messages, reviews, ACLs, and ObjectId leak checks."""
import os
import time
import uuid
import pytest
import requests
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://palette-match-12.preview.emergentagent.com").rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

mongo = MongoClient(MONGO_URL)
db = mongo[DB_NAME]

AI_TIMEOUT = 90  # AI calls can take 5-15s, generous


def _iso(dt):
    return dt.astimezone(timezone.utc).isoformat()


def _create_user(role=None, name="Test User"):
    uid = f"test-{role or 'noner'}-{uuid.uuid4().hex[:8]}"
    token = f"tok_{uuid.uuid4().hex}"
    db.users.insert_one({
        "user_id": uid, "email": f"{uid}@palettematch.local",
        "name": name, "picture": "", "role": role,
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    db.user_sessions.insert_one({
        "user_id": uid, "session_token": token,
        "expires_at": _iso(datetime.now(timezone.utc) + timedelta(days=7)),
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    return uid, token


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def collector():
    uid, tok = _create_user("collector", "TEST_Collector")
    yield uid, tok
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_one({"session_token": tok})


@pytest.fixture(scope="session")
def collector2():
    uid, tok = _create_user("collector", "TEST_Collector2")
    yield uid, tok
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_one({"session_token": tok})


@pytest.fixture(scope="session")
def fresh_user():
    """A user with role=None to test set-role flow."""
    uid, tok = _create_user(None, "TEST_NoRole")
    yield uid, tok
    db.users.delete_one({"user_id": uid})
    db.user_sessions.delete_one({"session_token": tok})


# ---------- Health & Artists ----------
def test_health():
    r = requests.get(f"{BASE_URL}/api/", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j.get("app") == "Palette Match"
    assert j.get("status") == "ok"


def test_artists_list():
    r = requests.get(f"{BASE_URL}/api/artists", timeout=15)
    assert r.status_code == 200
    artists = r.json()
    names = [a["name"] for a in artists]
    for expected in ["Isabella Moreau", "Jonas Reed", "Mira Okafor", "Theo Lin", "Anya Volkov", "Marcus Hale"]:
        assert expected in names, f"Missing artist {expected}"
    # No _id leaks
    for a in artists:
        assert "_id" not in a


def test_artist_get_single():
    r = requests.get(f"{BASE_URL}/api/artists/seed_artist_01", timeout=15)
    assert r.status_code == 200
    a = r.json()
    assert a["name"] == "Isabella Moreau"
    assert "portfolio" in a and len(a["portfolio"]) > 0
    assert "bio" in a and a["bio"]
    assert "_id" not in a


def test_artists_filter_medium_q():
    r = requests.get(f"{BASE_URL}/api/artists", params={"medium": "Oil", "q": "coastal"}, timeout=15)
    assert r.status_code == 200
    arts = r.json()
    assert len(arts) >= 1
    assert any(a["name"] == "Isabella Moreau" for a in arts)


# ---------- Auth ----------
def test_auth_session_invalid():
    r = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid-xxx"}, timeout=20)
    assert r.status_code == 401


def test_auth_me_unauth():
    r = requests.get(f"{BASE_URL}/api/auth/me", timeout=15)
    assert r.status_code == 401


def test_auth_me_with_bearer(collector):
    uid, tok = collector
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=_auth(tok), timeout=15)
    assert r.status_code == 200
    u = r.json()
    assert u["user_id"] == uid
    assert u["role"] == "collector"
    assert "_id" not in u


def test_set_role(fresh_user):
    uid, tok = fresh_user
    r = requests.post(f"{BASE_URL}/api/auth/set-role", json={"role": "collector"},
                      headers=_auth(tok), timeout=15)
    assert r.status_code == 200
    assert r.json()["role"] == "collector"
    # verify persistence
    r2 = requests.get(f"{BASE_URL}/api/auth/me", headers=_auth(tok), timeout=15)
    assert r2.json()["role"] == "collector"


def test_set_role_invalid(collector):
    _, tok = collector
    r = requests.post(f"{BASE_URL}/api/auth/set-role", json={"role": "hacker"},
                      headers=_auth(tok), timeout=15)
    assert r.status_code == 400


# ---------- Projects + AI Brief ----------
@pytest.fixture(scope="session")
def coastal_project(collector):
    uid, tok = collector
    payload = {
        "title": "TEST_Coastal painting",
        "description": "I want a 36x48 coastal oil painting for my Naples condo",
        "size": "36x48", "medium": "Oil", "budget": 3000,
        "timeline": "1-2 months", "style": "Impressionist", "location": "Naples, FL",
    }
    r = requests.post(f"{BASE_URL}/api/projects", json=payload, headers=_auth(tok), timeout=AI_TIMEOUT)
    assert r.status_code == 200, f"Project creation failed: {r.status_code} {r.text}"
    proj = r.json()
    yield proj, tok
    db.projects.delete_many({"project_id": proj["project_id"]})
    db.matches.delete_many({"project_id": proj["project_id"]})
    db.proposals.delete_many({"project_id": proj["project_id"]})
    db.escrows.delete_many({"project_id": proj["project_id"]})
    db.messages.delete_many({"project_id": proj["project_id"]})


def test_project_created_with_ai_brief(coastal_project):
    proj, _ = coastal_project
    assert proj["project_id"].startswith("prj_")
    assert proj["title"] == "TEST_Coastal painting"
    assert proj["status"] in ("matching", "matched")
    assert "_id" not in proj
    assert proj.get("ai_brief"), "ai_brief should be populated by Claude"
    assert len(proj["ai_brief"]) > 20


def test_project_get_owner(coastal_project):
    proj, tok = coastal_project
    r = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}", headers=_auth(tok), timeout=15)
    assert r.status_code == 200
    assert r.json()["project_id"] == proj["project_id"]


def test_project_get_non_owner_forbidden(coastal_project, collector2):
    proj, _ = coastal_project
    _, tok2 = collector2
    r = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}", headers=_auth(tok2), timeout=15)
    assert r.status_code == 403


# ---------- AI Matching ----------
@pytest.fixture(scope="session")
def matches_run(coastal_project):
    proj, tok = coastal_project
    r = requests.post(f"{BASE_URL}/api/projects/{proj['project_id']}/match",
                      headers=_auth(tok), timeout=AI_TIMEOUT)
    assert r.status_code == 200, f"Match failed: {r.status_code} {r.text}"
    return r.json(), proj, tok


def test_matches_returned(matches_run):
    data, proj, _ = matches_run
    matches = data.get("matches", [])
    assert len(matches) >= 1, "Should return at least 1 match"
    assert len(matches) <= 5
    for m in matches:
        assert "score" in m
        assert isinstance(m["score"], int)
        assert 0 <= m["score"] <= 100
        assert "reasoning" in m
        assert "artist" in m
        assert "_id" not in m


def test_isabella_top_match(matches_run):
    data, _, _ = matches_run
    matches = sorted(data["matches"], key=lambda x: -x["score"])
    top = matches[0]
    assert top["artist"]["user_id"] == "seed_artist_01", \
        f"Isabella should be top, got {top['artist']['name']} ({top['score']})"
    assert top["score"] >= 80


def test_get_matches_sorted(matches_run):
    _, proj, tok = matches_run
    r = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}/matches",
                     headers=_auth(tok), timeout=15)
    assert r.status_code == 200
    ms = r.json()
    assert len(ms) >= 1
    scores = [m["score"] for m in ms]
    assert scores == sorted(scores, reverse=True)
    for m in ms:
        assert "artist" in m
        assert "_id" not in m


# ---------- AI Pricing ----------
def test_ai_pricing():
    r = requests.post(f"{BASE_URL}/api/ai/pricing",
                      json={"medium": "Oil", "size": "36x48",
                            "description": "Coastal impressionist landscape"},
                      timeout=AI_TIMEOUT)
    assert r.status_code == 200
    j = r.json()
    for k in ("low", "recommended", "premium", "rationale"):
        assert k in j
    assert isinstance(j["low"], int)
    assert isinstance(j["recommended"], int)
    assert isinstance(j["premium"], int)
    assert isinstance(j["rationale"], str)
    assert j["low"] <= j["recommended"] <= j["premium"]


# ---------- Proposals + Escrow ----------
@pytest.fixture(scope="session")
def artist_in_match(matches_run):
    """Pick the first matched artist and inject a Bearer session for them
    (seed artists have role=artist already)."""
    data, proj, ctok = matches_run
    artist_id = data["matches"][0]["artist"]["user_id"]
    token = f"tok_{uuid.uuid4().hex}"
    db.user_sessions.insert_one({
        "user_id": artist_id, "session_token": token,
        "expires_at": _iso(datetime.now(timezone.utc) + timedelta(days=7)),
        "created_at": _iso(datetime.now(timezone.utc)),
    })
    yield artist_id, token, proj, ctok
    db.user_sessions.delete_one({"session_token": token})


def test_non_artist_cannot_propose(coastal_project):
    proj, ctok = coastal_project
    r = requests.post(f"{BASE_URL}/api/proposals",
                      json={"project_id": proj["project_id"], "price": 3000,
                            "timeline_days": 45, "concept": "x", "references": []},
                      headers=_auth(ctok), timeout=15)
    assert r.status_code == 403


@pytest.fixture(scope="session")
def proposal(artist_in_match):
    aid, atok, proj, ctok = artist_in_match
    payload = {
        "project_id": proj["project_id"], "price": 3200,
        "timeline_days": 45,
        "concept": "TEST_Soft impressionist coastal oil at 36x48.",
        "references": [],
    }
    r = requests.post(f"{BASE_URL}/api/proposals", json=payload, headers=_auth(atok), timeout=15)
    assert r.status_code == 200, f"Proposal failed: {r.status_code} {r.text}"
    p = r.json()
    yield p, aid, atok, proj, ctok
    db.proposals.delete_many({"proposal_id": p["proposal_id"]})


def test_proposal_created(proposal):
    p, *_ = proposal
    assert p["proposal_id"].startswith("prp_")
    assert p["status"] == "pending"
    assert "_id" not in p


def test_non_collector_cannot_accept(proposal, collector2):
    p, *_ = proposal
    _, tok2 = collector2
    r = requests.post(f"{BASE_URL}/api/proposals/{p['proposal_id']}/accept",
                      headers=_auth(tok2), timeout=15)
    assert r.status_code == 403


def test_accept_proposal_and_escrow(proposal):
    p, aid, atok, proj, ctok = proposal
    r = requests.post(f"{BASE_URL}/api/proposals/{p['proposal_id']}/accept",
                      headers=_auth(ctok), timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["ok"] is True
    assert j["deposit"] == int(p["price"] * 0.5)
    # Escrow record
    r2 = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}/escrow",
                      headers=_auth(ctok), timeout=15)
    assert r2.status_code == 200
    esc = r2.json()
    assert esc["status"] == "deposit_held"
    assert esc["deposit"] == int(p["price"] * 0.5)
    assert esc["total"] == p["price"]
    assert "_id" not in esc
    # Project should be in_progress
    r3 = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}",
                      headers=_auth(ctok), timeout=15)
    assert r3.json()["status"] == "in_progress"


def test_complete_and_release(proposal):
    p, aid, atok, proj, ctok = proposal
    # artist marks complete
    r = requests.post(f"{BASE_URL}/api/projects/{proj['project_id']}/complete",
                      headers=_auth(atok), timeout=15)
    assert r.status_code == 200
    r2 = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}",
                      headers=_auth(ctok), timeout=15)
    assert r2.json()["status"] == "awaiting_approval"
    # collector releases
    r3 = requests.post(f"{BASE_URL}/api/projects/{proj['project_id']}/release-funds",
                       headers=_auth(ctok), timeout=15)
    assert r3.status_code == 200
    r4 = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}/escrow",
                      headers=_auth(ctok), timeout=15)
    assert r4.json()["status"] == "released"


# ---------- Messages ----------
def test_messages_collector_and_artist(artist_in_match):
    aid, atok, proj, ctok = artist_in_match
    r = requests.post(f"{BASE_URL}/api/messages",
                      json={"project_id": proj["project_id"], "text": "TEST_Hello from collector"},
                      headers=_auth(ctok), timeout=15)
    assert r.status_code == 200
    assert "_id" not in r.json()
    r2 = requests.post(f"{BASE_URL}/api/messages",
                       json={"project_id": proj["project_id"], "text": "TEST_Hello from artist"},
                       headers=_auth(atok), timeout=15)
    assert r2.status_code == 200
    r3 = requests.get(f"{BASE_URL}/api/projects/{proj['project_id']}/messages",
                      headers=_auth(ctok), timeout=15)
    assert r3.status_code == 200
    msgs = r3.json()
    texts = [m["text"] for m in msgs]
    assert "TEST_Hello from collector" in texts
    assert "TEST_Hello from artist" in texts


def test_messages_unauthorized(coastal_project, collector2):
    proj, _ = coastal_project
    _, tok2 = collector2
    r = requests.post(f"{BASE_URL}/api/messages",
                      json={"project_id": proj["project_id"], "text": "TEST_intruder"},
                      headers=_auth(tok2), timeout=15)
    assert r.status_code == 403


# ---------- Reviews ----------
def test_review_creates_and_recomputes(artist_in_match):
    aid, atok, proj, ctok = artist_in_match
    # capture old reviews count
    before = requests.get(f"{BASE_URL}/api/artists/{aid}", timeout=15).json()
    old_count = before.get("reviews_count", 0)
    r = requests.post(f"{BASE_URL}/api/reviews",
                      json={"project_id": proj["project_id"], "artist_id": aid,
                            "communication": 5, "quality": 5, "timeliness": 4,
                            "text": "TEST_great work"},
                      headers=_auth(ctok), timeout=15)
    assert r.status_code == 200
    rev = r.json()
    assert "_id" not in rev
    assert rev["average"] == round((5+5+4)/3, 2)
    after = requests.get(f"{BASE_URL}/api/artists/{aid}", timeout=15).json()
    # Note: recompute is based on actual review docs, so count == 1 after first review
    # (seed artists have inflated reviews_count without backing review docs)
    assert after["reviews_count"] >= 1
    assert after["rating"] >= 0
    # cleanup
    db.reviews.delete_one({"review_id": rev["review_id"]})


# ---------- Artist profile update ----------
def test_artist_profile_update_role_gate(collector):
    _, tok = collector
    r = requests.put(f"{BASE_URL}/api/artists/me",
                     json={"bio": "x", "headline": "y", "location": "z",
                           "specialties": [], "mediums": [], "styles": [],
                           "price_low": 100, "price_high": 200,
                           "availability": "Open", "portfolio": [], "years_experience": 1},
                     headers=_auth(tok), timeout=15)
    assert r.status_code == 403


def test_artist_profile_update_success():
    aid, tok = _create_user("artist", "TEST_ArtistProfile")
    try:
        # First create artist profile via set-role (which creates empty)
        requests.post(f"{BASE_URL}/api/auth/set-role", json={"role": "artist"},
                      headers=_auth(tok), timeout=15)
        r = requests.put(f"{BASE_URL}/api/artists/me",
                         json={"bio": "TEST_bio updated", "headline": "TEST_headline",
                               "location": "Test City", "specialties": ["TEST_spec"],
                               "mediums": ["Oil"], "styles": ["Abstract"],
                               "price_low": 800, "price_high": 4000,
                               "availability": "Open", "portfolio": [],
                               "years_experience": 3},
                         headers=_auth(tok), timeout=15)
        assert r.status_code == 200
        a = r.json()
        assert a["bio"] == "TEST_bio updated"
        assert "_id" not in a
        # GET verifies persistence
        r2 = requests.get(f"{BASE_URL}/api/artists/{aid}", timeout=15)
        assert r2.status_code == 200
        assert r2.json()["bio"] == "TEST_bio updated"
    finally:
        db.users.delete_one({"user_id": aid})
        db.user_sessions.delete_one({"session_token": tok})
        db.artists.delete_one({"user_id": aid})
