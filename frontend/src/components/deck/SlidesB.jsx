import React from "react";
import { Check, Minus } from "lucide-react";
import { Overline, SlideShell, r, Logo } from "./SlideKit";
import { IMAGES } from "../../data/deck";

const H1 = "font-serif-pm font-light tracking-tight text-[#121212] leading-[1.08]";

// ---------- Slide 8: Competition ----------
const compRows = [
  ["Discovery", true, true],
  ["AI Matching", false, true],
  ["Designer Briefs", false, true],
  ["Milestone Workflow", false, true],
  ["Protected Payments", false, true],
];
const Competition = () => (
  <SlideShell testId="slide-8">
    <div {...r(0)} className="reveal"><Overline>Competition</Overline></div>
    <h2 {...r(1)} className={`reveal mt-6 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
      Others help people find art. We help people finish projects.
    </h2>
    <div {...r(2)} className="reveal mt-10 max-w-3xl w-full">
      <div className="grid grid-cols-12 border-b border-black/10 pb-3 text-[11px] uppercase tracking-[0.16em] text-[#8a8a8a]">
        <div className="col-span-6">Capability</div>
        <div className="col-span-3 text-center">Galleries / Marketplaces</div>
        <div className="col-span-3 text-center text-[#b08d2b]">Palette Match</div>
      </div>
      {compRows.map(([label, a, b], i) => (
        <div key={label} {...r(3 + i * 0.5)} className="reveal grid grid-cols-12 items-center py-4 border-b border-black/[0.06]">
          <div className="col-span-6 font-light text-[#1f1f1f]">{label}</div>
          <div className="col-span-3 flex justify-center">
            {a ? <Check className="w-5 h-5 text-[#1f1f1f]" /> : <Minus className="w-5 h-5 text-[#cfcfcf]" />}
          </div>
          <div className="col-span-3 flex justify-center">
            {b ? <Check className="w-5 h-5 text-[#b08d2b]" /> : <Minus className="w-5 h-5 text-[#cfcfcf]" />}
          </div>
        </div>
      ))}
    </div>
    <p {...r(6)} className="reveal mt-7 max-w-2xl font-serif-pm italic text-lg text-[#2c2c2c]">
      “The wedge is not art discovery. It is the managed workflow interior designers need after the client says yes.”
    </p>
  </SlideShell>
);

// ---------- Slide 9: Traction ----------
const Traction = () => (
  <SlideShell testId="slide-9">
    <div {...r(0)} className="reveal"><Overline>Traction</Overline></div>
    <h2 {...r(1)} className={`reveal mt-6 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>Early proof is product-led; the next proof is paid projects.</h2>
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      {[
        ["Product", "Built", ["6-screen commission workflow", "AI brief + artist matching flow", "PDF export and investor analytics"]],
        ["Reliability", "Proven", ["19/19 backend tests passing", "Session + slide dwell tracking", "Per-investor share links"]],
        ["Commercial Proof", "Market Validation", ["50 active interior designers", "100 artist roster", "First 25 paid commissions"]],
      ].map(([t, tag, items], i) => (
        <div key={t} {...r(2 + i)} className="reveal">
          <div className="gold-rule" />
          <div className="mt-5">
            <h3 className="font-serif-pm text-xl text-[#1f1f1f]">{t}</h3>
            <span className="mt-3 inline-flex w-fit border border-[#b08d2b]/30 bg-[#fbf8ef] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a6f22]">
              {tag}
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {items.map((it) => (
              <li key={it} className="text-sm font-light text-[#5c5c5c] flex gap-2">
                <span className="text-[#b08d2b]">—</span>{it}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </SlideShell>
);

// ---------- Slide 10: Founder ----------
const Founder = () => (
  <SlideShell testId="slide-10">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div {...r(0)} className="reveal lg:col-span-4">
        <div className="gallery-frame p-3">
          <div className="bg-gradient-to-br from-[#efece6] to-[#ddd7cc] aspect-[4/5] flex items-center justify-center">
            <span className="text-xs uppercase tracking-[0.2em] text-[#a99c7e]">Headshot</span>
          </div>
        </div>
        <div className="brass-plaque mt-4 px-4 py-1.5 text-[10px] font-medium uppercase inline-block">Suzanne Chancy · Founder</div>
      </div>
      <div className="lg:col-span-8">
        <div {...r(1)} className="reveal"><Overline>Founder</Overline></div>
        <h2 {...r(2)} className={`reveal mt-6 text-3xl sm:text-4xl ${H1}`}>A founder native to art, luxury, and presentation.</h2>
        <p {...r(3)} className="reveal mt-7 max-w-2xl text-lg font-light leading-relaxed text-[#5c5c5c]">
          Suzanne Chancy has worked across luxury retail, visual merchandising, art
          education, and design, where taste, trust, client presentation, and vendor
          coordination decide whether a project closes.
        </p>
        <div {...r(4)} className="reveal mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl">
          {[
            ["Taste", "Understands how high-end clients evaluate visual work."],
            ["Supply", "Can speak credibly to artists and protect their economics."],
            ["Workflow", "Has seen where sourcing, approvals, and handoffs break."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="gold-rule" />
              <h3 className="font-serif-pm text-lg mt-4 text-[#1f1f1f]">{t}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-[#5c5c5c]">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SlideShell>
);

// ---------- Slide 11: Roadmap ----------
const roadmap = [
  ["0-30d", "Recruit 25 design studios"],
  ["60d", "100 artists onboarded"],
  ["90d", "First 10 paid commissions"],
  ["120d", "50 active designers"],
  ["180d", "25 paid commissions"],
];
const Roadmap = () => (
  <SlideShell testId="slide-11">
    <div {...r(0)} className="reveal"><Overline>Roadmap</Overline></div>
    <h2 {...r(1)} className={`reveal mt-6 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>Milestones that de-risk the round.</h2>
    <div className="mt-14 relative">
      <div className="absolute left-0 right-0 top-[7px] h-px bg-black/10 hidden md:block" />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {roadmap.map(([q, t], i) => (
          <div key={q + t} {...r(2 + i * 0.5)} className="reveal relative">
            <span className="block w-3.5 h-3.5 rotate-45 border border-[#b08d2b] bg-white mb-6" />
            <div className="font-serif-pm text-2xl text-[#b08d2b]">{q}</div>
            <div className="mt-2 text-sm font-light text-[#5c5c5c]">{t}</div>
          </div>
        ))}
      </div>
    </div>
  </SlideShell>
);

// ---------- Slide 12: The Ask ----------
const Ask = () => (
  <SlideShell testId="slide-12" light className="items-center text-center">
    <div {...r(0)} className="reveal"><Overline>The Ask</Overline></div>
    <div {...r(1)} className="reveal mt-6 font-serif-pm font-light text-[#121212] leading-none text-6xl sm:text-7xl lg:text-8xl">
      $250<span className="text-[#b08d2b]">K</span>
    </div>
    <p {...r(2)} className="reveal mt-5 text-sm uppercase tracking-[0.22em] text-[#8a8a8a]">Pre-seed to prove paid designer-led commissions</p>
    <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto text-left">
      <div {...r(3)} className="reveal">
        <h3 className="font-serif-pm text-xl text-[#1f1f1f]">Use of Funds</h3>
        <div className="thin-divider my-4" />
        <ul className="space-y-2 text-sm font-light text-[#5c5c5c]">
          {["45% product + AI matching", "30% designer acquisition", "15% artist supply", "10% infrastructure + analytics"].map((x) => (
            <li key={x} className="flex gap-2"><span className="text-[#b08d2b]">—</span>{x}</li>
          ))}
        </ul>
      </div>
      <div {...r(4)} className="reveal">
        <h3 className="font-serif-pm text-xl text-[#1f1f1f]">Milestone Targets</h3>
        <div className="thin-divider my-4" />
        <ul className="space-y-2 text-sm font-light text-[#5c5c5c]">
          {["50 active interior designers", "100 vetted artists", "25 paid commissions", "$125K GMV at $5K AOV"].map((x) => (
            <li key={x} className="flex gap-2"><span className="text-[#b08d2b]">—</span>{x}</li>
          ))}
        </ul>
      </div>
    </div>
  </SlideShell>
);

// ---------- Slide 13: Close ----------
const Close = ({ onDownload }) => (
  <div className="slide-root grid grid-cols-1 lg:grid-cols-2" data-testid="slide-13">
    <div className="flex flex-col justify-center px-7 py-12 sm:px-12 md:px-16 lg:px-20 arch-light">
      <div {...r(0)} className="reveal"><Logo /></div>
      <h2 {...r(1)} className={`reveal mt-10 text-3xl sm:text-4xl lg:text-5xl ${H1}`}>
        Let’s build the future of commissioned art.
      </h2>
      <div {...r(2)} className="reveal gold-rule mt-8" />
      <div {...r(3)} className="reveal mt-9 space-y-1.5">
        <div className="font-serif-pm text-lg text-[#1f1f1f]">Suzanne Chancy</div>
        <div className="text-sm text-[#8a8a8a]">Founder, Palette Match</div>
        <a href="mailto:investors@palette-match.ai" className="block text-sm text-[#b08d2b] hover:underline mt-3" data-testid="contact-email">investors@palette-match.ai</a>
        <a href="https://palette-match.ai" target="_blank" rel="noreferrer" className="block text-sm text-[#b08d2b] hover:underline" data-testid="contact-website">palette-match.ai</a>
      </div>
      {onDownload && (
        <button onClick={onDownload} data-testid="deck-pdf-download-btn"
          className="reveal mt-10 self-start bg-black text-white px-8 py-4 text-xs tracking-[0.18em] uppercase hover:bg-neutral-800 transition-colors duration-300"
          style={{ animationDelay: "0.5s" }}>
          Download Deck (PDF)
        </button>
      )}
    </div>
    <div className="relative min-h-[34vh] lg:min-h-0">
      <img src={IMAGES.close} alt="Gallery" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
    </div>
  </div>
);

export const SLIDES_B = [Competition, Traction, Founder, Roadmap, Ask, Close];
