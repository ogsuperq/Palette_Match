import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { Plus, X } from "lucide-react";

const MEDIUMS = ["Oil", "Acrylic", "Watercolor", "Photography", "Digital", "Mixed media"];
const STYLES = ["Abstract", "Impressionist", "Realist", "Minimalist", "Contemporary", "Classical", "Botanical", "Coastal"];

export default function ArtistOnboardingPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    bio: "", headline: "", location: "",
    specialties: [], mediums: [], styles: [],
    price_low: 500, price_high: 5000,
    availability: "Open to commissions",
    portfolio: [], years_experience: 1,
  });
  const [specialty, setSpecialty] = useState("");
  const [portfolioItem, setPortfolioItem] = useState({ url: "", title: "", medium: "", year: 2024 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    http.get(`/artists/${user.user_id}`).then((r) => {
      if (r.data) setForm((f) => ({ ...f, ...r.data }));
    }).catch(() => {});
  }, [user]);

  const toggle = (key, val) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }));
  };

  const addSpecialty = () => {
    if (specialty.trim()) {
      setForm((f) => ({ ...f, specialties: [...f.specialties, specialty.trim()] }));
      setSpecialty("");
    }
  };

  const addPortfolioItem = () => {
    if (portfolioItem.url.trim()) {
      setForm((f) => ({ ...f, portfolio: [...f.portfolio, portfolioItem] }));
      setPortfolioItem({ url: "", title: "", medium: "", year: 2024 });
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await http.put("/artists/me", form);
      nav("/dashboard");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-16 overline text-neutral-500">Loading…</div>;
  if (!user) return <div className="p-16 overline text-neutral-500">Please sign in.</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16" data-testid="artist-onboarding">
        <span className="overline text-neutral-500">Build your profile</span>
        <h1 className="font-serif text-5xl tracking-tighter mt-3">Curate your studio.</h1>
        <p className="text-neutral-600 mt-3">The more specific you are, the better our AI can pair you with the right commissions.</p>

        <div className="space-y-10 mt-12">
          <div>
            <label className="overline">Headline</label>
            <input
              data-testid="onb-headline"
              className="input-luxury mt-2"
              placeholder="Coastal oil paintings, soft impressionism"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
            />
          </div>
          <div>
            <label className="overline">Bio</label>
            <textarea
              rows={4}
              data-testid="onb-bio"
              className="input-luxury mt-2"
              placeholder="Tell collectors about your practice…"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="overline">Location</label>
              <input
                data-testid="onb-location"
                className="input-luxury mt-2"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <label className="overline">Years of experience</label>
              <input
                type="number" data-testid="onb-years"
                className="input-luxury mt-2"
                value={form.years_experience}
                onChange={(e) => setForm({ ...form, years_experience: parseInt(e.target.value || "0") })}
              />
            </div>
          </div>

          <div>
            <label className="overline">Mediums</label>
            <div className="flex flex-wrap gap-px bg-neutral-200 border border-neutral-200 mt-2">
              {MEDIUMS.map((m) => (
                <button
                  key={m}
                  data-testid={`onb-medium-${m}`}
                  onClick={() => toggle("mediums", m)}
                  className="bg-white py-3 px-5 text-sm"
                  style={form.mediums.includes(m) ? { background: "#111", color: "#fff" } : {}}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="overline">Styles</label>
            <div className="flex flex-wrap gap-px bg-neutral-200 border border-neutral-200 mt-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  data-testid={`onb-style-${s}`}
                  onClick={() => toggle("styles", s)}
                  className="bg-white py-3 px-5 text-sm"
                  style={form.styles.includes(s) ? { background: "#111", color: "#fff" } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="overline">Specialties</label>
            <div className="flex gap-2 mt-2">
              <input
                data-testid="onb-specialty-input"
                className="input-luxury"
                placeholder="e.g. Coastal landscapes"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
              />
              <button data-testid="onb-add-specialty" onClick={addSpecialty} className="btn-secondary">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {form.specialties.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-neutral-100 text-sm flex items-center gap-2">
                  {s}
                  <button onClick={() => setForm((f) => ({ ...f, specialties: f.specialties.filter((_, idx) => idx !== i) }))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="overline">Price low (USD)</label>
              <input
                type="number" data-testid="onb-price-low"
                className="input-luxury mt-2"
                value={form.price_low}
                onChange={(e) => setForm({ ...form, price_low: parseInt(e.target.value || "0") })}
              />
            </div>
            <div>
              <label className="overline">Price high (USD)</label>
              <input
                type="number" data-testid="onb-price-high"
                className="input-luxury mt-2"
                value={form.price_high}
                onChange={(e) => setForm({ ...form, price_high: parseInt(e.target.value || "0") })}
              />
            </div>
          </div>

          <div>
            <label className="overline">Availability</label>
            <input
              data-testid="onb-availability"
              className="input-luxury mt-2"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
            />
          </div>

          <div>
            <label className="overline">Portfolio</label>
            <div className="border border-neutral-200 bg-white p-6 mt-2 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  data-testid="onb-portfolio-url"
                  className="input-luxury"
                  placeholder="Image URL"
                  value={portfolioItem.url}
                  onChange={(e) => setPortfolioItem({ ...portfolioItem, url: e.target.value })}
                />
                <input
                  data-testid="onb-portfolio-title"
                  className="input-luxury"
                  placeholder="Title"
                  value={portfolioItem.title}
                  onChange={(e) => setPortfolioItem({ ...portfolioItem, title: e.target.value })}
                />
              </div>
              <button data-testid="onb-portfolio-add" onClick={addPortfolioItem} className="btn-secondary">
                <Plus size={14} /> Add work
              </button>
            </div>
            <div className="grid grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 mt-3">
              {form.portfolio.map((p, i) => (
                <div key={i} className="bg-white">
                  <div className="aspect-square overflow-hidden bg-neutral-100">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-xs">{p.title}</span>
                    <button onClick={() => setForm((f) => ({ ...f, portfolio: f.portfolio.filter((_, idx) => idx !== i) }))}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button data-testid="onb-save" onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : "Publish my profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
