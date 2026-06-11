import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { startLogin } from "@/lib/auth";

const MEDIUMS = ["Oil", "Acrylic", "Watercolor", "Photography", "Digital", "Mixed media"];
const STYLES = ["Abstract", "Impressionist", "Realist", "Minimalist", "Contemporary", "Classical", "Botanical", "Coastal"];
const TIMELINES = ["1–4 weeks", "1–2 months", "2–3 months", "Flexible"];
const BUDGETS = [500, 1500, 3000, 5000, 10000];
const DRAFT_KEY = "palette_match_intake_draft";
const EMPTY_FORM = {
  title: "",
  description: "",
  size: "",
  medium: "",
  budget: 3000,
  timeline: "",
  location: "",
  colors: "",
  style: "",
  inspiration_urls: [],
  room_url: "",
};

export default function IntakeWizard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => {
    try {
      return { ...EMPTY_FORM, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "{}") };
    } catch {
      return EMPTY_FORM;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    if (user?.role === "artist") nav("/dashboard", { replace: true });
  }, [nav, user]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const steps = ["Vision", "Form", "Budget", "Style", "Review"];

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.description.trim().length > 10;
    if (step === 1) return form.size.trim() && form.medium;
    if (step === 2) return form.budget && form.timeline;
    return true;
  };

  const submit = async () => {
    if (!user) {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      startLogin("/intake");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data: proj } = await http.post("/projects", form);
      // Kick off match
      await http.post(`/projects/${proj.project_id}/match`);
      sessionStorage.removeItem(DRAFT_KEY);
      nav(`/project/${proj.project_id}/matches`);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.detail || "We could not create your commission. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16" data-testid="intake-wizard">
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-12 overline text-neutral-500">
          <span data-testid="step-indicator">{String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>
          <span>{steps[step]}</span>
        </div>
        <div className="gold-rule mb-12"></div>
        {error && (
          <div className="border border-neutral-300 bg-white p-4 mb-8 text-sm text-neutral-700" role="alert">
            {error}
          </div>
        )}

        {step === 0 && (
          <div data-testid="step-vision">
            <span className="overline text-neutral-500">Step one</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-3">What artwork are you imagining?</h2>
            <p className="text-neutral-600 mt-3">A working title and a short description. Be evocative.</p>
            <div className="mt-10 space-y-6">
              <div>
                <label className="overline">Title</label>
                <input
                  data-testid="input-title"
                  className="input-luxury mt-2"
                  placeholder="e.g. Coastal sunrise for the foyer"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className="overline">Describe your vision</label>
                <textarea
                  data-testid="input-description"
                  rows={6}
                  className="input-luxury mt-2"
                  placeholder="I want a 36x48 coastal oil painting for my Naples condo, soft morning light, blues and creams…"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div data-testid="step-form">
            <span className="overline text-neutral-500">Step two</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-3">Form & medium.</h2>
            <p className="text-neutral-600 mt-3">Size and material define the experience.</p>
            <div className="mt-10 space-y-6">
              <div>
                <label className="overline">Size</label>
                <input
                  data-testid="input-size"
                  className="input-luxury mt-2"
                  placeholder="36 x 48 inches"
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                />
              </div>
              <div>
                <label className="overline">Medium</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 mt-2">
                  {MEDIUMS.map((m) => (
                    <button
                      key={m}
                      data-testid={`medium-${m}`}
                      onClick={() => set("medium", m)}
                      className={`bg-white py-4 text-sm transition-all ${form.medium === m ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"}`}
                      style={form.medium === m ? { background: "#111", color: "#fff" } : {}}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="overline">Location for delivery (optional)</label>
                <input
                  data-testid="input-location"
                  className="input-luxury mt-2"
                  placeholder="Naples, FL"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div data-testid="step-budget">
            <span className="overline text-neutral-500">Step three</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-3">Budget & timeline.</h2>
            <p className="text-neutral-600 mt-3">Set realistic guardrails. Our AI will only invite artists who can deliver inside them.</p>
            <div className="mt-10 space-y-8">
              <div>
                <label className="overline">Budget (USD)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-neutral-200 border border-neutral-200 mt-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b}
                      data-testid={`budget-${b}`}
                      onClick={() => set("budget", b)}
                      className="bg-white py-4 text-sm"
                      style={form.budget === b ? { background: "#111", color: "#fff" } : {}}
                    >
                      ${b.toLocaleString()}+
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="overline">Custom</span>
                  <input
                    type="number"
                    data-testid="input-budget-custom"
                    className="input-luxury max-w-xs"
                    value={form.budget}
                    onChange={(e) => set("budget", parseInt(e.target.value || "0", 10))}
                  />
                </div>
              </div>
              <div>
                <label className="overline">Timeline</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200 mt-2">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      data-testid={`timeline-${t}`}
                      onClick={() => set("timeline", t)}
                      className="bg-white py-4 text-sm"
                      style={form.timeline === t ? { background: "#111", color: "#fff" } : {}}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div data-testid="step-style">
            <span className="overline text-neutral-500">Step four</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-3">Style & palette.</h2>
            <p className="text-neutral-600 mt-3">Help us refine the match.</p>
            <div className="mt-10 space-y-6">
              <div>
                <label className="overline">Style</label>
                <div className="flex flex-wrap gap-px bg-neutral-200 border border-neutral-200 mt-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      data-testid={`style-${s}`}
                      onClick={() => set("style", s)}
                      className="bg-white py-3 px-5 text-sm"
                      style={form.style === s ? { background: "#111", color: "#fff" } : {}}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="overline">Preferred colors / palette</label>
                <input
                  data-testid="input-colors"
                  className="input-luxury mt-2"
                  placeholder="Soft blues, cream, warm sand"
                  value={form.colors}
                  onChange={(e) => set("colors", e.target.value)}
                />
              </div>
              <div>
                <label className="overline">Inspiration URL (optional)</label>
                <input
                  data-testid="input-inspiration"
                  className="input-luxury mt-2"
                  placeholder="https://…"
                  onChange={(e) => set("inspiration_urls", e.target.value ? [e.target.value] : [])}
                />
              </div>
              <div>
                <label className="overline">Photo of the room (optional)</label>
                <input
                  data-testid="input-room"
                  className="input-luxury mt-2"
                  placeholder="https://…"
                  value={form.room_url}
                  onChange={(e) => set("room_url", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div data-testid="step-review">
            <span className="ai-badge"><Sparkles size={12} /> AI will analyze your brief</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-4">Review your brief.</h2>
            <p className="text-neutral-600 mt-3">We'll surface five artists whose work, budget, and availability match.</p>
            <div className="mt-10 border border-neutral-200 bg-white p-8 space-y-4">
              <div><span className="overline">Title</span><div className="font-serif text-2xl mt-1">{form.title}</div></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><span className="overline">Size</span><div className="mt-1">{form.size}</div></div>
                <div><span className="overline">Medium</span><div className="mt-1">{form.medium}</div></div>
                <div><span className="overline">Budget</span><div className="mt-1">${form.budget?.toLocaleString()}</div></div>
                <div><span className="overline">Timeline</span><div className="mt-1">{form.timeline}</div></div>
                <div><span className="overline">Style</span><div className="mt-1">{form.style || "—"}</div></div>
                <div><span className="overline">Location</span><div className="mt-1">{form.location || "—"}</div></div>
              </div>
              <div><span className="overline">Description</span>
                <p className="mt-1 text-neutral-700 leading-relaxed">{form.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-14">
          <button
            data-testid="back-btn"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="btn-secondary disabled:opacity-30"
          >
            <ArrowLeft size={14} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button
              data-testid="next-btn"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext()}
              className="btn-primary disabled:opacity-30"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button
              data-testid="submit-brief-btn"
              onClick={submit}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? <><Loader2 className="animate-spin" size={14} /> Matching…</> : <>Find my artists <Sparkles size={14} /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
