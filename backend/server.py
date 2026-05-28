from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, uuid, logging, json, asyncio, httpx, re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- helpers ----------
def utcnow():
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


async def get_current_user(session_token: Optional[str] = Cookie(default=None),
                           authorization: Optional[str] = Header(default=None)) -> Optional[Dict[str, Any]]:
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        return None
    exp = sess.get("expires_at")
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < utcnow():
        return None
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0})
    return user


async def require_user(session_token: Optional[str] = Cookie(default=None),
                       authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    user = await get_current_user(session_token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


# ---------- LLM helpers ----------
async def llm_json(system: str, prompt: str, session_id: str) -> Dict[str, Any]:
    """Call Claude Sonnet 4.5 and parse JSON response. Returns {} on failure."""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        msg = UserMessage(text=prompt)
        resp = await chat.send_message(msg)
        text = str(resp).strip()
        # Strip code fences
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            return json.loads(m.group(0))
        return {}
    except Exception as e:
        logger.exception("LLM error: %s", e)
        return {}


# ---------- Models ----------
class SessionBody(BaseModel):
    session_id: str


class RoleBody(BaseModel):
    role: str  # 'collector' | 'artist'


class ArtistProfile(BaseModel):
    bio: Optional[str] = ""
    headline: Optional[str] = ""
    location: Optional[str] = ""
    specialties: List[str] = []
    mediums: List[str] = []
    styles: List[str] = []
    price_low: Optional[int] = 500
    price_high: Optional[int] = 5000
    availability: Optional[str] = "Open to commissions"
    portfolio: List[Dict[str, Any]] = []  # [{url, title, medium, year}]
    years_experience: Optional[int] = 0


class ProjectCreate(BaseModel):
    title: str
    description: str
    size: Optional[str] = ""
    medium: Optional[str] = ""
    budget: Optional[int] = 0
    timeline: Optional[str] = ""
    location: Optional[str] = ""
    colors: Optional[str] = ""
    style: Optional[str] = ""
    inspiration_urls: List[str] = []
    room_url: Optional[str] = ""


class ProposalCreate(BaseModel):
    project_id: str
    price: int
    timeline_days: int
    concept: str
    references: List[str] = []


class MessageCreate(BaseModel):
    project_id: str
    text: str


class ReviewCreate(BaseModel):
    project_id: str
    artist_id: str
    communication: int
    quality: int
    timeliness: int
    text: Optional[str] = ""


class PricingBody(BaseModel):
    medium: str
    size: str
    description: str


# ---------- Auth ----------
@api.post("/auth/session")
async def auth_session(body: SessionBody, response: Response):
    """Exchange Emergent session_id for our session_token cookie."""
    async with httpx.AsyncClient(timeout=15.0) as hc:
        r = await hc.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": body.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()
    email = data["email"]
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture") or ""
    session_token = data["session_token"]

    # Upsert user
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture, "last_login": iso(utcnow())}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": None,
            "created_at": iso(utcnow()),
            "last_login": iso(utcnow()),
        })

    expires_at = utcnow() + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": iso(expires_at),
        "created_at": iso(utcnow()),
    })

    response.set_cookie(
        key="session_token", value=session_token,
        max_age=7 * 24 * 60 * 60, expires=int(expires_at.timestamp()),
        httponly=True, secure=True, samesite="none", path="/",
    )
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user


@api.get("/auth/me")
async def auth_me(session_token: Optional[str] = Cookie(default=None),
                  authorization: Optional[str] = Header(default=None)):
    user = await get_current_user(session_token, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api.post("/auth/logout")
async def auth_logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


@api.post("/auth/set-role")
async def set_role(body: RoleBody, session_token: Optional[str] = Cookie(default=None),
                   authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    if body.role not in ("collector", "artist"):
        raise HTTPException(status_code=400, detail="Invalid role")
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"role": body.role}})
    # If artist, create empty profile if not exists
    if body.role == "artist":
        existing = await db.artists.find_one({"user_id": user["user_id"]}, {"_id": 0})
        if not existing:
            await db.artists.insert_one({
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
                "picture": user.get("picture", ""),
                "bio": "", "headline": "", "location": "",
                "specialties": [], "mediums": [], "styles": [],
                "price_low": 500, "price_high": 5000,
                "availability": "Open to commissions",
                "portfolio": [], "years_experience": 0,
                "rating": 0.0, "reviews_count": 0, "completion_rate": 100,
                "created_at": iso(utcnow()),
            })
    return await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})


# ---------- Artists ----------
@api.get("/artists")
async def list_artists(medium: Optional[str] = None, style: Optional[str] = None,
                       max_price: Optional[int] = None, q: Optional[str] = None):
    query: Dict[str, Any] = {}
    if medium:
        query["mediums"] = medium
    if style:
        query["styles"] = style
    if max_price:
        query["price_low"] = {"$lte": max_price}
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"bio": {"$regex": q, "$options": "i"}},
            {"specialties": {"$regex": q, "$options": "i"}},
        ]
    artists = await db.artists.find(query, {"_id": 0}).to_list(200)
    return artists


@api.get("/artists/{user_id}")
async def get_artist(user_id: str):
    a = await db.artists.find_one({"user_id": user_id}, {"_id": 0})
    if not a:
        raise HTTPException(404, "Artist not found")
    return a


@api.put("/artists/me")
async def update_my_artist(body: ArtistProfile,
                            session_token: Optional[str] = Cookie(default=None),
                            authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    if user.get("role") != "artist":
        raise HTTPException(403, "Only artists can update artist profile")
    update = body.model_dump()
    await db.artists.update_one(
        {"user_id": user["user_id"]},
        {"$set": update, "$setOnInsert": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "picture": user.get("picture", ""),
            "rating": 0.0, "reviews_count": 0, "completion_rate": 100,
            "created_at": iso(utcnow()),
        }},
        upsert=True,
    )
    return await db.artists.find_one({"user_id": user["user_id"]}, {"_id": 0})


@api.get("/artists/{user_id}/reviews")
async def artist_reviews(user_id: str):
    rs = await db.reviews.find({"artist_id": user_id}, {"_id": 0}).to_list(100)
    return rs


# ---------- Projects ----------
@api.post("/projects")
async def create_project(body: ProjectCreate,
                          session_token: Optional[str] = Cookie(default=None),
                          authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    pid = f"prj_{uuid.uuid4().hex[:12]}"
    doc = body.model_dump()
    doc.update({
        "project_id": pid,
        "collector_id": user["user_id"],
        "collector_name": user["name"],
        "status": "matching",
        "ai_brief": "",
        "ai_analysis": {},
        "created_at": iso(utcnow()),
    })
    await db.projects.insert_one(doc)

    # Kick off AI brief generation (synchronously, short timeout)
    sys_msg = (
        "You are an expert art commission concierge. Extract a structured brief "
        "from a buyer's request. Respond ONLY with valid JSON with these keys: "
        "polished_brief (1-2 elegant paragraph summary for artists), "
        "style (string), medium (string), subject (string), palette (string), "
        "budget_band (string: 'entry'|'mid'|'premium'|'luxury'), keywords (array of strings)."
    )
    prompt = json.dumps({
        "title": body.title, "description": body.description, "size": body.size,
        "medium": body.medium, "budget": body.budget, "timeline": body.timeline,
        "colors": body.colors, "style": body.style, "location": body.location,
    })
    analysis = await llm_json(sys_msg, prompt, f"brief_{pid}")
    polished = analysis.get("polished_brief", "") or body.description
    await db.projects.update_one({"project_id": pid}, {"$set": {
        "ai_brief": polished, "ai_analysis": analysis,
    }})
    return await db.projects.find_one({"project_id": pid}, {"_id": 0})


@api.get("/projects")
async def list_projects(session_token: Optional[str] = Cookie(default=None),
                         authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    if user.get("role") == "artist":
        # Projects this artist is matched/invited to
        matches = await db.matches.find({"artist_id": user["user_id"]}, {"_id": 0}).to_list(200)
        project_ids = [m["project_id"] for m in matches]
        projs = await db.projects.find({"project_id": {"$in": project_ids}}, {"_id": 0}).to_list(200)
        # attach match info
        match_map = {m["project_id"]: m for m in matches}
        for p in projs:
            p["match"] = match_map.get(p["project_id"])
        return projs
    projs = await db.projects.find({"collector_id": user["user_id"]}, {"_id": 0}).to_list(200)
    return projs


@api.get("/projects/{pid}")
async def get_project(pid: str,
                       session_token: Optional[str] = Cookie(default=None),
                       authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    p = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Project not found")
    # ACL: collector owns it, or artist is matched
    if p["collector_id"] != user["user_id"]:
        m = await db.matches.find_one({"project_id": pid, "artist_id": user["user_id"]})
        if not m:
            raise HTTPException(403, "Access denied")
    return p


@api.post("/projects/{pid}/match")
async def run_match(pid: str,
                     session_token: Optional[str] = Cookie(default=None),
                     authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not proj or proj["collector_id"] != user["user_id"]:
        raise HTTPException(403, "Not allowed")

    # Candidate filter: budget compatibility (artist.price_low <= budget * 1.3)
    budget = int(proj.get("budget") or 0) or 1_000_000
    candidates = await db.artists.find(
        {"price_low": {"$lte": int(budget * 1.3)}}, {"_id": 0}
    ).to_list(50)
    if not candidates:
        candidates = await db.artists.find({}, {"_id": 0}).to_list(50)

    # Trim candidate payload for LLM
    slim = [{
        "user_id": a["user_id"], "name": a["name"], "headline": a.get("headline", ""),
        "bio": a.get("bio", "")[:300], "specialties": a.get("specialties", []),
        "mediums": a.get("mediums", []), "styles": a.get("styles", []),
        "price_low": a.get("price_low"), "price_high": a.get("price_high"),
        "location": a.get("location", ""), "rating": a.get("rating", 0),
        "years_experience": a.get("years_experience", 0),
    } for a in candidates[:20]]

    sys = (
        "You are an art commission matching engine. Score each candidate artist 0-100 "
        "based on style fit, medium fit, budget compatibility, location, and experience. "
        "Return ONLY JSON: {\"matches\": [{\"user_id\": str, \"score\": int, \"reasoning\": str}]} "
        "Pick the top 5 best matches. Reasoning must be 1-2 short sentences referencing concrete attributes."
    )
    prompt = json.dumps({
        "brief": proj.get("ai_brief") or proj["description"],
        "analysis": proj.get("ai_analysis", {}),
        "budget": proj.get("budget"),
        "medium_pref": proj.get("medium"),
        "style_pref": proj.get("style"),
        "location": proj.get("location"),
        "candidates": slim,
    })
    out = await llm_json(sys, prompt, f"match_{pid}")
    matches = out.get("matches", [])
    # Fallback if LLM returns nothing: deterministic scoring
    if not matches:
        matches = []
        for a in slim[:5]:
            score = 60
            if proj.get("medium") and proj["medium"].lower() in [m.lower() for m in a["mediums"]]:
                score += 15
            if proj.get("style") and proj["style"].lower() in [s.lower() for s in a["styles"]]:
                score += 10
            if a.get("price_low", 0) <= budget:
                score += 10
            matches.append({
                "user_id": a["user_id"], "score": min(score, 99),
                "reasoning": f"Strong fit on {', '.join(a['mediums'][:2]) or 'medium'} with experience in {', '.join(a['specialties'][:2]) or 'this category'}.",
            })

    # Persist matches
    await db.matches.delete_many({"project_id": pid})
    saved = []
    artist_lookup = {a["user_id"]: a for a in candidates}
    for m in matches[:5]:
        if m["user_id"] not in artist_lookup:
            continue
        doc = {
            "match_id": f"mat_{uuid.uuid4().hex[:10]}",
            "project_id": pid,
            "artist_id": m["user_id"],
            "score": int(m.get("score", 70)),
            "reasoning": m.get("reasoning", ""),
            "invited": True,
            "created_at": iso(utcnow()),
        }
        await db.matches.insert_one(doc)
        doc.pop("_id", None)
        a = artist_lookup[m["user_id"]]
        saved.append({**doc, "artist": {
            "user_id": a["user_id"], "name": a["name"], "headline": a.get("headline", ""),
            "picture": a.get("picture", ""), "specialties": a.get("specialties", []),
            "mediums": a.get("mediums", []), "styles": a.get("styles", []),
            "rating": a.get("rating", 0), "reviews_count": a.get("reviews_count", 0),
            "price_low": a.get("price_low"), "price_high": a.get("price_high"),
            "portfolio": a.get("portfolio", [])[:3], "location": a.get("location", ""),
        }})

    await db.projects.update_one({"project_id": pid}, {"$set": {"status": "matched"}})
    return {"matches": saved}


@api.get("/projects/{pid}/matches")
async def project_matches(pid: str,
                           session_token: Optional[str] = Cookie(default=None),
                           authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not proj:
        raise HTTPException(404)
    if proj["collector_id"] != user["user_id"]:
        raise HTTPException(403)
    matches = await db.matches.find({"project_id": pid}, {"_id": 0}).to_list(50)
    artist_ids = [m["artist_id"] for m in matches]
    artists = await db.artists.find({"user_id": {"$in": artist_ids}}, {"_id": 0}).to_list(50)
    a_map = {a["user_id"]: a for a in artists}
    out = []
    for m in sorted(matches, key=lambda x: -x.get("score", 0)):
        a = a_map.get(m["artist_id"])
        if not a:
            continue
        out.append({**m, "artist": a})
    return out


# ---------- Proposals ----------
@api.post("/proposals")
async def create_proposal(body: ProposalCreate,
                           session_token: Optional[str] = Cookie(default=None),
                           authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    if user.get("role") != "artist":
        raise HTTPException(403, "Only artists can submit proposals")
    # Must be invited
    match = await db.matches.find_one({"project_id": body.project_id, "artist_id": user["user_id"]})
    if not match:
        raise HTTPException(403, "Not invited to this project")
    pid = f"prp_{uuid.uuid4().hex[:10]}"
    doc = {
        "proposal_id": pid,
        "project_id": body.project_id,
        "artist_id": user["user_id"],
        "artist_name": user["name"],
        "price": body.price,
        "timeline_days": body.timeline_days,
        "concept": body.concept,
        "references": body.references,
        "status": "pending",
        "created_at": iso(utcnow()),
    }
    await db.proposals.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/projects/{pid}/proposals")
async def list_proposals(pid: str,
                          session_token: Optional[str] = Cookie(default=None),
                          authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not proj:
        raise HTTPException(404)
    if proj["collector_id"] != user["user_id"] and user.get("role") != "artist":
        raise HTTPException(403)
    if user.get("role") == "artist":
        props = await db.proposals.find(
            {"project_id": pid, "artist_id": user["user_id"]}, {"_id": 0}
        ).to_list(20)
    else:
        props = await db.proposals.find({"project_id": pid}, {"_id": 0}).to_list(50)
    # attach artist info
    aids = [p["artist_id"] for p in props]
    artists = await db.artists.find({"user_id": {"$in": aids}}, {"_id": 0}).to_list(50)
    amap = {a["user_id"]: a for a in artists}
    for p in props:
        p["artist"] = amap.get(p["artist_id"])
    return props


@api.post("/proposals/{prp_id}/accept")
async def accept_proposal(prp_id: str,
                           session_token: Optional[str] = Cookie(default=None),
                           authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    prop = await db.proposals.find_one({"proposal_id": prp_id}, {"_id": 0})
    if not prop:
        raise HTTPException(404)
    proj = await db.projects.find_one({"project_id": prop["project_id"]}, {"_id": 0})
    if not proj or proj["collector_id"] != user["user_id"]:
        raise HTTPException(403)
    deposit = int(prop["price"] * 0.5)
    await db.proposals.update_one({"proposal_id": prp_id}, {"$set": {"status": "accepted"}})
    await db.proposals.update_many(
        {"project_id": prop["project_id"], "proposal_id": {"$ne": prp_id}},
        {"$set": {"status": "declined"}},
    )
    await db.projects.update_one({"project_id": prop["project_id"]}, {"$set": {
        "status": "in_progress",
        "hired_artist_id": prop["artist_id"],
        "accepted_proposal_id": prp_id,
        "agreed_price": prop["price"],
        "agreed_timeline_days": prop["timeline_days"],
    }})
    # Create escrow record (MOCKED)
    escrow_id = f"esc_{uuid.uuid4().hex[:10]}"
    await db.escrows.insert_one({
        "escrow_id": escrow_id,
        "project_id": prop["project_id"],
        "collector_id": user["user_id"],
        "artist_id": prop["artist_id"],
        "total": prop["price"],
        "deposit": deposit,
        "status": "deposit_held",  # MOCKED Stripe escrow state
        "created_at": iso(utcnow()),
    })
    return {"ok": True, "escrow_id": escrow_id, "deposit": deposit}


@api.post("/projects/{pid}/complete")
async def complete_project(pid: str,
                            session_token: Optional[str] = Cookie(default=None),
                            authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not proj:
        raise HTTPException(404)
    if proj.get("hired_artist_id") != user["user_id"]:
        raise HTTPException(403)
    await db.projects.update_one({"project_id": pid}, {"$set": {"status": "awaiting_approval"}})
    return {"ok": True}


@api.post("/projects/{pid}/release-funds")
async def release_funds(pid: str,
                         session_token: Optional[str] = Cookie(default=None),
                         authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not proj or proj["collector_id"] != user["user_id"]:
        raise HTTPException(403)
    await db.escrows.update_one({"project_id": pid}, {"$set": {"status": "released"}})
    await db.projects.update_one({"project_id": pid}, {"$set": {"status": "completed"}})
    return {"ok": True}


@api.get("/projects/{pid}/escrow")
async def get_escrow(pid: str,
                      session_token: Optional[str] = Cookie(default=None),
                      authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    esc = await db.escrows.find_one({"project_id": pid}, {"_id": 0})
    return esc or {}


# ---------- Messages ----------
@api.post("/messages")
async def post_message(body: MessageCreate,
                        session_token: Optional[str] = Cookie(default=None),
                        authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": body.project_id}, {"_id": 0})
    if not proj:
        raise HTTPException(404)
    # Must be either collector or matched artist
    if proj["collector_id"] != user["user_id"]:
        m = await db.matches.find_one({"project_id": body.project_id, "artist_id": user["user_id"]})
        if not m:
            raise HTTPException(403)
    msg = {
        "message_id": f"msg_{uuid.uuid4().hex[:10]}",
        "project_id": body.project_id,
        "sender_id": user["user_id"],
        "sender_name": user["name"],
        "sender_picture": user.get("picture", ""),
        "text": body.text,
        "created_at": iso(utcnow()),
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg


@api.get("/projects/{pid}/messages")
async def list_messages(pid: str,
                         artist_id: Optional[str] = None,
                         session_token: Optional[str] = Cookie(default=None),
                         authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": pid}, {"_id": 0})
    if not proj:
        raise HTTPException(404)
    # For collector, optional filter by artist (one-on-one thread)
    q: Dict[str, Any] = {"project_id": pid}
    if user.get("role") == "artist":
        # only own thread
        q["$or"] = [{"sender_id": user["user_id"]}, {"sender_id": proj["collector_id"]}]
    elif artist_id:
        q["$or"] = [{"sender_id": artist_id}, {"sender_id": user["user_id"]}]
    msgs = await db.messages.find(q, {"_id": 0}).sort("created_at", 1).to_list(500)
    return msgs


# ---------- Reviews ----------
@api.post("/reviews")
async def post_review(body: ReviewCreate,
                       session_token: Optional[str] = Cookie(default=None),
                       authorization: Optional[str] = Header(default=None)):
    user = await require_user(session_token, authorization)
    proj = await db.projects.find_one({"project_id": body.project_id}, {"_id": 0})
    if not proj or proj["collector_id"] != user["user_id"]:
        raise HTTPException(403)
    avg = (body.communication + body.quality + body.timeliness) / 3.0
    doc = {
        "review_id": f"rev_{uuid.uuid4().hex[:10]}",
        "project_id": body.project_id,
        "artist_id": body.artist_id,
        "collector_id": user["user_id"],
        "collector_name": user["name"],
        "communication": body.communication,
        "quality": body.quality,
        "timeliness": body.timeliness,
        "text": body.text,
        "average": round(avg, 2),
        "created_at": iso(utcnow()),
    }
    await db.reviews.insert_one(doc)
    doc.pop("_id", None)
    # Recompute artist rating
    all_r = await db.reviews.find({"artist_id": body.artist_id}, {"_id": 0}).to_list(500)
    rating = round(sum(r["average"] for r in all_r) / len(all_r), 2)
    await db.artists.update_one({"user_id": body.artist_id}, {
        "$set": {"rating": rating, "reviews_count": len(all_r)}
    })
    return doc


# ---------- AI Pricing ----------
@api.post("/ai/pricing")
async def ai_pricing(body: PricingBody):
    sys = (
        "You are an art commission pricing expert. Given a brief, output ONLY JSON "
        "with three integer USD price tiers and a rationale: "
        "{\"low\": int, \"recommended\": int, \"premium\": int, \"rationale\": str}. "
        "Base prices on size, medium complexity, and market norms for emerging-to-established artists."
    )
    prompt = json.dumps({"medium": body.medium, "size": body.size, "description": body.description})
    out = await llm_json(sys, prompt, f"price_{uuid.uuid4().hex[:8]}")
    if not out or "recommended" not in out:
        # Fallback deterministic estimate
        size = body.size.lower()
        base = 1500
        if "48" in size or "60" in size:
            base = 3000
        if "72" in size or "large" in size:
            base = 5000
        out = {
            "low": int(base * 0.6),
            "recommended": base,
            "premium": int(base * 1.8),
            "rationale": "Estimate based on size and medium. Provide more detail for a refined quote.",
        }
    return out


# ---------- Seed (idempotent) ----------
SEED_ARTISTS = [
    {
        "user_id": "seed_artist_01", "name": "Isabella Moreau", "email": "isabella@palettematch.demo",
        "picture": "https://images.unsplash.com/photo-1611244419377-b0a760c19719?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
        "headline": "Coastal oil paintings, soft impressionism", "location": "Naples, FL",
        "bio": "Isabella has painted the Gulf coast for 18 years. Her work hangs in private collections across Florida and the northeast.",
        "specialties": ["Coastal landscapes", "Impressionism", "Large-scale canvases"],
        "mediums": ["Oil", "Acrylic"], "styles": ["Impressionist", "Naturalist", "Coastal"],
        "price_low": 1800, "price_high": 8000, "availability": "Open — 2 slots Q1",
        "portfolio": [
            {"url": "https://images.unsplash.com/photo-1567934150921-7632371abb32?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Gulf Light, 36x48", "medium": "Oil", "year": 2024},
            {"url": "https://images.unsplash.com/photo-1533208087231-c3618eab623c?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Naples Pier, 30x40", "medium": "Oil", "year": 2024},
            {"url": "https://images.pexels.com/photos/33591732/pexels-photo-33591732.jpeg?auto=compress&cs=tinysrgb&w=900", "title": "Tide Study", "medium": "Oil", "year": 2023},
        ],
        "years_experience": 18, "rating": 4.9, "reviews_count": 27, "completion_rate": 100,
    },
    {
        "user_id": "seed_artist_02", "name": "Jonas Reed", "email": "jonas@palettematch.demo",
        "picture": "https://images.pexels.com/photos/20697386/pexels-photo-20697386.jpeg?auto=compress&cs=tinysrgb&w=400",
        "headline": "Contemporary abstract, color-field", "location": "Brooklyn, NY",
        "bio": "Jonas builds layered abstract works in acrylic and mixed media. Featured in three NYC group shows in 2024.",
        "specialties": ["Abstract", "Color field", "Mixed media"],
        "mediums": ["Acrylic", "Mixed media"], "styles": ["Abstract", "Contemporary", "Minimalist"],
        "price_low": 1200, "price_high": 6500, "availability": "Booking March",
        "portfolio": [
            {"url": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Field No. 12", "medium": "Acrylic", "year": 2024},
            {"url": "https://images.unsplash.com/photo-1618331833071-ce81bd50d300?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Quiet Spectrum", "medium": "Mixed media", "year": 2024},
        ],
        "years_experience": 9, "rating": 4.8, "reviews_count": 19, "completion_rate": 97,
    },
    {
        "user_id": "seed_artist_03", "name": "Mira Okafor", "email": "mira@palettematch.demo",
        "picture": "https://images.pexels.com/photos/37542562/pexels-photo-37542562.jpeg?auto=compress&cs=tinysrgb&w=400",
        "headline": "Portrait & figurative oil painter", "location": "Chicago, IL",
        "bio": "Mira specializes in commissioned portraits with a luminous, classical sensibility.",
        "specialties": ["Portraits", "Figurative", "Classical"],
        "mediums": ["Oil"], "styles": ["Classical", "Realist", "Figurative"],
        "price_low": 2500, "price_high": 12000, "availability": "1 slot remaining",
        "portfolio": [
            {"url": "https://images.unsplash.com/photo-1646936190308-6faef1ac893c?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Quiet Hours", "medium": "Oil", "year": 2024},
        ],
        "years_experience": 14, "rating": 5.0, "reviews_count": 22, "completion_rate": 100,
    },
    {
        "user_id": "seed_artist_04", "name": "Theo Lin", "email": "theo@palettematch.demo",
        "picture": "https://images.pexels.com/photos/15968033/pexels-photo-15968033.png?auto=compress&cs=tinysrgb&w=400",
        "headline": "Architectural photography, fine art prints", "location": "Los Angeles, CA",
        "bio": "Theo creates large-scale architectural photography on archival fine art paper and acrylic.",
        "specialties": ["Architectural photography", "Black & white", "Limited editions"],
        "mediums": ["Photography", "Digital"], "styles": ["Minimalist", "Architectural", "Modern"],
        "price_low": 800, "price_high": 4500, "availability": "Open",
        "portfolio": [
            {"url": "https://images.unsplash.com/photo-1763647972062-5e9cd48fb282?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Concrete Study I", "medium": "Photography", "year": 2024},
        ],
        "years_experience": 11, "rating": 4.7, "reviews_count": 14, "completion_rate": 100,
    },
    {
        "user_id": "seed_artist_05", "name": "Anya Volkov", "email": "anya@palettematch.demo",
        "picture": "https://images.unsplash.com/photo-1611244419377-b0a760c19719?crop=entropy&cs=srgb&fm=jpg&q=85&w=400",
        "headline": "Watercolor botanicals & nature studies", "location": "Portland, OR",
        "bio": "Anya creates delicate watercolor commissions inspired by the Pacific Northwest.",
        "specialties": ["Botanicals", "Watercolor", "Nature"],
        "mediums": ["Watercolor"], "styles": ["Naturalist", "Botanical", "Soft"],
        "price_low": 400, "price_high": 2200, "availability": "Open",
        "portfolio": [
            {"url": "https://images.unsplash.com/photo-1646987916641-1f3c8992daa2?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Fern Series 3", "medium": "Watercolor", "year": 2024},
        ],
        "years_experience": 7, "rating": 4.9, "reviews_count": 31, "completion_rate": 100,
    },
    {
        "user_id": "seed_artist_06", "name": "Marcus Hale", "email": "marcus@palettematch.demo",
        "picture": "https://images.pexels.com/photos/20697386/pexels-photo-20697386.jpeg?auto=compress&cs=tinysrgb&w=400",
        "headline": "Large-scale modern abstracts for interiors", "location": "Austin, TX",
        "bio": "Marcus works directly with interior designers to create statement-scale abstract works.",
        "specialties": ["Abstract", "Large-scale", "Statement pieces"],
        "mediums": ["Acrylic", "Oil"], "styles": ["Abstract", "Modern", "Bold"],
        "price_low": 2000, "price_high": 10000, "availability": "Open",
        "portfolio": [
            {"url": "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=900", "title": "Open Field VII", "medium": "Acrylic", "year": 2023},
        ],
        "years_experience": 12, "rating": 4.8, "reviews_count": 16, "completion_rate": 100,
    },
]


@api.post("/seed")
async def seed():
    inserted = 0
    for a in SEED_ARTISTS:
        existing = await db.artists.find_one({"user_id": a["user_id"]})
        if not existing:
            doc = {**a, "created_at": iso(utcnow())}
            await db.artists.insert_one(doc)
            inserted += 1
        # ensure a placeholder user record exists so AI matching can write matches
        if not await db.users.find_one({"user_id": a["user_id"]}):
            await db.users.insert_one({
                "user_id": a["user_id"], "email": a["email"], "name": a["name"],
                "picture": a.get("picture", ""), "role": "artist",
                "created_at": iso(utcnow()),
            })
    return {"inserted": inserted, "total": len(SEED_ARTISTS)}


@api.get("/")
async def root():
    return {"app": "Palette Match", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Auto-seed artists on first boot
    count = await db.artists.count_documents({})
    if count == 0:
        for a in SEED_ARTISTS:
            await db.artists.insert_one({**a, "created_at": iso(utcnow())})
            if not await db.users.find_one({"user_id": a["user_id"]}):
                await db.users.insert_one({
                    "user_id": a["user_id"], "email": a["email"], "name": a["name"],
                    "picture": a.get("picture", ""), "role": "artist",
                    "created_at": iso(utcnow()),
                })
        logger.info("Seeded %d demo artists", len(SEED_ARTISTS))


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
