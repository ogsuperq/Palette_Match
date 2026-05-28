import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { Send, CheckCircle2, Sparkles, Loader2 } from "lucide-react";

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
  const msgsEnd = useRef(null);

  const isArtist = user?.role === "artist";
  const isCollector = project && project.collector_id === user?.user_id;

  const load = async () => {
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
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);
  useEffect(() => {
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [id]);
  useEffect(() => { msgsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    await http.post("/messages", { project_id: id, text });
    setText("");
    load();
  };

  const submitProposal = async () => {
    setSubmitting(true);
    try {
      await http.post("/proposals", { project_id: id, ...prop, references: [] });
      setShowProposalForm(false);
      load();
    } finally { setSubmitting(false); }
  };

  const accept = async (proposalId) => {
    if (!window.confirm("Accept this proposal? A 50% deposit will be held in escrow (mock).")) return;
    await http.post(`/proposals/${proposalId}/accept`);
    load();
  };

  const release = async () => {
    if (!window.confirm("Release all funds to the artist?")) return;
    await http.post(`/projects/${id}/release-funds`);
    load();
  };

  const complete = async () => {
    await http.post(`/projects/${id}/complete`);
    load();
  };

  const aiPricing = async () => {
    setPricing("loading");
    const { data } = await http.post("/ai/pricing", {
      medium: project.medium, size: project.size,
      description: project.description,
    });
    setPricing(data);
    setProp((p) => ({ ...p, price: data.recommended }));
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar /><div className="p-16 overline text-neutral-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-12" data-testid="project-detail">
        {/* Header */}
        <div className="mb-10">
          <span className="overline text-neutral-500">{project.status?.replace("_", " ")}</span>
          <h1 className="font-serif text-5xl tracking-tighter mt-3">{project.title}</h1>
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
                <button data-testid="mark-complete" onClick={complete} className="btn-secondary">
                  Mark artwork complete
                </button>
              )}
              {isCollector && project.status === "awaiting_approval" && escrow.status === "deposit_held" && (
                <button data-testid="release-funds" onClick={release} className="btn-primary">
                  <CheckCircle2 size={14} /> Approve & release funds
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
          <div className="lg:col-span-2 bg-white p-8" data-testid="proposals-column">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-3xl tracking-tight">Proposals</h2>
              {isCollector && (
                <Link to={`/project/${id}/matches`} className="overline text-neutral-500 hover:text-neutral-900">
                  View AI matches →
                </Link>
              )}
              {isArtist && !proposals.find((p) => p.artist_id === user.user_id) && project.status !== "completed" && (
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
                  <div className="grid grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 mt-4">
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
                <div className="grid grid-cols-2 gap-4 mt-4">
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
                    <div className="flex justify-between items-start">
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
                        className="btn-primary !py-2 !px-4 mt-4 text-xs"
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
          <div className="bg-white p-8 flex flex-col" data-testid="messages-column" style={{ minHeight: 500 }}>
            <h2 className="font-serif text-3xl tracking-tight mb-6">Messages</h2>
            <div className="flex-1 overflow-y-auto space-y-5 scroll-hide">
              {messages.length === 0 && (
                <p className="text-sm text-neutral-500">No messages yet. Start the conversation.</p>
              )}
              {messages.map((m) => (
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
              <button data-testid="message-send" onClick={send} className="btn-primary !px-4">
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
      <div className="grid grid-cols-3 gap-6 mt-6">
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
