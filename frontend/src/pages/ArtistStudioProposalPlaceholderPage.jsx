import React from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isDemoModeEnabled } from "@/lib/demoMode";

export default function ArtistStudioProposalPlaceholderPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Studio proposal is one click away.</p>
        </div>
      </div>
    );
  }

  if (user.role !== "artist" && !isDemoModeEnabled()) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Artist Studio</span>
          <h1 className="font-serif text-4xl mt-4">Proposals belong in the Artist Studio.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="proposal-placeholder">
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] flex items-center">
        <section className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter">Proposal</h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">
            Every meaningful commission begins with shared understanding.
          </p>
          <p className="text-neutral-600 mt-3 leading-relaxed">
            This workspace will guide you through creating a thoughtful proposal together.
          </p>
        </section>
      </main>
    </div>
  );
}
