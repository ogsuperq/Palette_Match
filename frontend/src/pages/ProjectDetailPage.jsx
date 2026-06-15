import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { Send, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import {
  acceptDemoProposal,
  advanceDemoProject,
  createDemoMessage,
  createDemoProposal,
  getDemoProjectBundle,
  isDemoProjectId,
} from "@/lib/demoMode";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [escrow, setEscrow] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [prop, setProp] = useState({ price: 0, timeline_days: 30, concept: "" });
  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [selectedArtistId, setSelectedArtistId] = useState("");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionPending, setActionPending] = useState("");
  const [matches, setMatches] = useState([]);
  const msgsEnd = useRef(null);
  const isDemoProject = isDemoProjectId(id);

  const isArtist = user?.role === "artist";
  const isCollector = project && project.collector_id === user?.user_id;

  const load = async () => {
    if (isDemoProject) {
      const bundle = getDemoProjectBundle(id);
      if (!bundle) {
        setLoadError("Unable to load this project.");
        return;
      }
      setProject(bundle.project);
      setProposals(bundle.proposals);
      setMessages(bundle.messages);
      setEscrow(bundle.escrow);
      setMatches(bundle.matches);
      setLoadError("");
      if (!selectedArtistId) {
        setSelectedArtistId(
          bundle.project.hired_artist_id ||
          bundle.proposals.find((proposal) => proposal.status === "accepted")?.artist_id ||
          bundle.proposals[0]?.artist_id ||
          bundle.matches[0]?.artist_id ||
          ""
        );
      }
      return;
    }
    try {
      const [p, props, msgs, esc] = await Promise.all([
        http.get(`/projects/${id}`),
        http.get(`/projects/${id}/proposals`),
        http.get(`/projects/${id}/messages`),
        http.get(`/projects/${id}/escrow`),
      ]);
      setProject(p.data);
      setProposals(props.data);
      setMessages(msgs.data);
      setEscrow(esc.data && Object.keys(esc.data).length ? esc.data : null);
      setLoadError("");
      if (p.data.collector_id === user?.user_id && !selectedArtistId) {
        setSelectedArtistId(
          p.data.hired_artist_id ||
          props.data.find((proposal) => proposal.status === "accepted")?.artist_id ||
          props.data[0]?.artist_id ||
          msgs.data[0]?.artist_id ||
          ""
        );
      }
    } catch (e) {
      console.error(e);
      setLoadError(e.response?.data?.detail || "Unable to load this project.");
    }
  };

  useEffect(() => {
    load();
    // The polling effect below owns subsequent refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [id]);
  useEffect(() => { msgsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    if (isCollector && !selectedArtistId) return;
    setActionPending("message");
    setActionError("");
    if (isDemoProject) {
      createDemoMessage(id, selectedArtistId, text.trim());
      setText("");
      await load();
      setActionPending("");
      return;
    }
    try {
      await http.post("/messages", {
        project_id: id,
        artist_id: isCollector ? selectedArtistId : undefined,
        text: text.trim(),
      });
      setText("");
      await load();
    } catch (e) {
      setActionError(e.response?.data?.detail || "Your message could not be sent.");
    } finally {
      setActionPending("");
    }
  };

  const submitProposal = async () => {
    setSubmitting(true);
    setActionError("");
    if (isDemoProject) {
      createDemoProposal(id, selectedArtistId || matches[0]?.artist_id, prop);
      setShowProposalForm(false);
      await load();
      setSubmitting(false);
      return;
    }
    try {
      await http.post("/proposals", { project_id: id, ...prop, references: [] });
      setShowProposalForm(false);
      await load();
    } catch (e) {
      setActionError(e.response?.data?.detail || "Your proposal could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  const accept = async (proposalId) => {
    if (!window.confirm("Accept this proposal? A 50% deposit will be held in escrow (mock).")) return;
    if (isDemoProject) {
      await runAction("accept", async () => acceptDemoProposal(id, proposalId));
      return;
    }
    await runAction("accept", () => http.post(`/proposals/${proposalId}/accept`));
  };

  const release = async () => {
    if (isDemoProject && ["artist_selected", "deposit_pending"].includes(project.status)) {
      const nextStatus = project.status === "artist_selected" ? "deposit_pending" : "in_progress";
      await runAction("deposit", async () => advanceDemoProject(id, nextStatus));
      return;
    }
    if (!window.confirm("Release all funds to the artist?")) return;
    if (isDemoProject) {
      await runAction("release", async () => advanceDemoProject(id, "completed"));
      return;
    }
    await runAction("release", () => http.post(`/projects/${id}/release-funds`));
  };

  const complete = async () => {
    if (isDemoProject) {
      await runAction("complete", async () => advanceDemoProject(id, "completed"));
      return;
    }
    await runAction("complete", () => http.post(`/projects/${id}/complete`));
  };

  const aiPricing = async () => {
    setPricing("loading");
    setActionError("");
    if (isDemoProject) {
      const artist = matches.find((match) => match.artist_id === selectedArtistId)?.artist || matches[0]?.artist;
      const recommended = Math.min(
        Math.max(Math.round((project.budget || artist?.price_low || 2500) * 0.92), artist?.price_low || 1000),
        artist?.price_high || 10000
      );
      const demoPricing = {
        low: Math.max(recommended - 500, artist?.price_low || 1000),
        recommended,
        premium: Math.min(recommended + 900, artist?.price_high || recommended + 900),
      };
      setPricing(demoPricing);
      setProp((p) => ({
        ...p,
        price: recommended,
        concept: p.concept || "A composed original work shaped around the room, palette, and story in the brief.",
      }));
      return;
    }
    try {
      const { data } = await http.post("/ai/pricing", {
        medium: project.medium, size: project.size,
        description: project.description,
      });
      setPricing(data);
      setProp((p) => ({ ...p, price: data.recommended }));
    } catch (e) {
      setPricing(null);
      setActionError(e.response?.data?.detail || "Pricing guidance is unavailable. Enter a price manually.");
    }
  };

  const artistOptions = isDemoProject
    ? matches.map((match) => ({ artist_id: match.artist_id, artist: match.artist }))
    : proposals;
  const hasProposalForSelectedArtist = proposals.some((proposal) => proposal.artist_id === selectedArtistId);

  const runAction = async (name, action) => {
    setActionPending(name);
    setActionError("");
    try {
      await action();
      await load();
    } catch (e) {
      setActionError(e.response?.data?.detail || "That action could not be completed.");
    } finally {
      setActionPending("");
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="p-16 text-neutral-600">
          {loadError || <span className="overline text-neutral-500">Loading…</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-10 sm:py-12" data-testid="project-detail">
        {/* Header */}
        <div className="mb-10">
          <span className="overline text-neutral-500">{project.status?.replace("_", " ")}</span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-3">{project.title}</h1>
          <p className="text-neutral-700 mt-4 max-w-3xl font-serif text-lg italic leading-relaxed">
            "{project.ai_brief || project.description}"
          </p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm text-neutral-600">
            <span><strong className="text-neutral-900">Size</strong> · {project.size}</span>
            <span><strong className="text-neutral-900">Medium</strong> · {project.medium}</span>
            <span><strong className="text-neutral-900">Budget</strong> · ${project.budget?.toLocaleString()}</span>
            <span><strong className="text-neutral-900">Timeline</strong> · {project.timeline}</span>
          </div>
        </div>

        {actionError && (
          <div className="border border-neutral-300 bg-white p-4 mb-6 text-sm text-neutral-700" role="alert">
            {actionError}
          </div>
        )}

        {/* Escrow status (if in progress) */}
        {escrow && (
          <div className="border border-neutral-200 bg-white p-6 mb-10 flex flex-col sm:flex-row justify-between gap-4" data-testid="escrow-card">
            <div>
              <span className="overline text-neutral-500">Escrow (mocked Stripe)</span>
              <div className="font-serif text-3xl mt-2">${escrow.total?.toLocaleString()}</div>
              <p className="text-sm text-neutral-600 mt-1">
                Status: <strong>{escrow.status}</strong> · Deposit ${escrow.deposit?.toLocaleString()} held
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isArtist && project.status === "in_progress" && (
                <button data-testid="mark-complete" onClick={complete} disabled={Boolean(actionPending)} className="btn-secondary disabled:opacity-30">
                  {actionPending === "complete" ? "Updating…" : "Mark artwork complete"}
                </button>
              )}
              {isCollector && project.status === "awaiting_approval" && escrow.status === "deposit_held" && (
                <button data-testid="release-funds" onClick={release} disabled={Boolean(actionPending)} className="btn-primary disabled:opacity-30">
                  <CheckCircle2 size={14} /> {actionPending === "release" ? "Releasing…" : "Approve & release funds"}
                </button>
              )}
              {isCollector && isDemoProject && ["artist_selected", "deposit_pending"].includes(project.status) && escrow.status === "deposit_pending" && (
                <button data-testid="release-funds" onClick={release} disabled={Boolean(actionPending)} className="btn-primary disabled:opacity-30">
                  <CheckCircle2 size={14} /> {actionPending === "deposit" ? "Updating…" : project.status === "artist_selected" ? "Continue to deposit" : "Confirm deposit"}
                </button>
              )}
              {project.status === "completed" && (
                <span className="ai-badge">Completed</span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
          {/* Proposals column */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-8" data-testid="proposals-column">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="font-serif text-3xl tracking-tight">Proposals</h2>
              {isCollector && (
                <Link to={`/project/${id}/matches`} className="overline text-neutral-500 hover:text-neutral-900">
                  View AI matches →
                </Link>
              )}
              {isDemoProject && isCollector && selectedArtistId && !hasProposalForSelectedArtist && project.status === "matched" && (
                <button
                  data-testid="submit-proposal-btn"
                  onClick={() => { setShowProposalForm(true); aiPricing(); }}
                  className="btn-primary !py-2 !px-4"
                >
                  Submit proposal
                </button>
              )}
              {isArtist && !proposals.find((p) => p.artist_id === user.user_id) && project.status === "matched" && (
                <button
                  data-testid="submit-proposal-btn"
                  onClick={() => { setShowProposalForm(true); aiPricing(); }}
                  className="btn-primary !py-2 !px-4"
                >
                  Submit proposal
                </button>
              )}
            </div>

            {showProposalForm && (
              <div className="border border-neutral-300 bg-neutral-50 p-6 mb-6" data-testid="proposal-form">
                <span className="ai-badge"><Sparkles size={12} /> AI pricing assistant</span>
                {pricing === "loading" && <p className="mt-3 text-sm text-neutral-500"><Loader2 className="inline animate-spin" size={12} /> Suggesting prices…</p>}
                {pricing && typeof pricing === "object" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 mt-4">
                    {["low", "recommended", "premium"].map((k) => (
                      <button
                        key={k}
                        data-testid={`price-${k}`}
                        onClick={() => setProp((p) => ({ ...p, price: pricing[k] }))}
                        className="bg-white p-4 text-left hover:bg-neutral-50"
                      >
                        <div className="overline text-neutral-500">{k}</div>
                        <div className="font-serif text-2xl mt-1">${pricing[k]?.toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="overline">Price (USD)</label>
                    <input
                      type="number"
                      data-testid="proposal-price"
                      className="input-luxury mt-2"
                      value={prop.price}
                      onChange={(e) => setProp({ ...prop, price: parseInt(e.target.value || "0") })}
                    />
                  </div>
                  <div>
                    <label className="overline">Timeline (days)</label>
                    <input
                      type="number"
                      data-testid="proposal-days"
                      className="input-luxury mt-2"
                      value={prop.timeline_days}
                      onChange={(e) => setProp({ ...prop, timeline_days: parseInt(e.target.value || "0") })}
                    />
                  </div>
                </div>
                <label className="overline mt-4 block">Concept statement</label>
                <textarea
                  rows={4}
                  data-testid="proposal-concept"
                  className="input-luxury mt-2"
                  placeholder="My approach to your brief…"
                  value={prop.concept}
                  onChange={(e) => setProp({ ...prop, concept: e.target.value })}
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowProposalForm(false)} className="btn-secondary">Cancel</button>
                  <button data-testid="proposal-submit" onClick={submitProposal} disabled={submitting || !prop.price || !prop.concept} className="btn-primary disabled:opacity-30">
                    {submitting ? "Submitting…" : "Submit proposal"}
                  </button>
                </div>
              </div>
            )}

            {proposals.length === 0 ? (
              <p className="text-neutral-500 text-sm">No proposals yet. Invited artists will respond shortly.</p>
            ) : (
              <div className="space-y-px bg-neutral-200">
                {proposals.map((p) => (
                  <div key={p.proposal_id} className="bg-white p-6" data-testid={`proposal-${p.proposal_id}`}
                    style={p.status === "accepted" ? { borderTop: "2px solid #C1A68D" } : {}}>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <h4 className="font-serif text-xl">{p.artist?.name || p.artist_name}</h4>
                        <p className="overline text-neutral-500 mt-1">{p.status}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-3xl">${p.price?.toLocaleString()}</div>
                        <div className="overline text-neutral-500 mt-1">{p.timeline_days} days</div>
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-neutral-700 leading-relaxed">{p.concept}</p>
                    {isCollector && p.status === "pending" && project.status === "matched" && (
                      <button
                        data-testid={`accept-${p.proposal_id}`}
                        onClick={() => accept(p.proposal_id)}
                        disabled={Boolean(actionPending)}
                        className="btn-primary !py-2 !px-4 mt-4 text-xs disabled:opacity-30"
                      >
                        Hire {p.artist?.name?.split(" ")[0] || "this artist"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages column */}
          <div className="bg-white p-5 sm:p-8 flex flex-col" data-testid="messages-column" style={{ minHeight: 500 }}>
            <h2 className="font-serif text-3xl tracking-tight mb-6">Messages</h2>
            {isCollector && (
              <div className="mb-5">
                <label className="overline" htmlFor="message-thread">Conversation</label>
                <select
                  id="message-thread"
                  data-testid="message-thread"
                  className="input-luxury mt-2"
                  value={selectedArtistId}
                  onChange={(e) => setSelectedArtistId(e.target.value)}
                >
                  <option value="">Choose an artist</option>
                  {artistOptions.map((option) => (
                    <option key={option.artist_id} value={option.artist_id}>
                      {option.artist?.name || option.artist_name}
                    </option>
                  ))}
                </select>
                {isDemoProject && selectedArtistId && !hasProposalForSelectedArtist && (
                  <button
                    data-testid="message-proposal-shortcut"
                    onClick={() => { setShowProposalForm(true); aiPricing(); }}
                    className="btn-secondary !py-2 !px-4 mt-3 text-xs"
                  >
                    Submit proposal for this artist
                  </button>
                )}
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-5 scroll-hide">
              {messages.filter((message) => !isCollector || message.artist_id === selectedArtistId).length === 0 && (
                <p className="text-sm text-neutral-500">No messages yet. Start the conversation.</p>
              )}
              {messages
                .filter((message) => !isCollector || message.artist_id === selectedArtistId)
                .map((m) => (
                <div key={m.message_id} className="" data-testid={`message-${m.message_id}`}>
                  <div className="overline text-neutral-500">{m.sender_name} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                  <p className="text-sm text-neutral-800 mt-1 leading-relaxed">{m.text}</p>
                </div>
                ))}
              <div ref={msgsEnd} />
            </div>
            <div className="border-t border-neutral-200 pt-4 mt-4 flex gap-2">
              <input
                data-testid="message-input"
                className="input-luxury"
                placeholder="Write a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                data-testid="message-send"
                onClick={send}
                disabled={Boolean(actionPending) || !text.trim() || (isCollector && !selectedArtistId)}
                className="btn-primary !px-4 disabled:opacity-30"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Review form after completion */}
        {project.status === "completed" && isCollector && (
          <ReviewForm projectId={id} artistId={project.hired_artist_id} onDone={load} />
        )}
      </div>
    </div>
  );
}

function ReviewForm({ projectId, artistId, onDone }) {
  const [r, setR] = useState({ communication: 5, quality: 5, timeliness: 5, text: "" });
  const [done, setDone] = useState(false);
  const submit = async () => {
    await http.post("/reviews", { project_id: projectId, artist_id: artistId, ...r });
    setDone(true);
    onDone();
  };
  if (done) return <div className="mt-12 ai-badge">Review submitted — thank you.</div>;
  return (
    <div className="mt-12 border border-neutral-200 bg-white p-8" data-testid="review-form">
      <h2 className="font-serif text-3xl">Leave a review</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        {["communication", "quality", "timeliness"].map((k) => (
          <div key={k}>
            <span className="overline">{k}</span>
            <input
              type="number" min={1} max={5}
              data-testid={`review-${k}`}
              className="input-luxury mt-2"
              value={r[k]}
              onChange={(e) => setR({ ...r, [k]: parseInt(e.target.value || "5") })}
            />
          </div>
        ))}
      </div>
      <textarea
        rows={3}
        data-testid="review-text"
        className="input-luxury mt-4"
        placeholder="What did you love?"
        value={r.text}
        onChange={(e) => setR({ ...r, text: e.target.value })}
      />
      <button data-testid="review-submit" onClick={submit} className="btn-primary mt-4">Submit review</button>
    </div>
  );
}
