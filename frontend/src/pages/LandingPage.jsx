import React, { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { http } from "@/lib/api";

const STEPS = [
  {
    number: "01",
    title: "Describe your vision",
    detail: "Share the mood, palette, dimensions, and story behind the piece you imagine.",
  },
  {
    number: "02",
    title: "Get matched with artists",
    detail: "Discover artists whose style, medium, budget, and availability align with your brief.",
  },
  {
    number: "03",
    title: "Review proposals",
    detail: "Compare thoughtful concepts, timelines, and pricing in one considered place.",
  },
  {
    number: "04",
    title: "Commission with confidence",
    detail: "Choose the right artist and move forward with clarity from first sketch to final work.",
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const submitWaitlist = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !event.currentTarget.checkValidity()) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      await http.post("/waitlist", {
        email: normalizedEmail,
        source_page: window.location.pathname || "/",
      });
      setEmail("");
      setStatus("success");
    } catch {
      setStatus("submit-error");
    }
  };

  return (
    <main className="launch-page">
      <header className="launch-header">
        <a href="#top" className="launch-brand" aria-label="Palette Match home">
          Palette Match
        </a>
        <a href="#waitlist" className="launch-header-link">
          Join the beta <ArrowRight size={14} aria-hidden="true" />
        </a>
      </header>

      <section id="top" className="launch-hero">
        <div className="launch-art" aria-hidden="true">
          <div className="launch-art-sun" />
          <div className="launch-art-arch" />
          <div className="launch-art-canvas">
            <span />
            <span />
            <span />
          </div>
          <p>Made for the work you cannot find anywhere else.</p>
        </div>

        <div className="launch-hero-copy">
          <div className="launch-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Private beta opening soon
          </div>
          <h1>
            Describe your dream artwork.
            <em>Meet the perfect artist.</em>
          </h1>
          <p className="launch-subheadline">
            An AI-powered art commission platform connecting collectors, homeowners, and
            interior designers with artists who can bring custom artwork to life.
          </p>

          <form id="waitlist" className="launch-form" onSubmit={submitWaitlist} noValidate>
            <label htmlFor="waitlist-email">Email address</label>
            <div className="launch-form-row">
              <input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setStatus("idle");
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                aria-describedby="waitlist-message"
              />
              <button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Joining…" : "Join the beta waitlist"} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            <p
              id="waitlist-message"
              className={`launch-form-message launch-form-message--${status}`}
              aria-live="polite"
            >
              {status === "success" && (
                <>
                  <Check size={15} aria-hidden="true" /> You are on the list. We will be in
                  touch as beta access opens.
                </>
              )}
              {status === "submit-error" && "We could not save your email. Please try again in a moment."}
              {status === "error" && "Enter a valid email address to join the waitlist."}
              {status === "idle" && "Early access updates only. No noise."}
            </p>
          </form>
        </div>
      </section>

      <section className="launch-process" aria-labelledby="process-title">
        <div className="launch-section-intro">
          <span>The commission, considered</span>
          <h2 id="process-title">How it works</h2>
          <p>
            A clearer path from the first idea to an original piece that belongs in your
            space and your story.
          </p>
        </div>
        <div className="launch-steps">
          {STEPS.map((step) => (
            <article key={step.number} className="launch-step">
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="launch-trust">
        <p>Built for</p>
        <h2>Custom art, interior design projects, and meaningful commissions.</h2>
      </section>

      <footer className="launch-footer">
        <span>© Palette Match</span>
        <span>Original work begins with a conversation.</span>
      </footer>
    </main>
  );
}
