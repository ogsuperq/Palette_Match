import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  archiveCollectionState,
  duplicateCollectionState,
  loadCollectionFoundation,
  saveCollectionFoundation,
} from "@/lib/collectionDemoState";

function formatUpdated(value) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return `Updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function CollectionCard({ collection, artworkById, canArchive, onArchive, onDuplicate, onOpen }) {
  const coverArtwork = artworkById.get(collection.cover_artwork_id) || artworkById.get(collection.artwork_ids?.[0]);
  const artworkCount = collection.artwork_ids?.length || 0;

  return (
    <article className="bg-white" data-testid={`collection-card-${collection.collection_id}`}>
      <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
        {coverArtwork?.primary_image?.url ? (
          <img
            src={coverArtwork.primary_image.url}
            alt={coverArtwork.accessibility_description || coverArtwork.primary_image.alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center px-6 text-center">
            <p className="font-serif text-2xl text-neutral-500">This Collection is ready for artwork.</p>
          </div>
        )}
      </div>
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <span className="overline text-neutral-500">{collection.featured ? "Featured Collection" : "Collection"}</span>
          {collection.featured && <span className="ai-badge">Featured</span>}
        </div>
        <h2 className="font-serif text-3xl tracking-tight mt-4">{collection.title}</h2>
        <p className="text-neutral-600 mt-3 text-sm leading-relaxed">{collection.short_description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-500">
          <span>{artworkCount} {artworkCount === 1 ? "Artwork" : "Artworks"}</span>
          <span>{formatUpdated(collection.last_updated)}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn-primary !py-2 !px-4 text-xs" onClick={onOpen}>
            Open
          </button>
          <button type="button" className="btn-secondary !py-2 !px-4 text-xs" onClick={onDuplicate}>
            Duplicate
          </button>
          <button
            type="button"
            className="btn-secondary !py-2 !px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!canArchive}
            onClick={onArchive}
          >
            Archive
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ArtistStudioCollectionsPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadCollections() {
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
        setError(e.response?.data?.detail || "We could not open your Collections.");
      }
    }
    loadCollections();
    return () => {
      mounted = false;
    };
  }, [user]);

  const artworkById = useMemo(
    () => new Map((collectionState?.artwork || []).map((artwork) => [artwork.artwork_id, artwork])),
    [collectionState]
  );
  const activeCollections = (collectionState?.collections || []).filter((collection) => !collection.archived);

  const persistState = (nextState) => {
    const saved = saveCollectionFoundation(nextState);
    setCollectionState(saved);
  };

  const openCollection = (collection) => {
    const firstArtworkId = collection.artwork_ids?.[0];
    nav(firstArtworkId ? `/studio/artwork/${firstArtworkId}` : "/studio/collection");
  };

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
          <h1 className="font-serif text-4xl mt-4">Collections belong in the Artist Studio.</h1>
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
        <main className="max-w-[1500px] mx-auto px-6 sm:px-10 py-12 sm:py-16" data-testid="artist-studio-collections">
          <div className="max-w-3xl mb-12">
            <span className="overline text-neutral-500">Artist Studio</span>
            <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">Your Collections</h1>
            <p className="text-neutral-600 mt-5 text-lg leading-relaxed">
              Every collection tells a different story.
            </p>
            <p className="text-neutral-600 mt-3 leading-relaxed">
              Organize your work in a way that feels authentic to your creative journey.
            </p>
          </div>

          {activeCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
              {activeCollections.map((collection) => (
                <CollectionCard
                  key={collection.collection_id}
                  collection={collection}
                  artworkById={artworkById}
                  canArchive={activeCollections.length > 1}
                  onOpen={() => openCollection(collection)}
                  onDuplicate={() => persistState(duplicateCollectionState(collectionState, collection.collection_id))}
                  onArchive={() => persistState(archiveCollectionState(collectionState, collection.collection_id))}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 p-10 sm:p-14 text-center">
              <h2 className="font-serif text-3xl">Begin with the work you want to introduce.</h2>
              <p className="text-neutral-600 mt-3">Your first Collection can grow from the artwork already in your Studio.</p>
            </div>
          )}
        </main>
      ) : (
        <div className="p-16 overline text-neutral-500">Opening your Collections...</div>
      )}
    </div>
  );
}
