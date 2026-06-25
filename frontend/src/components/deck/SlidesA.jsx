import React, { useState } from "react";
import { Overline, SlideShell, r, Logo } from "./SlideKit";
import { IMAGES, WORKFLOW } from "../../data/deck";

const H1 = "font-serif-pm font-light tracking-tight text-[#121212] leading-[1.08]";

// ---------- Slide 1: Vision ----------
const Vision = () => (
  <div className="slide-root grid grid-cols-1 lg:grid-cols-2 arch-light" data-testid="slide-1">
    <div className="flex flex-col justify-center px-7 py-12 sm:px-12 md:px-16 lg:px-20 order-2 lg:order-1">
      <div {...r(0)}><Logo /></div>
      <div {...r(1)} className="mt-10 reveal">
        <Overline>Pre-Seed · $250,000</Overline>
      </div>
      <h1 {...r(2)} className={`reveal mt-6 text-4xl sm:text-5xl lg:text-6xl ${H1}`}>
        The commissioning OS for interior designers sourcing original art.
      </h1>
      <div {...r(3)} className="reveal gold-rule mt-8" />
      <p {...r(4)} className="reveal mt-7 max-w-md text-base md:text-lg font-light leading-relaxed text-[#5c5c5c]">
        Palette Match helps design studios turn client briefs into matched artists,
        managed milestones, secure payments, and finished commissioned pieces.
      </p>
    </div>
    <div className="relative order-1 lg:order-2 min-h-[34vh] lg:min-h-0">
      <img src={IMAGES.hero} alt="Commissioned artwork in a luxury interior"
        className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 lg:from-white/20 to-transparent" />
    </div>
  </div>
);

// ---------- Slide 2: Problem ----------
const Problem = () => (
  <SlideShell testId="slide-2">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        <div {...r(0)} className="reveal"><Overline>The Problem</Overline></div>
        <h2 {...r(1)} className={`reveal mt-6 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
          Interior designers still commission art through spreadsheets, DMs, and trust.
        </h2>
        <div {...r(2)} className="reveal thin-divider my-9" />
        <div className="space-y-6">
          {[
            ["Sourcing", "5-10 hours disappear into Instagram, gallery calls, PDFs, and cold outreach before a viable shortlist exists."],
            ["Workflow", "Briefs, approvals, timelines, files, and client feedback live in separate tools with no project record."],
            ["Risk", "Budgets, deposits, scope changes, and delivery dates stay opaque until the project is already exposed."],
          ].map(([k, v], i) => (
            <div key={k} {...r(3 + i)} className="reveal flex gap-5">
              <span className="font-serif-pm text-[#b08d2b] text-xl w-28 shrink-0">{k}</span>
              <span className="text-[#5c5c5c] font-light">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div {...r(2)} className="reveal lg:col-span-5">
        <div className="gallery-frame p-3">
          <img src={IMAGES.problem} alt="Fragmented process"
            className="w-full aspect-square object-cover" crossOrigin="anonymous" />
        </div>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-[#8a8a8a]">The status quo — broken &amp; disconnected</p>
      </div>
    </div>
  </SlideShell>
);

// ---------- Slide 3: Why Now ----------
const WhyNow = () => (
  <SlideShell testId="slide-3" light className="items-center text-center">
    <div {...r(0)} className="reveal"><Overline>Why Now</Overline></div>
    <h2 {...r(1)} className={`reveal mt-6 max-w-3xl mx-auto text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
      Design procurement is moving online, but custom art is still offline.
    </h2>
    <div {...r(2)} className="reveal gold-rule mx-auto mt-9" />
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 max-w-5xl mx-auto">
      {[
        ["01", "Visual AI is Useful", "Style, palette, subject, and space constraints can now be translated into structured artist matching."],
        ["02", "Design Workflows are Remote", "Studios already approve furniture, fabric, and renderings online; commissioned art is the laggard."],
        ["03", "Clients Want Originals", "High-end residential and hospitality projects need differentiated pieces, not mass-market wall decor."],
      ].map(([n, t, d], i) => (
        <div key={n} {...r(3 + i)} className="reveal">
          <div className="font-serif-pm text-[#b08d2b] text-3xl">{n}</div>
          <div className="thin-divider my-5" />
          <h3 className="font-serif-pm text-xl text-[#1f1f1f]">{t}</h3>
          <p className="mt-3 text-sm font-light text-[#5c5c5c] leading-relaxed">{d}</p>
        </div>
      ))}
    </div>
  </SlideShell>
);

// ---------- Slide 4: Solution ----------
const Solution = () => (
  <SlideShell testId="slide-4">
    <div {...r(0)} className="reveal"><Overline>The Solution</Overline></div>
    <h2 {...r(1)} className={`reveal mt-6 max-w-3xl text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
      One workflow from client brief to installed artwork.
    </h2>
    <p {...r(2)} className="reveal mt-6 max-w-xl text-base md:text-lg font-light text-[#5c5c5c]">
      Palette Match gives interior designers a purpose-built commissioning layer:
      AI-assisted artist matching, project controls, collaboration, and payments.
    </p>
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        ["AI Matching", "Shortlists artists against style, palette, budget, timeline, and project context."],
        ["Commission Control", "Briefs, milestones, approvals, and timelines in one client-ready record."],
        ["Collaboration", "Designer, artist, and client feedback stay attached to the commission."],
        ["Payments", "15% platform fee with protected deposits and milestone-based releases."],
      ].map(([t, d], i) => (
        <div key={t} {...r(3 + i)} className="reveal">
          <div className="gold-rule" />
          <h3 className="font-serif-pm text-xl mt-5 text-[#1f1f1f]">{t}</h3>
          <p className="mt-3 text-sm font-light text-[#5c5c5c] leading-relaxed">{d}</p>
        </div>
      ))}
    </div>
  </SlideShell>
);

// ---------- Slide 5: Product ----------
const Product = () => {
  const [flipped, setFlipped] = useState({});
  const toggle = (i) => setFlipped((f) => ({ ...f, [i]: !f[i] }));
  return (
    <SlideShell testId="slide-5" className="py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div {...r(0)} className="reveal"><Overline>Product · Commission Workflow</Overline></div>
          <h2 {...r(1)} className={`reveal mt-4 text-3xl sm:text-4xl ${H1}`}>A working MVP around the designer workflow.</h2>
        </div>
        <p {...r(1)} className="reveal text-sm font-light text-[#8a8a8a] max-w-xs">
          Six production screens move a designer from client vision to budget, style, AI brief, and artist matches.
        </p>
      </div>
      <div className="mt-9 grid grid-cols-2 lg:grid-cols-3 gap-5">
        {WORKFLOW.map((w, i) => (
          <div key={w.step} {...r(2 + i * 0.3)} className="reveal">
            <div className="gallery-frame p-2">
              <div
                onClick={() => toggle(i)}
                data-testid={`workflow-tile-${i}`}
                className={`flip-card aspect-[16/10] ${flipped[i] ? "flipped" : ""}`}
              >
                <div className="flip-inner">
                  <div className="flip-front bg-gradient-to-br from-[#f6f4ef] to-[#ece8df] flex flex-col items-center justify-center text-center px-3">
                    <span className="font-serif-pm text-[#b08d2b] text-lg">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mt-1 text-xs uppercase tracking-[0.16em] text-[#5c5c5c]">{w.step}</span>
                    <span className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#b3b3b3]">
                      {w.img ? "tap to view" : "coming soon"}
                    </span>
                  </div>
                  <div className="flip-back bg-white flex items-center justify-center">
                    {w.img ? (
                      <img src={w.img} alt={w.step} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center px-3">
                        <span className="font-serif-pm text-[#b08d2b] text-lg">06</span>
                        <span className="block mt-1 text-xs uppercase tracking-[0.16em] text-[#5c5c5c]">{w.step}</span>
                        <span className="block mt-2 text-[9px] uppercase tracking-[0.18em] text-[#b3b3b3]">screen in progress</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div {...r(5)} className="reveal mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-light text-[#5c5c5c]">
        {["6 workflow screens live", "19/19 backend tests passing", "PDF export + investor analytics built"].map((x) => (
          <div key={x} className="flex gap-2"><span className="text-[#b08d2b]">—</span>{x}</div>
        ))}
      </div>
    </SlideShell>
  );
};

// ---------- Slide 6: Market ----------
const Market = () => (
  <SlideShell testId="slide-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
      <div>
        <div {...r(0)} className="reveal"><Overline>Market Opportunity</Overline></div>
        <h2 {...r(1)} className={`reveal mt-6 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
          Start with the buyer who commissions repeatedly.
        </h2>
        <div className="mt-9 space-y-7">
          {[
            ["Wedge", "Interior Designers", "50 active designers is the first fundable milestone; they buy for many clients, not one home."],
            ["Beachhead", "$5K Avg. Commission", "At a 15% fee, each completed project creates $750 in Palette Match revenue."],
            ["Expansion", "Hospitality + Commercial", "The same workflow scales into multi-piece projects once supply and trust are proven."],
          ].map(([p, t, d], i) => (
            <div key={p} {...r(2 + i)} className="reveal flex gap-5">
              <span className="font-serif-pm text-[#b08d2b] text-lg w-20 shrink-0">{p}</span>
              <div>
                <div className="text-[#1f1f1f]">{t}</div>
                <div className="text-sm font-light text-[#8a8a8a]">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div {...r(2)} className="reveal flex justify-center">
        <svg viewBox="0 0 420 420" className="w-full max-w-md">
          {[200, 140, 78].map((rad, i) => (
            <circle key={rad} cx="210" cy="210" r={rad} fill="none"
              stroke={i === 2 ? "#b08d2b" : "rgba(0,0,0,0.18)"} strokeWidth={i === 2 ? 1.6 : 1} />
          ))}
          <text x="210" y="34" textAnchor="middle" className="font-sans-pm" fontSize="11" letterSpacing="2" fill="#8a8a8a">COMMERCIAL + CORPORATE</text>
          <text x="210" y="104" textAnchor="middle" fontSize="11" letterSpacing="2" fill="#8a8a8a">HOSPITALITY + LUXURY RESI</text>
          <text x="210" y="196" textAnchor="middle" className="font-serif-pm" fontSize="15" fill="#b08d2b">50 Active</text>
          <text x="210" y="216" textAnchor="middle" className="font-serif-pm" fontSize="15" fill="#b08d2b">Interior</text>
          <text x="210" y="236" textAnchor="middle" className="font-serif-pm" fontSize="15" fill="#b08d2b">Designers</text>
        </svg>
      </div>
    </div>
  </SlideShell>
);

// ---------- Slide 7: Business Model ----------
const Node = ({ title, sub, gold }) => (
  <div className={`px-6 py-5 border ${gold ? "border-[#b08d2b] bg-[#fbf8ef]" : "border-black/10 bg-white"} text-center min-w-[150px]`}>
    <div className="font-serif-pm text-lg text-[#1f1f1f]">{title}</div>
    {sub && <div className="text-xs mt-1 text-[#8a8a8a] uppercase tracking-[0.12em]">{sub}</div>}
  </div>
);
const Business = () => (
  <SlideShell testId="slide-7">
    <div {...r(0)} className="reveal"><Overline>Business Model</Overline></div>
    <h2 {...r(1)} className={`reveal mt-6 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
      Marketplace revenue tied to completed commissions.
    </h2>
    <div {...r(2)} className="reveal mt-12 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
      <Node title="Interior Designer" sub="client budget" />
      <span className="text-[#b08d2b] text-2xl">→</span>
      <Node title="Palette Match" sub="processes · 15% fee" gold />
      <span className="text-[#b08d2b] text-2xl">→</span>
      <Node title="Artist" sub="milestone payout" />
    </div>
    <div {...r(3)} className="reveal mt-12 max-w-2xl mx-auto w-full border-y border-black/10 py-7 grid grid-cols-3 text-center">
      {[
        ["$5,000", "Commission"],
        ["$750", "Palette Match (15%)"],
        ["$4,250", "Artist receives"],
      ].map(([v, l], i) => (
        <div key={l}>
          <div className={`font-serif-pm text-2xl md:text-3xl ${i === 1 ? "text-[#b08d2b]" : "text-[#121212]"}`}>{v}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#8a8a8a]">{l}</div>
        </div>
      ))}
    </div>
    <p {...r(4)} className="reveal mt-7 mx-auto max-w-2xl text-center text-sm font-light leading-relaxed text-[#5c5c5c]">
      First target: prove repeatable designer-led projects before adding subscriptions,
      trade pricing, or procurement tools.
    </p>
  </SlideShell>
);

export const SLIDES_A = [Vision, Problem, WhyNow, Solution, Product, Market, Business];
