import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { Plus, ArrowRight } from "lucide-react";
import { isDemoModeEnabled, listDemoProjects } from "@/lib/demoMode";

const STATUS_LABEL = {
  matching: "Matching",
  matched: "Awaiting proposals",
  artist_selected: "Artist selected",
  deposit_pending: "Deposit pending",
  in_progress: "In progress",
  completed: "Completed",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    if (!user) return;
    setProjectsLoading(true);
    setError("");
    if (isDemoModeEnabled()) {
      setProjects(listDemoProjects());
      setProjectsLoading(false);
      return;
    }
    try {
      const { data } = await http.get("/projects");
      setProjects(data);
    } catch (e) {
      setError(e.response?.data?.detail || "We could not load your projects.");
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // Reload when the authenticated account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <div className="p-16 overline text-neutral-500">Loading…</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h2 className="font-serif text-4xl">Please sign in</h2>
          <p className="text-neutral-600 mt-4">Your dashboard is one click away.</p>
        </div>
      </div>
    );
  }

  const isArtist = user.role === "artist";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-16" data-testid="dashboard">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="overline text-neutral-500">Welcome back, {user.name?.split(" ")[0]}</span>
            <h1 className="font-serif text-5xl tracking-tighter mt-3">
              {isArtist ? "Your commission pipeline." : "Your commissions."}
            </h1>
          </div>
          {!isArtist && (
            <button data-testid="dashboard-new-commission" onClick={() => nav("/intake")} className="btn-primary">
              <Plus size={14} /> New commission
            </button>
          )}
          {isArtist && (
            <button data-testid="dashboard-edit-profile" onClick={() => nav("/onboard-artist")} className="btn-secondary">
              Edit my artist profile
            </button>
          )}
        </div>

        {error ? (
          <div className="border border-neutral-200 bg-white p-10 text-center">
            <p className="text-neutral-700">{error}</p>
            <button onClick={loadProjects} className="btn-secondary mt-6">Try again</button>
          </div>
        ) : projectsLoading ? (
          <div className="border border-neutral-200 bg-white p-16 text-center">
            <p className="overline text-neutral-500">Loading projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-neutral-200 bg-white p-16 text-center">
            <p className="overline text-neutral-500">{isArtist ? "No invitations yet" : "No commissions yet"}</p>
            <h3 className="font-serif text-3xl mt-3">
              {isArtist ? "Matches will appear here." : "Begin your first brief."}
            </h3>
            {!isArtist && (
              <button onClick={() => nav("/intake")} className="btn-primary mt-8">Start a commission</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-px bg-neutral-200 border border-neutral-200">
            {projects.map((p) => (
              <div key={p.project_id} className="bg-white p-8" data-testid={`project-row-${p.project_id}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="overline text-neutral-500">
                      {p.status === "awaiting_approval"
                        ? (isArtist ? "Awaiting collector approval" : "Awaiting your approval")
                        : (STATUS_LABEL[p.status] || p.status)}
                    </div>
                    <h3 className="font-serif text-2xl mt-2">{p.title}</h3>
                    <p className="text-sm text-neutral-600 mt-1 max-w-2xl line-clamp-2">{p.ai_brief || p.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="overline">Budget</div>
                      <div className="font-serif text-2xl mt-1">${p.budget?.toLocaleString()}</div>
                    </div>
                    <Link
                      to={`/project/${p.project_id}`}
                      data-testid={`open-project-${p.project_id}`}
                      className="btn-primary !py-2 !px-4"
                    >
                      Open <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
                {isArtist && p.match && (
                  <div className="mt-4 ai-badge">Match {p.match.score}% — {p.match.reasoning?.slice(0, 100)}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
