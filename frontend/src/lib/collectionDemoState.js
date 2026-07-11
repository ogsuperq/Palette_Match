const COLLECTION_STORE_KEY = "palette_match_collection_foundation";

function nowIso() {
  return new Date().toISOString();
}

function slugPart(value, fallback) {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function buildCollectionFoundationFromArtistProfile(artist = {}) {
  const timestamp = nowIso();
  const artistId = artist.user_id || "artist";
  const portfolioItems = Array.isArray(artist.portfolio) ? artist.portfolio : [];
  const artwork = portfolioItems.map((item, index) => {
    const artworkId = `artwork_${slugPart(artistId, "artist")}_${index + 1}`;
    return {
      artwork_id: artworkId,
      source: {
        type: "legacy_portfolio_bridge",
        portfolio_index: index,
      },
      title: item.title || `Artwork ${index + 1}`,
      year_created: item.year || "",
      medium: item.medium || "",
      dimensions: item.dimensions || "",
      availability: item.availability || artist.availability || "",
      original_or_print_status: item.original_or_print_status || "",
      price: item.price || null,
      collection_ids: [`collection_${slugPart(artistId, "artist")}_featured`],
      featured: index === 0,
      primary_image: {
        url: item.url || "",
        alt: item.accessibility_description || item.title || "Artwork from the artist's Collection",
      },
      detail_images: item.detail_images || [],
      framed_preview: item.framed_preview || null,
      process_photographs: item.process_photographs || [],
      story: {
        inspiration: item.inspiration || "",
        process: item.process || "",
        meaning: item.meaning || "",
        materials: item.materials || "",
        details: item.details || "",
      },
      accessibility_description: item.accessibility_description || "",
      last_updated: timestamp,
    };
  });

  const collectionId = `collection_${slugPart(artistId, "artist")}_featured`;
  const coverArtworkId = artwork[0]?.artwork_id || "";
  const draftId = `draft_${slugPart(artistId, "artist")}_current`;

  const collection = {
    collection_id: collectionId,
    artist_id: artistId,
    title: "Featured Collection",
    short_description: artist.headline || "A quiet introduction to the artist's current body of work.",
    cover_artwork_id: coverArtworkId,
    artwork_ids: artwork.map((item) => item.artwork_id),
    featured: true,
    last_updated: timestamp,
    archived: false,
    collection_story: "",
    active_presentation_draft_id: draftId,
    saved_presentation_draft_ids: [draftId],
  };

  const presentationDraft = {
    draft_id: draftId,
    collection_id: collectionId,
    title: "Current Presentation",
    artwork_order: collection.artwork_ids,
    featured_artwork_ids: coverArtworkId ? [coverArtworkId] : [],
    cover_artwork_id: coverArtworkId,
    collection_descriptions: {
      [collectionId]: collection.short_description,
    },
    presentation_settings: {
      spacing: "generous",
      preview_first: true,
    },
    visual_rhythm: "quiet",
    collection_flow: "featured-first",
    created_at: timestamp,
    updated_at: timestamp,
  };

  return {
    version: 1,
    artist_id: artistId,
    collections: [collection],
    artwork,
    presentation_drafts: [presentationDraft],
    save_state: {
      last_saved_at: timestamp,
      last_meaningful_change_at: timestamp,
      source: "local_demo_collection_foundation",
      restorable: false,
      restoration_label: "Return to this Collection possibility",
    },
  };
}

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(COLLECTION_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(COLLECTION_STORE_KEY, JSON.stringify(store));
}

export function loadCollectionFoundation(artist) {
  const artistId = artist?.user_id || "artist";
  const store = readStore();
  if (store[artistId]) return store[artistId];
  const seeded = buildCollectionFoundationFromArtistProfile(artist);
  store[artistId] = seeded;
  writeStore(store);
  return seeded;
}

export function saveCollectionFoundation(collectionState) {
  const artistId = collectionState?.artist_id || "artist";
  const store = readStore();
  store[artistId] = {
    ...collectionState,
    save_state: {
      ...collectionState.save_state,
      last_saved_at: nowIso(),
    },
  };
  writeStore(store);
  return store[artistId];
}

export function findCollection(collectionState, collectionId) {
  return (collectionState?.collections || []).find((collection) => collection.collection_id === collectionId) || null;
}

export function findArtwork(collectionState, artworkId) {
  return (collectionState?.artwork || []).find((artwork) => artwork.artwork_id === artworkId) || null;
}

export function duplicateCollectionState(collectionState, collectionId) {
  const source = findCollection(collectionState, collectionId);
  if (!source) return collectionState;
  const timestamp = nowIso();
  const copyCount = (collectionState.collections || []).filter((collection) =>
    collection.collection_id.startsWith(`${source.collection_id}_copy`)
  ).length + 1;
  const duplicate = {
    ...source,
    collection_id: `${source.collection_id}_copy_${copyCount}`,
    title: `${source.title} Study`,
    featured: false,
    archived: false,
    last_updated: timestamp,
  };

  return {
    ...collectionState,
    collections: [...collectionState.collections, duplicate],
    save_state: {
      ...collectionState.save_state,
      last_saved_at: timestamp,
      last_meaningful_change_at: timestamp,
      restorable: true,
      restoration_label: "Return to the previous Collection possibility",
    },
  };
}

export function archiveCollectionState(collectionState, collectionId) {
  const activeCollections = (collectionState.collections || []).filter((collection) => !collection.archived);
  if (activeCollections.length <= 1) return collectionState;
  const timestamp = nowIso();

  return {
    ...collectionState,
    collections: collectionState.collections.map((collection) =>
      collection.collection_id === collectionId
        ? { ...collection, archived: true, last_updated: timestamp }
        : collection
    ),
    save_state: {
      ...collectionState.save_state,
      last_saved_at: timestamp,
      last_meaningful_change_at: timestamp,
      restorable: true,
      restoration_label: "Return to the previous Collection possibility",
    },
  };
}
