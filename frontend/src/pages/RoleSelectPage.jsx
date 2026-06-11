import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";
import { Palette, Brush } from "lucide-react";
import { consumeAuthReturn } from "@/lib/auth";

export default function RoleSelectPage() {
  const { refresh } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const choose = async (role) => {
    setLoading(true);
    setError("");
    try {
      await http.post("/auth/set-role", { role });
      await refresh();
      if (role === "artist") nav("/onboard-artist");
      else {
        const returnPath = consumeAuthReturn();
        nav(returnPath === "/dashboard" ? "/intake" : returnPath);
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Your account role could not be saved.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-24" data-testid="role-select-page">
        <span className="overline text-neutral-500">Welcome to Palette Match</span>
        <h1 className="font-serif text-5xl tracking-tighter mt-4">How will you use Palette Match?</h1>
        <p className="text-neutral-600 mt-4">You can switch later. We just want to tailor the experience.</p>
        {error && (
          <div className="border border-neutral-300 bg-white p-4 mt-6 text-sm text-neutral-700" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200 mt-12">
          <button
            data-testid="role-collector"
            disabled={loading}
            onClick={() => choose("collector")}
            className="bg-white p-10 text-left hover:bg-neutral-50 transition-all group"
          >
            <Palette className="w-8 h-8 text-neutral-900" strokeWidth={1.2} />
            <h2 className="font-serif text-3xl mt-6">I'm a collector</h2>
            <p className="text-neutral-600 mt-3 text-sm leading-relaxed">
              Describe what you want and let our AI surface five artists who can paint it. Compare proposals. Hire safely.
            </p>
            <span className="overline text-neutral-500 mt-8 inline-block group-hover:text-neutral-900">
              Start commissioning →
            </span>
          </button>
          <button
            data-testid="role-artist"
            disabled={loading}
            onClick={() => choose("artist")}
            className="bg-white p-10 text-left hover:bg-neutral-50 transition-all group"
          >
            <Brush className="w-8 h-8 text-neutral-900" strokeWidth={1.2} />
            <h2 className="font-serif text-3xl mt-6">I'm an artist</h2>
            <p className="text-neutral-600 mt-3 text-sm leading-relaxed">
              Build a curated profile, receive matched commissions, submit proposals. No cold outreach.
            </p>
            <span className="overline text-neutral-500 mt-8 inline-block group-hover:text-neutral-900">
              Build my profile →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
