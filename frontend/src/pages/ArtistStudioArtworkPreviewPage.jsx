import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import { findArtwork, loadCollectionFoundation } from "@/lib/collectionDemoState";
import { returnFromPreview } from "@/lib/previewReturnState";

function detailRows(artwork) {
  return [
    ["Year Created", artwork.year_created],
    ["Medium", artwork.medium],
    ["Availability", artwork.availability],
    ["Dimensions", artwork.dimensions],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");
}

function storyEntries(artwork) {
  return Object.entries(artwork.story || {})
    .filter(([, value]) => value)
    .map(([key, value]) => [key.charAt(0).toUpperCase() + key.slice(1), value]);
}

export default function ArtistStudioArtworkPreviewPage() {
  const { artworkId } = useParams();
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
        setError(e.response?.data?.detail || "We could not open this Artwork Preview.");
      }
    }
    loadPreview();
    return () => {
      mounted = false;
    };
  }, [user]);

  const artwork = findArtwork(collectionState, artworkId);
  const stories = artwork ? storyEntries(artwork) : [];
  const details = artwork ? detailRows(artwork) : [];

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="artwork-preview">
      <div className="fixed top-0 left-0 right-0 z-20 bg-[#FAFAFA]/95 border-b border-neutral-200 px-6 sm:px-10 py-4 flex justify-end">
        <button
          type="button"
          className="btn-secondary !py-2 !px-4 text-xs"
          onClick={() => returnFromPreview(nav, `/studio/artwork/${artworkId}`)}
        >
          Return to Artwork
        </button>
      </div>

      {error ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="text-neutral-700">{error}</p>
        </div>
      ) : collectionState && artist && artwork ? (
        <main className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-28 pb-20">
          <section>
            <div className="bg-neutral-100 overflow-hidden">
              {artwork.primary_image?.url ? (
                <img
                  src={artwork.primary_image.url}
                  alt={artwork.accessibility_description || artwork.primary_image.alt}
                  className="w-full max-h-[82vh] object-contain bg-neutral-100"
                />
              ) : (
                <div className="min-h-[56vh] flex items-center justify-center px-8 text-center">
                  <p className="font-serif text-3xl text-neutral-500">This Artwork is ready for its image.</p>
                </div>
              )}
            </div>
            <h1 className="font-serif text-5xl tracking-tighter mt-10">{artwork.title}</h1>
          </section>

          <section className="mt-14">
            <span className="overline text-neutral-500">Story</span>
            {stories.length > 0 ? (
              <div className="mt-5 space-y-6">
                {stories.map(([label, value]) => (
                  <div key={label}>
                    <h2 className="font-serif text-3xl">{label}</h2>
                    <p className="text-neutral-700 mt-2 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 mt-4 leading-relaxed">
                This Artwork can speak first. Its story can be added when the artist is ready.
              </p>
            )}
          </section>

          <section className="mt-14">
            <span className="overline text-neutral-500">Details</span>
            {details.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
                {details.map(([label, value]) => (
                  <div key={label} className="bg-white p-5">
                    <div className="overline text-neutral-500">{label}</div>
                    <p className="text-neutral-800 mt-2">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-600 mt-4">Details can be refined when the artist is ready.</p>
            )}
          </section>
        </main>
      ) : collectionState ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Artwork Preview</span>
          <h1 className="font-serif text-4xl mt-4">This Artwork Preview is not available.</h1>
        </div>
      ) : (
        <div className="p-16 overline text-neutral-500">Opening Artwork Preview...</div>
      )}
    </div>
  );
}
