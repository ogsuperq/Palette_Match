import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { http } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function MatchesPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [project, setProject] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [p, m] = await Promise.all([
          http.get(`/projects/${id}`),
          http.get(`/projects/${id}/matches`),
        ]);
        if (!mounted) return;
        setProject(p.data);
        setMatches(m.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16" data-testid="matches-page">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-neutral-400" size={28} />
            <p className="overline text-neutral-500 mt-4">Curating your shortlist…</p>
          </div>
        ) : (
          <>
            <div className="mb-12 max-w-3xl">
              <span className="ai-badge"><Sparkles size={12} /> AI shortlist</span>
              <h1 className="font-serif text-5xl tracking-tighter mt-5">Your top {matches.length} artists.</h1>
              {project?.ai_brief && (
                <p className="text-neutral-600 mt-5 leading-relaxed italic font-serif text-lg">"{project.ai_brief}"</p>
              )}
              <div className="flex gap-3 mt-6">
                <button data-testid="back-to-dashboard" onClick={() => nav("/dashboard")} className="btn-secondary">
                  My commissions
                </button>
              </div>
            </div>

            {matches.length === 0 && (
              <div className="border border-neutral-200 bg-white p-12 text-center">
                <p className="overline text-neutral-500">No matches yet</p>
                <p className="font-serif text-2xl mt-3">We're still curating. Try again in a moment.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
              {matches.map((m) => (
                <article key={m.match_id} className="bg-white p-8 lg:p-10" data-testid={`match-card-${m.artist_id}`}>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                      {m.artist?.picture && (
                        <img src={m.artist.picture} alt="" className="w-14 h-14 rounded-full object-cover border border-neutral-200" />
                      )}
                      <div>
                        <div className="overline text-neutral-500">{m.artist?.location}</div>
                        <h3 className="font-serif text-3xl tracking-tight mt-1">{m.artist?.name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-serif text-5xl tracking-tighter text-neutral-900">{m.score}%</div>
                      <div className="overline text-neutral-500">match</div>
                    </div>
                  </div>

                  <p className="text-neutral-700 mt-6 text-sm leading-relaxed">{m.reasoning}</p>

                  {(m.artist?.portfolio || []).length > 0 && (
                    <div className={`grid gap-px bg-neutral-200 border border-neutral-200 mt-6 ${
                      m.artist.portfolio.length === 1 ? 'grid-cols-1' :
                      m.artist.portfolio.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                    }`}>
                      {m.artist.portfolio.slice(0, 3).map((p, i) => (
                        <div key={i} className="aspect-square bg-neutral-100 overflow-hidden">
                          <img src={p.url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-neutral-100">
                    <div className="text-xs text-neutral-500">
                      <span>From ${m.artist?.price_low?.toLocaleString()}</span>
                      <span className="mx-2">·</span>
                      <span>★ {m.artist?.rating?.toFixed(1)} ({m.artist?.reviews_count})</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/artist/${m.artist_id}`}
                        data-testid={`view-profile-${m.artist_id}`}
                        className="btn-secondary !py-2 !px-4 text-xs"
                      >
                        View profile
                      </Link>
                      <Link
                        to={`/project/${id}`}
                        data-testid={`see-proposals-${m.artist_id}`}
                        className="btn-primary !py-2 !px-4 text-xs"
                      >
                        See proposals <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
