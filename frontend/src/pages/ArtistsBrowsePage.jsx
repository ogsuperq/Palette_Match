import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";

export default function ArtistsBrowsePage() {
  const [artists, setArtists] = useState([]);
  const [q, setQ] = useState("");
  const [medium, setMedium] = useState("");

  const load = async () => {
    const params = {};
    if (q) params.q = q;
    if (medium) params.medium = medium;
    const { data } = await http.get("/artists", { params });
    setArtists(data);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16" data-testid="artists-browse">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="overline text-neutral-500">All artists</span>
            <h1 className="font-serif text-5xl tracking-tighter mt-4">Curated artists, booking now.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                data-testid="artist-search"
                placeholder="Search by name or specialty"
                className="input-luxury !pl-9 w-72"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </div>
            <select
              data-testid="medium-filter"
              className="input-luxury w-44"
              value={medium}
              onChange={(e) => { setMedium(e.target.value); }}
            >
              <option value="">All mediums</option>
              {["Oil", "Acrylic", "Watercolor", "Photography", "Digital", "Mixed media"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button data-testid="apply-filters" onClick={load} className="btn-primary">Apply</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
          {artists.map((a) => (
            <Link
              key={a.user_id}
              to={`/artist/${a.user_id}`}
              data-testid={`browse-artist-${a.user_id}`}
              className="bg-white group"
            >
              <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
                {a.portfolio?.[0]?.url ? (
                  <img src={a.portfolio[0].url} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-all duration-500" />
                ) : null}
              </div>
              <div className="p-6">
                <div className="overline text-neutral-500">{a.location}</div>
                <h3 className="font-serif text-2xl mt-2">{a.name}</h3>
                <p className="text-sm text-neutral-600 mt-1">{a.headline}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <span>From ${a.price_low?.toLocaleString()}</span>
                  <span>★ {a.rating?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
