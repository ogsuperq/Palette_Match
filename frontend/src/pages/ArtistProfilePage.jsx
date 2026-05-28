import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "@/lib/api";
import Navbar from "@/components/Navbar";

export default function ArtistProfilePage() {
  const { userId } = useParams();
  const [artist, setArtist] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    http.get(`/artists/${userId}`).then((r) => setArtist(r.data)).catch(() => {});
    http.get(`/artists/${userId}/reviews`).then((r) => setReviews(r.data)).catch(() => {});
  }, [userId]);

  if (!artist) return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar /><div className="p-16 overline text-neutral-500">Loading…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16" data-testid="artist-profile">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: bio */}
          <div className="lg:col-span-4">
            {artist.picture && (
              <img src={artist.picture} alt="" className="w-32 h-32 rounded-full object-cover border border-neutral-200" />
            )}
            <div className="overline text-neutral-500 mt-6">{artist.location}</div>
            <h1 className="font-serif text-5xl tracking-tighter mt-3">{artist.name}</h1>
            <p className="text-neutral-700 mt-2">{artist.headline}</p>

            <div className="mt-8 space-y-5 text-sm">
              <div>
                <span className="overline">Specialties</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {artist.specialties?.map((s) => (
                    <span key={s} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="overline">Mediums</span>
                <p className="mt-2 text-neutral-700">{artist.mediums?.join(" · ")}</p>
              </div>
              <div>
                <span className="overline">Price range</span>
                <p className="mt-2 text-neutral-700">${artist.price_low?.toLocaleString()} – ${artist.price_high?.toLocaleString()}</p>
              </div>
              <div>
                <span className="overline">Experience</span>
                <p className="mt-2 text-neutral-700">{artist.years_experience} years</p>
              </div>
              <div>
                <span className="overline">Availability</span>
                <p className="mt-2 text-neutral-700">{artist.availability}</p>
              </div>
              <div>
                <span className="overline">Rating</span>
                <p className="mt-2 text-neutral-700">★ {artist.rating?.toFixed(1)} · {artist.reviews_count} reviews · {artist.completion_rate}% completion</p>
              </div>
            </div>

            <Link to="/intake" data-testid="commission-cta" className="btn-primary mt-10 w-full">
              Commission {artist.name.split(" ")[0]}
            </Link>
          </div>

          {/* Right: portfolio */}
          <div className="lg:col-span-8">
            <span className="overline text-neutral-500">About</span>
            <p className="mt-3 font-serif text-2xl tracking-tight leading-relaxed text-neutral-800">{artist.bio}</p>

            <div className="mt-14">
              <span className="overline text-neutral-500">Selected works</span>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
                {(artist.portfolio || []).map((p, i) => (
                  <div key={i} className="bg-white" data-testid={`portfolio-${i}`}>
                    <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h4 className="font-serif text-xl">{p.title}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{p.medium} · {p.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="mt-14">
                <span className="overline text-neutral-500">Reviews</span>
                <div className="mt-6 space-y-6">
                  {reviews.map((r) => (
                    <div key={r.review_id} className="border-l-2 border-neutral-900 pl-6">
                      <div className="flex justify-between items-baseline">
                        <span className="font-serif text-lg">{r.collector_name}</span>
                        <span className="text-xs text-neutral-500">★ {r.average}</span>
                      </div>
                      <p className="text-neutral-700 mt-2 text-sm italic">"{r.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
