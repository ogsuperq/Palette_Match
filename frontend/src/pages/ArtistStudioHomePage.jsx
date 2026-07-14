import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import { loadCollectionFoundation } from "@/lib/collectionDemoState";

function firstName(name = "") {
  return name.trim().split(/\s+/)[0] || "Artist";
}

function StudioAreaNote({ title, description }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <span className="overline text-neutral-500">Not yet available in Studio</span>
      <h3 className="font-serif text-2xl mt-3">{title}</h3>
      <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

function StudioAreaCard({ title, description, action, onOpen }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <span className="overline text-neutral-500">Available</span>
      <h3 className="font-serif text-2xl mt-3">{title}</h3>
      <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{description}</p>
      <button type="button" className="btn-secondary mt-5 !py-2 !px-4" onClick={onOpen}>
        {action}
      </button>
    </div>
  );
}

function StudioHomeContent({ user, collectionState }) {
  const nav = useNavigate();
  const collection = collectionState.collections[0];
  const artworkById = useMemo(
    () => new Map(collectionState.artwork.map((artwork) => [artwork.artwork_id, artwork])),
    [collectionState.artwork]
  );
  const featuredArtwork = artworkById.get(collection.cover_artwork_id) || collectionState.artwork[0];
  const hasArtwork = Boolean(featuredArtwork?.primary_image?.url);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA]" data-testid="artist-studio-home">
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-7">
            <div className="bg-neutral-100 overflow-hidden min-h-[52vh]">
              {hasArtwork ? (
                <img
                  src={featuredArtwork.primary_image.url}
                  alt={featuredArtwork.accessibility_description || featuredArtwork.primary_image.alt}
                  className="w-full h-full min-h-[52vh] object-cover"
                />
              ) : (
                <div className="min-h-[52vh] flex items-center justify-center px-8 text-center">
                  <p className="font-serif text-3xl text-neutral-500">
                    Your Studio begins with the work you choose to present.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <span className="overline text-neutral-500">Artist Studio</span>
            <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">
              Welcome back, {firstName(user.name)}.
            </h1>
            <p className="text-neutral-600 mt-5 text-lg leading-relaxed">
              Your work continues to create meaningful connections.
            </p>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Let&apos;s see what deserves your attention today.
            </p>

            <div className="mt-10 bg-white border border-neutral-200 p-7 sm:p-8">
              <span className="overline text-neutral-500">Where to begin today</span>
              <h2 className="font-serif text-3xl mt-3">Continue curating your Collection.</h2>
              <p className="text-neutral-600 mt-3 leading-relaxed">
                Your Collection is the clearest place to shape how your work welcomes the world.
              </p>
              <button
                type="button"
                className="btn-primary mt-6"
                data-testid="studio-continue-collection"
                onClick={() => nav("/studio/collections")}
              >
                Open Collection
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <span className="overline text-neutral-500">Studio areas</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 mt-5">
            <StudioAreaCard
              title="Collection"
              description="Experience and refine the work that introduces your Studio."
              action="Open Collection"
              onOpen={() => nav("/studio/collections")}
            />
            <StudioAreaCard
              title="Messages"
              description="Return to creative relationships with their context preserved."
              action="Open Messages"
              onOpen={() => nav("/studio/messages")}
            />
            <StudioAreaNote
              title="Commissions"
              description="Studio Commissions will gather active opportunities without turning Home into an administrative dashboard."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ArtistStudioHomePage() {
  const { user, loading } = useAuth();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadStudioHome() {
      if (!user) return;
      if (user.role !== "artist" && !isDemoModeEnabled()) return;
      try {
        const artistProfile = isDemoModeEnabled()
          ? { ...DEMO_ARTISTS[0], user_id: user.user_id || DEMO_ARTISTS[0].user_id }
          : (await http.get(`/artists/${user.user_id}`)).data;
        if (!mounted) return;
        setArtist(artistProfile);
        setCollectionState(loadCollectionFoundation(artistProfile));
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.detail || "We could not open your Studio.");
      }
    }
    loadStudioHome();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Studio is one click away.</p>
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
          <h1 className="font-serif text-4xl mt-4">Studio belongs to artists.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      {error ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="text-neutral-700">{error}</p>
        </div>
      ) : collectionState && artist ? (
        <StudioHomeContent user={user} collectionState={collectionState} />
      ) : (
        <div className="p-16 overline text-neutral-500">Opening your Studio...</div>
      )}
    </div>
  );
}
