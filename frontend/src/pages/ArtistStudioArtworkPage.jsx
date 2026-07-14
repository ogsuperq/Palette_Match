import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  findArtwork,
  loadCollectionFoundation,
  saveCollectionFoundation,
  updateArtworkState,
} from "@/lib/collectionDemoState";
import { rememberPreviewReturnState } from "@/lib/previewReturnState";

const ARTIST_DETAIL_PLACEHOLDER = "Not yet specified";

function artistDetailRows(artwork) {
  return [
    ["Year Created", artwork.year_created || ARTIST_DETAIL_PLACEHOLDER],
    ["Medium", artwork.medium || ARTIST_DETAIL_PLACEHOLDER],
    ["Availability", artwork.availability || ARTIST_DETAIL_PLACEHOLDER],
    ["Dimensions", artwork.dimensions || ARTIST_DETAIL_PLACEHOLDER],
  ];
}

function collectorDetailRows(artwork) {
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
    .map(([key, value]) => [key === "meaning" ? "Story" : key.charAt(0).toUpperCase() + key.slice(1), value]);
}

function ArtworkImage({ artwork }) {
  return (
    <div className="bg-neutral-100 overflow-hidden">
      {artwork.primary_image?.url ? (
        <img
          src={artwork.primary_image.url}
          alt={artwork.accessibility_description || artwork.primary_image.alt}
          className="w-full max-h-[78vh] object-contain bg-neutral-100"
        />
      ) : (
        <div className="min-h-[56vh] flex items-center justify-center px-8 text-center">
          <p className="font-serif text-3xl text-neutral-500">This Artwork is ready for its image.</p>
        </div>
      )}
    </div>
  );
}

function StorySection({ artwork }) {
  const entries = storyEntries(artwork);
  return (
    <section>
      <span className="overline text-neutral-500">Story</span>
      {entries.length > 0 ? (
        <div className="mt-4 space-y-5">
          {entries.map(([label, value]) => (
            <div key={label}>
              <h3 className="font-serif text-2xl">{label}</h3>
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
  );
}

function EditableTitle({ artwork, onArtworkChange }) {
  return (
    <div className="mt-6">
      <label className="overline text-neutral-500" htmlFor="artwork-title">Title</label>
      <input
        id="artwork-title"
        className="mt-3 w-full bg-transparent font-serif text-5xl tracking-tighter text-neutral-900 border-0 border-b border-neutral-200 px-0 pb-2 focus:outline-none focus:border-neutral-900"
        value={artwork.title || ""}
        onChange={(event) => onArtworkChange({ title: event.target.value })}
        placeholder="Untitled Artwork"
      />
    </div>
  );
}

function EditableStorySection({ artwork, onArtworkChange }) {
  return (
    <section>
      <label className="overline text-neutral-500" htmlFor="artwork-story">Story</label>
      {!artwork.story?.meaning && (
        <p className="text-neutral-600 mt-4 leading-relaxed">
          Add the story behind this Artwork when you are ready.
        </p>
      )}
      <textarea
        id="artwork-story"
        rows={10}
        className="input-luxury mt-4 leading-relaxed"
        value={artwork.story?.meaning || ""}
        onChange={(event) => onArtworkChange({ story: { meaning: event.target.value } })}
        placeholder="This Artwork may speak first. Add context only when it feels useful."
      />
    </section>
  );
}

function EditableDetailsSection({ artwork, onArtworkChange }) {
  const rows = [
    ["Year Created", "year_created", artwork.year_created || ""],
    ["Medium", "medium", artwork.medium || ""],
    ["Availability", "availability", artwork.availability || ""],
    ["Dimensions", "dimensions", artwork.dimensions || ""],
  ];

  return (
    <section>
      <span className="overline text-neutral-500">Details</span>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
        {rows.map(([label, field, value]) => (
          <label key={field} className="bg-white p-5 block">
            <span className="overline text-neutral-500">{label}</span>
            <input
              className="mt-2 w-full bg-transparent text-neutral-800 border-0 border-b border-neutral-200 px-0 py-1 focus:outline-none focus:border-neutral-900"
              value={value}
              onChange={(event) => onArtworkChange({ [field]: event.target.value })}
              placeholder={ARTIST_DETAIL_PLACEHOLDER}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function DetailsSection({ artwork, audience = "collector" }) {
  const rows = audience === "artist" ? artistDetailRows(artwork) : collectorDetailRows(artwork);
  return (
    <section>
      <span className="overline text-neutral-500">Details</span>
      {rows.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
          {rows.map(([label, value]) => (
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
  );
}

function SaveStateIndicator({ status, visible }) {
  if (!status) return null;
  return (
    <p
      className={`text-xs text-neutral-500 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      aria-live="polite"
    >
      {status}
    </p>
  );
}

function ArtistPerspective({ artwork, collectionTitle, onArtworkChange, onBack, onPreview, saveStatus, saveStatusVisible }) {
  return (
    <main className="max-w-[1500px] mx-auto px-6 sm:px-10 py-10 sm:py-14" data-testid="artwork-artist-perspective">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        <div className="lg:col-span-8">
          <ArtworkImage artwork={artwork} />
        </div>
        <aside className="lg:col-span-4 lg:sticky lg:top-28">
          <span className="overline text-neutral-500">Artist Perspective</span>
          <EditableTitle artwork={artwork} onArtworkChange={onArtworkChange} />
          <p className="text-neutral-600 mt-4 leading-relaxed">
            This view keeps the Artwork at the center while preserving artist-facing context.
          </p>
          <div className="mt-8 bg-white border border-neutral-200 p-6">
            <span className="overline text-neutral-500">Collection</span>
            <p className="font-serif text-2xl mt-3">{collectionTitle}</p>
            {artwork.featured && <span className="ai-badge mt-4">Featured Artwork</span>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-primary" onClick={onPreview}>
              Preview Artwork
            </button>
            <button type="button" className="btn-secondary" onClick={onBack}>
              Return to Collections
            </button>
          </div>
          <div className="mt-4 min-h-[1rem]">
            <SaveStateIndicator status={saveStatus} visible={saveStatusVisible} />
          </div>
        </aside>
      </div>
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        <EditableStorySection artwork={artwork} onArtworkChange={onArtworkChange} />
        <EditableDetailsSection artwork={artwork} onArtworkChange={onArtworkChange} />
      </div>
    </main>
  );
}

function CollectorPerspective({ artwork }) {
  return (
    <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 sm:py-14" data-testid="artwork-collector-perspective">
      <ArtworkImage artwork={artwork} />
      <div className="mt-10">
        <h1 className="font-serif text-5xl tracking-tighter">{artwork.title}</h1>
      </div>
      <div className="mt-12 space-y-12">
        <StorySection artwork={artwork} />
        <DetailsSection artwork={artwork} />
      </div>
    </main>
  );
}

export default function ArtistStudioArtworkPage() {
  const { artworkId } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [artist, setArtist] = useState(null);
  const [collectionState, setCollectionState] = useState(null);
  const [perspective, setPerspective] = useState("artist");
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [saveStatusVisible, setSaveStatusVisible] = useState(false);
  const savedTimer = useRef(null);
  const fadeTimer = useRef(null);
  const clearTimer = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function loadArtwork() {
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
        setError(e.response?.data?.detail || "We could not open this Artwork.");
      }
    }
    loadArtwork();
    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    return () => {
      window.clearTimeout(savedTimer.current);
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(clearTimer.current);
    };
  }, []);

  const artwork = findArtwork(collectionState, artworkId);
  const collectionTitle = useMemo(() => {
    const collection = (collectionState?.collections || []).find((item) => item.artwork_ids?.includes(artworkId));
    return collection?.title || "Collection";
  }, [artworkId, collectionState]);

  const persistArtworkChange = (updates) => {
    window.clearTimeout(savedTimer.current);
    window.clearTimeout(fadeTimer.current);
    window.clearTimeout(clearTimer.current);
    setSaveStatus("Saving…");
    setSaveStatusVisible(true);
    const saved = saveCollectionFoundation(updateArtworkState(collectionState, artworkId, updates));
    setCollectionState(saved);
    savedTimer.current = window.setTimeout(() => {
      setSaveStatus("Changes saved");
      fadeTimer.current = window.setTimeout(() => {
        setSaveStatusVisible(false);
        clearTimer.current = window.setTimeout(() => setSaveStatus(""), 500);
      }, 3500);
    }, 2000);
  };

  const openPreview = () => {
    rememberPreviewReturnState({
      returnTo: `${location.pathname}${location.search}${location.hash}`,
      artworkId,
      perspective,
    });
    nav(`/studio/artwork/${artworkId}/preview`);
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
          <h1 className="font-serif text-4xl mt-4">Artwork belongs in the Artist Studio.</h1>
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
      ) : collectionState && artist && artwork ? (
        <>
          <div className="max-w-[1500px] mx-auto px-6 sm:px-10 pt-8">
            <div className="inline-flex gap-px bg-neutral-200 border border-neutral-200" data-testid="perspective-toggle">
              <button
                type="button"
                className={`px-4 py-3 text-sm ${perspective === "artist" ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}
                onClick={() => setPerspective("artist")}
              >
                Artist Perspective
              </button>
              <button
                type="button"
                className={`px-4 py-3 text-sm ${perspective === "collector" ? "bg-neutral-900 text-white" : "bg-white text-neutral-700"}`}
                onClick={() => setPerspective("collector")}
              >
                Collector Perspective
              </button>
            </div>
          </div>
          {perspective === "collector" ? (
            <CollectorPerspective artwork={artwork} />
          ) : (
            <ArtistPerspective
              artwork={artwork}
              collectionTitle={collectionTitle}
              onArtworkChange={persistArtworkChange}
              onBack={() => nav("/studio/collections")}
              onPreview={openPreview}
              saveStatus={saveStatus}
              saveStatusVisible={saveStatusVisible}
            />
          )}
        </>
      ) : collectionState ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Artwork</span>
          <h1 className="font-serif text-4xl mt-4">This Artwork is not available.</h1>
          <button type="button" className="btn-secondary mt-8" onClick={() => nav("/studio/collections")}>
            Return to Collections
          </button>
        </div>
      ) : (
        <div className="p-16 overline text-neutral-500">Opening Artwork...</div>
      )}
    </div>
  );
}
