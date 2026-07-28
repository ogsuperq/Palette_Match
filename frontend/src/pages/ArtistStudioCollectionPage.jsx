import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WorkspaceReturn from "@/components/WorkspaceReturn";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import { loadCollectionFoundation } from "@/lib/collectionDemoState";

function FeaturedCollectionView({ collectionState }) {
  const nav = useNavigate();
  const [actionsVisible, setActionsVisible] = useState(false);
  const collection = collectionState.collections[0];
  const artworkById = useMemo(
    () => new Map(collectionState.artwork.map((artwork) => [artwork.artwork_id, artwork])),
    [collectionState.artwork]
  );
  const orderedArtwork = collection.artwork_ids
    .map((artworkId) => artworkById.get(artworkId))
    .filter(Boolean);
  const featuredArtwork = artworkById.get(collection.cover_artwork_id) || orderedArtwork[0];

  useEffect(() => {
    const timer = window.setTimeout(() => setActionsVisible(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  const revealActions = () => setActionsVisible(true);

  return (
    <main
      className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA]"
      onScroll={revealActions}
      onPointerMove={revealActions}
      data-testid="artist-studio-collection"
    >
      <section className="max-w-[1500px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <WorkspaceReturn workspace="studio" className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-8">
            <div className="bg-neutral-100 overflow-hidden min-h-[58vh]">
              {featuredArtwork?.primary_image?.url ? (
                <img
                  src={featuredArtwork.primary_image.url}
                  alt={featuredArtwork.accessibility_description || featuredArtwork.primary_image.alt}
                  className="w-full h-full min-h-[58vh] object-cover"
                />
              ) : (
                <div className="min-h-[58vh] flex items-center justify-center px-8 text-center">
                  <p className="font-serif text-3xl text-neutral-500">
                    Your Collection is ready for its first artwork.
                  </p>
                </div>
              )}
            </div>

            {orderedArtwork.length > 1 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200 border border-neutral-200">
                {orderedArtwork.slice(1, 5).map((artwork) => (
                  <div key={artwork.artwork_id} className="aspect-square bg-white overflow-hidden">
                    {artwork.primary_image?.url && (
                      <img
                        src={artwork.primary_image.url}
                        alt={artwork.accessibility_description || artwork.primary_image.alt}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 lg:sticky lg:top-28">
            <span className="overline text-neutral-500">Artist Studio</span>
            <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">
              Featured Collection
            </h1>
            <p className="text-neutral-600 mt-5 text-lg leading-relaxed">
              This is how your work currently welcomes the world.
            </p>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Experience your collection with fresh perspective.
            </p>

            <div
              className={`mt-10 transition-opacity duration-700 ${
                actionsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!actionsVisible}
            >
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  type="button"
                  className="btn-primary"
                  data-testid="review-my-collection"
                  onClick={() => nav("/studio/collections")}
                >
                  Review My Collection
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  data-testid="return-to-studio"
                  onClick={() => nav("/studio")}
                >
                  Return to Studio
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default function ArtistStudioCollectionPage() {
  const { user, loading } = useAuth();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadArtistCollection() {
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
        setError(e.response?.data?.detail || "We could not open your Collection.");
      }
    }
    loadArtistCollection();
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
          <h1 className="font-serif text-4xl mt-4">Collection belongs in the Artist Studio.</h1>
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
        <FeaturedCollectionView collectionState={collectionState} />
      ) : (
        <div className="p-16 overline text-neutral-500">Opening your Collection...</div>
      )}
    </div>
  );
}
