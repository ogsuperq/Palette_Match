import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  archiveCollectionState,
  collectionStatus,
  deleteCollectionState,
  duplicateCollectionState,
  findCollection,
  loadCollectionFoundation,
  moveArtworkInCollectionState,
  restoreCollectionState,
  saveCollectionFoundation,
  setCollectionStatusState,
  setFeaturedArtworkState,
  updateCollectionStoryState,
} from "@/lib/collectionDemoState";

function formatUpdated(value) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return `Updated ${date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function CollectionCard({
  collection,
  artworkById,
  canArchive,
  canDelete,
  onArchive,
  onDelete,
  onDuplicate,
  onOpen,
  onRestore,
  selected,
}) {
  const coverArtwork = artworkById.get(collection.cover_artwork_id) || artworkById.get(collection.artwork_ids?.[0]);
  const artworkCount = collection.artwork_ids?.length || 0;
  const status = collectionStatus(collection);

  return (
    <article
      className={`bg-white ${selected ? "outline outline-1 outline-neutral-900 outline-offset-[-1px]" : ""}`}
      data-testid={`collection-card-${collection.collection_id}`}
    >
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
          <span className="overline text-neutral-500">{status} Collection</span>
          {collection.featured && <span className="ai-badge">Featured</span>}
        </div>
        <h2 className="font-serif text-3xl tracking-tight mt-4">{collection.title}</h2>
        <p className="text-neutral-600 mt-3 text-sm leading-relaxed">{collection.short_description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-500">
          <span>{artworkCount} {artworkCount === 1 ? "Artwork" : "Artworks"}</span>
          <span>{formatUpdated(collection.last_updated)}</span>
          <span>{status}</span>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="btn-primary !py-2 !px-4 text-xs" onClick={onOpen}>
            Open
          </button>
          <button type="button" className="btn-secondary !py-2 !px-4 text-xs" onClick={onDuplicate}>
            Duplicate
          </button>
          {collection.archived ? (
            <button type="button" className="btn-secondary !py-2 !px-4 text-xs" onClick={onRestore}>
              Restore
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary !py-2 !px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canArchive}
              onClick={onArchive}
            >
              Archive
            </button>
          )}
          <button
            type="button"
            className="btn-secondary !py-2 !px-4 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!canDelete}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function CollectionRefinement({ collection, artworkById, onStoryChange, onStatusChange, onFeatureArtwork, onMoveArtwork, onOpenArtwork }) {
  const orderedArtwork = (collection.artwork_ids || [])
    .map((artworkId) => artworkById.get(artworkId))
    .filter(Boolean);
  const status = collectionStatus(collection);

  return (
    <section className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start" data-testid="collection-refinement">
      <div className="lg:col-span-5">
        <span className="overline text-neutral-500">Collection Refinement</span>
        <h2 className="font-serif text-4xl tracking-tight mt-4">{collection.title}</h2>
        <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-500">
          <span>{orderedArtwork.length} {orderedArtwork.length === 1 ? "Artwork" : "Artworks"}</span>
          <span>{formatUpdated(collection.last_updated)}</span>
          <span>{status}</span>
        </div>

        <div className="mt-8">
          <label className="overline text-neutral-500" htmlFor="collection-story">Collection Story</label>
          {!collection.collection_story && (
            <p className="text-neutral-600 mt-3 text-sm leading-relaxed">
              What do you hope someone experiences while exploring this Collection?
            </p>
          )}
          <textarea
            id="collection-story"
            rows={9}
            className="input-luxury mt-4 leading-relaxed"
            value={collection.collection_story || ""}
            onChange={(event) => onStoryChange(event.target.value)}
            placeholder="Your artwork speaks first. Your story simply helps others understand the journey behind it."
          />
        </div>

        <div className="mt-8">
          <label className="overline text-neutral-500" htmlFor="collection-status">Collection Status</label>
          <select
            id="collection-status"
            className="input-luxury mt-3"
            value={status.toLowerCase()}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      <div className="lg:col-span-7">
        <span className="overline text-neutral-500">Artwork Order</span>
        <div className="mt-5 space-y-px bg-neutral-200 border border-neutral-200">
          {orderedArtwork.map((artwork, index) => (
            <div key={artwork.artwork_id} className="bg-white p-4 sm:p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
              <div className="w-full sm:w-28 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0">
                {artwork.primary_image?.url && (
                  <img
                    src={artwork.primary_image.url}
                    alt={artwork.accessibility_description || artwork.primary_image.alt}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="overline text-neutral-500">Position {index + 1}</div>
                <h3 className="font-serif text-2xl mt-2">{artwork.title}</h3>
                {collection.cover_artwork_id === artwork.artwork_id && <span className="ai-badge mt-3">Featured Artwork</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={index === 0}
                  onClick={() => onMoveArtwork(artwork.artwork_id, "up")}
                >
                  Move Up
                </button>
                <button
                  type="button"
                  className="btn-secondary !py-2 !px-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={index === orderedArtwork.length - 1}
                  onClick={() => onMoveArtwork(artwork.artwork_id, "down")}
                >
                  Move Down
                </button>
                <button
                  type="button"
                  className="btn-secondary !py-2 !px-3 text-xs"
                  onClick={() => onFeatureArtwork(artwork.artwork_id)}
                >
                  Make Featured
                </button>
                <button
                  type="button"
                  className="btn-secondary !py-2 !px-3 text-xs"
                  onClick={() => onOpenArtwork(artwork.artwork_id)}
                >
                  View Artwork
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const COLLECTION_VIEWS = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "draft", label: "Draft" },
  { id: "archived", label: "Archived" },
];

function filterCollections(collections, view) {
  const activeCollections = collections.filter((collection) => !collection.archived);
  if (view === "featured") return activeCollections.filter((collection) => collection.featured);
  if (view === "draft") return activeCollections.filter((collection) => !collection.featured);
  if (view === "archived") return collections.filter((collection) => collection.archived);
  return activeCollections;
}

function selectVisibleCollection(collections, view, preferredCollectionId = "") {
  const visibleCollections = filterCollections(collections, view);
  return (
    visibleCollections.find((collection) => collection.collection_id === preferredCollectionId)?.collection_id ||
    visibleCollections[0]?.collection_id ||
    ""
  );
}

export default function ArtistStudioCollectionsPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [collectionView, setCollectionView] = useState("all");
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
        const nextState = loadCollectionFoundation(artistProfile);
        setCollectionState(nextState);
        setSelectedCollectionId((current) => current || nextState.collections.find((collection) => !collection.archived)?.collection_id || nextState.collections[0]?.collection_id || "");
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
  const collections = collectionState?.collections || [];
  const activeCollections = collections.filter((collection) => !collection.archived);
  const visibleCollections = filterCollections(collections, collectionView);
  const selectedCollection = findCollection(collectionState, selectedCollectionId) || activeCollections[0] || collections[0];
  const visibleSelectedCollection = visibleCollections.find((collection) => collection.collection_id === selectedCollection?.collection_id);

  const persistState = (nextState, nextView = collectionView, preferredCollectionId = selectedCollectionId) => {
    const saved = saveCollectionFoundation(nextState);
    setCollectionState(saved);
    setSelectedCollectionId(selectVisibleCollection(saved.collections || [], nextView, preferredCollectionId));
  };

  const openCollection = (collection) => {
    setSelectedCollectionId(collection.collection_id);
  };

  const chooseCollectionView = (view) => {
    setCollectionView(view);
    setSelectedCollectionId(selectVisibleCollection(collections, view));
  };

  const restoreCollection = (collection) => {
    const nextView = "all";
    setCollectionView(nextView);
    persistState(restoreCollectionState(collectionState, collection.collection_id), nextView, collection.collection_id);
  };

  const deleteCollection = (collection) => {
    if (collections.length <= 1) return;
    const confirmed = window.confirm(`Delete "${collection.title}" permanently?`);
    if (!confirmed) return;
    persistState(deleteCollectionState(collectionState, collection.collection_id));
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

          <div className="mb-8 inline-flex gap-px bg-neutral-200 border border-neutral-200" aria-label="Collection views">
            {COLLECTION_VIEWS.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`px-4 py-3 text-sm ${collectionView === view.id ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}
                onClick={() => chooseCollectionView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </div>

          {visibleCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
              {visibleCollections.map((collection) => (
                <CollectionCard
                  key={collection.collection_id}
                  collection={collection}
                  artworkById={artworkById}
                  selected={selectedCollection?.collection_id === collection.collection_id}
                  canArchive={!collection.archived && activeCollections.length > 1}
                  canDelete={collections.length > 1}
                  onOpen={() => openCollection(collection)}
                  onDuplicate={() => persistState(duplicateCollectionState(collectionState, collection.collection_id))}
                  onArchive={() => persistState(archiveCollectionState(collectionState, collection.collection_id))}
                  onRestore={() => restoreCollection(collection)}
                  onDelete={() => deleteCollection(collection)}
                />
              ))}
            </div>
          ) : collectionView === "archived" ? (
            <div className="bg-white border border-neutral-200 p-10 sm:p-14 text-center">
              <span className="overline text-neutral-500">Archived Collections</span>
              <h2 className="font-serif text-3xl mt-4">Archived Collections will appear here.</h2>
              <p className="text-neutral-600 mt-3 max-w-xl mx-auto">
                When a Collection is set aside, it remains part of your Studio history and can be restored later.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 p-10 sm:p-14 text-center">
              <h2 className="font-serif text-3xl">Begin with the work you want to introduce.</h2>
              <p className="text-neutral-600 mt-3">Your first Collection can grow from the artwork already in your Studio.</p>
            </div>
          )}

          {visibleSelectedCollection && (
            <CollectionRefinement
              collection={visibleSelectedCollection}
              artworkById={artworkById}
              onStoryChange={(story) => persistState(updateCollectionStoryState(collectionState, visibleSelectedCollection.collection_id, story))}
              onStatusChange={(status) => persistState(setCollectionStatusState(collectionState, visibleSelectedCollection.collection_id, status))}
              onFeatureArtwork={(artworkId) => persistState(setFeaturedArtworkState(collectionState, visibleSelectedCollection.collection_id, artworkId))}
              onMoveArtwork={(artworkId, direction) => persistState(moveArtworkInCollectionState(collectionState, visibleSelectedCollection.collection_id, artworkId, direction))}
              onOpenArtwork={(artworkId) => nav(`/studio/artwork/${artworkId}`)}
            />
          )}
        </main>
      ) : (
        <div className="p-16 overline text-neutral-500">Opening your Collections...</div>
      )}
    </div>
  );
}
