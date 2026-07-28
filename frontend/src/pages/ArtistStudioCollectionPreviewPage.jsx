import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  findActivePresentationDraft,
  findCollection,
  getPresentationArtworkOrder,
  loadCollectionFoundation,
} from "@/lib/collectionDemoState";
import { returnFromPreview } from "@/lib/previewReturnState";
import WorkspaceReturn from "@/components/WorkspaceReturn";

export default function ArtistStudioCollectionPreviewPage() {
  const { collectionId } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadPreview() {
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
        setError(e.response?.data?.detail || "We could not open this Preview.");
      }
    }
    loadPreview();
    return () => {
      mounted = false;
    };
  }, [user]);

  const collection = findCollection(collectionState, collectionId);
  const activeDraft = findActivePresentationDraft(collectionState, collectionId);
  const artworkById = useMemo(
    () => new Map((collectionState?.artwork || []).map((artwork) => [artwork.artwork_id, artwork])),
    [collectionState]
  );
  const orderedArtwork = getPresentationArtworkOrder(collection).map((artworkId) => artworkById.get(artworkId)).filter(Boolean);
  const coverArtwork = artworkById.get(activeDraft?.cover_artwork_id) || orderedArtwork[0];
  const featuredArtwork = (activeDraft?.featured_artwork_ids || []).map((artworkId) => artworkById.get(artworkId)).filter(Boolean);

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="collection-preview">
      <div className="fixed top-0 left-0 right-0 z-20 bg-[#FAFAFA]/95 border-b border-neutral-200 px-6 sm:px-10 py-4 flex items-center justify-between gap-4">
        <WorkspaceReturn workspace="studio" />
        <button
          type="button"
          className="btn-secondary !py-2 !px-4 text-xs"
          onClick={() => returnFromPreview(nav, `/studio/collections/${collectionId}/presentation`)}
        >
          Return to Presentation
        </button>
      </div>

      {error ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="text-neutral-700">{error}</p>
        </div>
      ) : collectionState && artist && collection && activeDraft ? (
        <main className="max-w-[1300px] mx-auto px-6 sm:px-10 pt-28 pb-20">
          <section>
            <div className="aspect-[16/10] bg-neutral-100 overflow-hidden">
              {coverArtwork?.primary_image?.url ? (
                <img
                  src={coverArtwork.primary_image.url}
                  alt={coverArtwork.accessibility_description || coverArtwork.primary_image.alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center px-8 text-center">
                  <p className="font-serif text-3xl text-neutral-500">This Collection is ready for its cover Artwork.</p>
                </div>
              )}
            </div>
            <div className="mt-10 max-w-4xl">
              <span className="overline text-neutral-500">Collection Preview</span>
              <h1 className="font-serif text-6xl tracking-tighter mt-5">{collection.title}</h1>
              <p className="text-neutral-600 mt-5 text-lg leading-relaxed">{collection.short_description}</p>
            </div>
          </section>

          <section className="mt-16 max-w-3xl">
            <span className="overline text-neutral-500">Collection Story</span>
            <p className="font-serif text-3xl leading-snug mt-5">
              {collection.collection_story || "This Collection invites visual discovery before added context."}
            </p>
          </section>

          <section className="mt-16">
            <span className="overline text-neutral-500">Featured Artwork</span>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
              {(featuredArtwork.length > 0 ? featuredArtwork : orderedArtwork.slice(0, 1)).map((artwork) => (
                <article key={artwork.artwork_id} className="bg-white">
                  <div className="aspect-[4/5] bg-neutral-100 overflow-hidden">
                    {artwork.primary_image?.url && (
                      <img
                        src={artwork.primary_image.url}
                        alt={artwork.accessibility_description || artwork.primary_image.alt}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="font-serif text-3xl">{artwork.title}</h2>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <span className="overline text-neutral-500">Artwork Order</span>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
              {orderedArtwork.map((artwork, index) => (
                <article key={artwork.artwork_id} className="bg-white">
                  <div className="aspect-square bg-neutral-100 overflow-hidden">
                    {artwork.primary_image?.url && (
                      <img
                        src={artwork.primary_image.url}
                        alt={artwork.accessibility_description || artwork.primary_image.alt}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="overline text-neutral-500">Position {index + 1}</div>
                    <h3 className="font-serif text-2xl mt-2">{artwork.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 border-t border-neutral-200 pt-8">
            <span className="overline text-neutral-500">Presentation Settings</span>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-600">
              <span>Spacing: {activeDraft.presentation_settings?.spacing || "generous"}</span>
              <span>Rhythm: {activeDraft.visual_rhythm || "quiet"}</span>
              <span>Flow: {activeDraft.collection_flow || "featured-first"}</span>
            </div>
          </section>
        </main>
      ) : collectionState ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Collection Preview</span>
          <h1 className="font-serif text-4xl mt-4">This Preview is not available.</h1>
        </div>
      ) : (
        <div className="p-16 overline text-neutral-500">Opening Preview...</div>
      )}
    </div>
  );
}
