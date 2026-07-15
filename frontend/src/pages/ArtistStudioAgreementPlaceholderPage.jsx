import React from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isDemoModeEnabled } from "@/lib/demoMode";

export default function ArtistStudioAgreementPlaceholderPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Studio agreement is one click away.</p>
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
          <h1 className="font-serif text-4xl mt-4">Agreements belong in the Artist Studio.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="agreement-placeholder">
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)] flex items-center">
        <section className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter">Agreement</h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">
            When the shared vision feels aligned, the agreement will help reflect how you will bring it to life together.
          </p>
        </section>
      </main>
    </div>
  );
}
