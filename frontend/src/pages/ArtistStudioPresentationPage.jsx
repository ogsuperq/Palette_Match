import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  createSavedPresentationDraftState,
  findActivePresentationDraft,
  findCollection,
  getPresentationArtworkOrder,
  loadCollectionFoundation,
  markPresentationPreviewOpenedState,
  presentationReadiness,
  saveCollectionFoundation,
  setActivePresentationDraftState,
  setPresentationCoverArtworkState,
  togglePresentationFeaturedArtworkState,
} from "@/lib/collectionDemoState";
import { rememberPreviewReturnState } from "@/lib/previewReturnState";

function formatSaved(value) {
  if (!value) return "Saved locally";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved locally";
  return `Saved ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function PresentationReadiness({ readiness, onPreview }) {
  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-7">
      <span className="overline text-neutral-500">Presentation Readiness</span>
      <h2 className="font-serif text-3xl mt-4">
        {readiness.readyToReview ? "Ready to review." : "Your presentation is taking shape."}
      </h2>
      <p className="text-neutral-600 mt-4 leading-relaxed">
        {readiness.readyToReview
          ? "Your Collection has the essential elements for a thoughtful preview."
          : "A few elements can help collectors experience the Collection as you intend."}
      </p>

      {readiness.ready.length > 0 && (
        <div className="mt-6">
          <div className="overline text-neutral-500">Ready</div>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {readiness.ready.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {readiness.takingShape.length > 0 && (
        <div className="mt-6">
          <div className="overline text-neutral-500">Still taking shape</div>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {readiness.takingShape.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <button type="button" className="btn-primary mt-6 w-full" onClick={onPreview}>
        Preview Presentation
      </button>
    </section>
  );
}

export default function ArtistStudioPresentationPage() {
  const { collectionId } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadPresentation() {
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
        setError(e.response?.data?.detail || "We could not open this Presentation.");
      }
    }
    loadPresentation();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!saveMessage) return undefined;
    const timer = window.setTimeout(() => setSaveMessage(""), 2400);
    return () => window.clearTimeout(timer);
  }, [saveMessage]);

  const collection = findCollection(collectionState, collectionId);
  const activeDraft = findActivePresentationDraft(collectionState, collectionId);
  const artworkById = useMemo(
    () => new Map((collectionState?.artwork || []).map((artwork) => [artwork.artwork_id, artwork])),
    [collectionState]
  );
  const orderedArtwork = getPresentationArtworkOrder(collection).map((artworkId) => artworkById.get(artworkId)).filter(Boolean);
  const savedDrafts = (collection?.saved_presentation_draft_ids || [])
    .map((draftId) => (collectionState?.presentation_drafts || []).find((draft) => draft.draft_id === draftId))
    .filter(Boolean);
  const coverArtwork = artworkById.get(activeDraft?.cover_artwork_id) || orderedArtwork[0];
  const featuredArtworkIds = new Set(activeDraft?.featured_artwork_ids || []);
  const readiness = presentationReadiness(collection, activeDraft);

  const persistState = (nextState) => {
    const saved = saveCollectionFoundation(nextState);
    setCollectionState(saved);
    setSaveMessage(formatSaved(saved.save_state?.last_saved_at));
  };

  const openPreview = () => {
    const saved = saveCollectionFoundation(markPresentationPreviewOpenedState(collectionState, collectionId));
    setCollectionState(saved);
    const savedDraft = findActivePresentationDraft(saved, collectionId);
    rememberPreviewReturnState({
      returnTo: `${location.pathname}${location.search}${location.hash}`,
      collectionId,
      draftId: savedDraft?.draft_id,
    });
    nav(`/studio/collections/${collectionId}/presentation/preview`);
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
          <h1 className="font-serif text-4xl mt-4">Presentation belongs in the Artist Studio.</h1>
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
      ) : collectionState && artist && collection && activeDraft ? (
        <main className="max-w-[1500px] mx-auto px-6 sm:px-10 py-10 sm:py-14" data-testid="collection-presentation">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div className="max-w-3xl">
              <span className="overline text-neutral-500">Presentation</span>
              <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">{collection.title}</h1>
              <p className="text-neutral-600 mt-5 text-lg leading-relaxed">
                Shape the visual narrative collectors experience before anything becomes public.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-neutral-500" aria-live="polite">
                {saveMessage || formatSaved(collectionState.save_state?.last_saved_at)}
              </span>
              <button type="button" className="btn-secondary" onClick={() => nav("/studio/collections")}>
                Return to Collections
              </button>
              <button type="button" className="btn-primary" onClick={openPreview}>
                Preview Collection
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-14 items-start">
            <div className="xl:col-span-8">
              <div className="bg-white border border-neutral-200">
                <div className="aspect-[16/11] bg-neutral-100 overflow-hidden">
                  {coverArtwork?.primary_image?.url ? (
                    <img
                      src={coverArtwork.primary_image.url}
                      alt={coverArtwork.accessibility_description || coverArtwork.primary_image.alt}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center px-8 text-center">
                      <p className="font-serif text-3xl text-neutral-500">This Presentation is ready for its cover Artwork.</p>
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-8">
                  <span className="overline text-neutral-500">Active Draft</span>
                  <h2 className="font-serif text-4xl tracking-tight mt-4">{activeDraft.title}</h2>
                  <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-500">
                    <span>{orderedArtwork.length} {orderedArtwork.length === 1 ? "Artwork" : "Artworks"}</span>
                    <span>{featuredArtworkIds.size} Featured</span>
                    <span>Spacing: {activeDraft.presentation_settings?.spacing || "generous"}</span>
                    <span>Rhythm: {activeDraft.visual_rhythm || "quiet"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-px bg-neutral-200 border border-neutral-200">
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeDraft.cover_artwork_id === artwork.artwork_id && <span className="ai-badge">Cover Artwork</span>}
                        {featuredArtworkIds.has(artwork.artwork_id) && <span className="ai-badge">Featured Work</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="xl:col-span-4 xl:sticky xl:top-28 space-y-8">
              <PresentationReadiness readiness={readiness} onPreview={openPreview} />

              <section className="bg-white border border-neutral-200 p-6 sm:p-7">
                <label className="overline text-neutral-500" htmlFor="presentation-draft">Presentation Draft</label>
                <select
                  id="presentation-draft"
                  className="input-luxury mt-3"
                  value={activeDraft.draft_id}
                  onChange={(event) => persistState(setActivePresentationDraftState(collectionState, collectionId, event.target.value))}
                >
                  {savedDrafts.map((draft) => (
                    <option key={draft.draft_id} value={draft.draft_id}>
                      {draft.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-secondary mt-4 w-full"
                  onClick={() => persistState(createSavedPresentationDraftState(collectionState, collectionId))}
                >
                  Save Another Draft
                </button>
              </section>

              <section className="bg-white border border-neutral-200 p-6 sm:p-7">
                <span className="overline text-neutral-500">Cover Artwork</span>
                <div className="mt-5 space-y-2">
                  {orderedArtwork.map((artwork) => (
                    <button
                      key={artwork.artwork_id}
                      type="button"
                      className={`w-full text-left border p-4 ${activeDraft.cover_artwork_id === artwork.artwork_id ? "border-neutral-900" : "border-neutral-200"}`}
                      onClick={() => persistState(setPresentationCoverArtworkState(collectionState, collectionId, artwork.artwork_id))}
                    >
                      <span className="font-serif text-2xl">{artwork.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="bg-white border border-neutral-200 p-6 sm:p-7">
                <span className="overline text-neutral-500">Featured Works</span>
                <div className="mt-5 space-y-2">
                  {orderedArtwork.map((artwork) => (
                    <label key={artwork.artwork_id} className="flex items-start gap-3 border border-neutral-200 p-4 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={featuredArtworkIds.has(artwork.artwork_id)}
                        onChange={() => persistState(togglePresentationFeaturedArtworkState(collectionState, collectionId, artwork.artwork_id))}
                      />
                      <span>
                        <span className="block font-serif text-2xl">{artwork.title}</span>
                        <span className="block text-sm text-neutral-500 mt-1">Include as a featured work in this draft.</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </aside>
          </section>
        </main>
      ) : collectionState ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Presentation</span>
          <h1 className="font-serif text-4xl mt-4">This Collection Presentation is not available.</h1>
          <button type="button" className="btn-secondary mt-8" onClick={() => nav("/studio/collections")}>
            Return to Collections
          </button>
        </div>
      ) : (
        <div className="p-16 overline text-neutral-500">Opening Presentation...</div>
      )}
    </div>
  );
}
