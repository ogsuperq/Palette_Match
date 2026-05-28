import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { ArrowRight, Sparkles, ShieldCheck, Brush } from "lucide-react";

const HERO = "https://static.prod-images.emergentagent.com/jobs/0b389406-3f61-49d8-b80a-afc8d5cab5c0/images/d166210cfad3af7fc357c0b1aae28cf1ff88c1d67b5ac31cd378ff8f8f2eea38.png";

export default function LandingPage() {
  const [artists, setArtists] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    http.get("/artists").then((r) => setArtists(r.data.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-end" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 pb-20 pt-32 w-full">
          <div className="max-w-2xl">
            <span className="overline text-neutral-700">An AI-powered art concierge</span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] mt-6 text-neutral-900">
              Describe your dream artwork.<br />
              <em className="not-italic text-neutral-600">Meet the perfect artist.</em>
            </h1>
            <p className="font-sans text-base sm:text-lg text-neutral-700 mt-8 max-w-xl leading-relaxed">
              Palette Match pairs collectors with vetted artists for custom commissioned work — guided by an AI concierge, secured by escrow, finished to your standard.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                data-testid="hero-start-cta"
                onClick={() => nav("/intake")}
                className="btn-primary"
              >
                Start a commission <ArrowRight size={16} />
              </button>
              <Link to="/artists" data-testid="hero-browse-cta" className="btn-secondary">
                Browse artists
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24" data-testid="how-it-works">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
          <div className="lg:col-span-7">
            <span className="overline text-neutral-500">The process</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-4 leading-tight">
              From a sentence to a signed canvas — in nine considered steps.
            </h2>
          </div>
          <p className="lg:col-span-5 text-neutral-600">
            A guided brief, AI-matched shortlist, side-by-side proposals, and milestone-based escrow. The way commissioning art should have always felt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
          {[
            { n: "01", t: "Describe your vision", d: "A guided three-minute brief. Size, medium, palette, room, story." },
            { n: "02", t: "AI matches your shortlist", d: "We surface five artists whose work, budget, and timeline fit." },
            { n: "03", t: "Compare proposals", d: "Concept, price, and timeline side-by-side. Hire when you're ready." },
          ].map((s) => (
            <div key={s.n} className="bg-white p-10">
              <div className="font-serif text-3xl text-neutral-300">{s.n}</div>
              <h3 className="font-serif text-2xl mt-6">{s.t}</h3>
              <p className="text-neutral-600 mt-3 text-sm leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED ARTISTS */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16 border-t border-neutral-200" data-testid="featured-artists">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="overline text-neutral-500">Now booking commissions</span>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter mt-4">Curated artists</h2>
          </div>
          <Link to="/artists" className="overline text-neutral-700 hover:text-neutral-900">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200">
          {artists.map((a) => (
            <Link
              key={a.user_id}
              to={`/artist/${a.user_id}`}
              data-testid={`featured-artist-${a.user_id}`}
              className="bg-white group"
            >
              <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                {a.portfolio?.[0]?.url && (
                  <img
                    src={a.portfolio[0].url}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-90 transition-all duration-500"
                  />
                )}
              </div>
              <div className="p-6">
                <div className="overline text-neutral-500">{a.location}</div>
                <h3 className="font-serif text-2xl mt-2">{a.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">{a.headline}</p>
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-neutral-100">
                  <span className="text-xs text-neutral-500">From ${a.price_low?.toLocaleString()}</span>
                  <span className="text-xs text-neutral-900">★ {a.rating?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 border-t border-neutral-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { i: Sparkles, t: "AI concierge", d: "Claude Sonnet 4.5 reads your brief and pairs you with artists whose body of work — not their resume — fits." },
            { i: ShieldCheck, t: "Escrow protected", d: "Funds are held safely. Released only when you approve the finished work." },
            { i: Brush, t: "Real artists only", d: "Every artist is invited and reviewed. No prints, no resellers, no surprises." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t}>
              <Icon className="w-6 h-6 text-neutral-900" strokeWidth={1.2} />
              <h3 className="font-serif text-2xl mt-6">{t}</h3>
              <p className="text-neutral-600 mt-3 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-900 text-white py-24" data-testid="footer-cta">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tighter leading-tight">
            Tell us about the artwork you're imagining.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              data-testid="footer-cta-start"
              onClick={() => nav("/intake")}
              className="btn-primary !bg-white !text-neutral-900 !border-white hover:!bg-transparent hover:!text-white"
            >
              Begin your brief
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 py-10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row justify-between text-xs text-neutral-500">
          <span>© 2026 Palette Match — Curated commissions, signed by the artist.</span>
          <span className="overline">v0.1</span>
        </div>
      </footer>
    </div>
  );
}
