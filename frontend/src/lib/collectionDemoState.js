const COLLECTION_STORE_KEY = "palette_match_collection_foundation";
const COLLECTION_STATUS = {
  draft: "draft",
  featured: "featured",
  archived: "archived",
};

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

function buildPresentationDraftFromCollection(collection, timestamp, title = "Current Presentation") {
  const draftCount = (collection.saved_presentation_draft_ids || []).length + 1;
  const draftId = `${collection.collection_id}_draft_${draftCount}`;
  const coverArtworkId = collection.cover_artwork_id || collection.artwork_ids?.[0] || "";

  return {
    draft_id: draftId,
    collection_id: collection.collection_id,
    title,
    artwork_order: collection.artwork_ids || [],
    featured_artwork_ids: coverArtworkId ? [coverArtworkId] : [],
    cover_artwork_id: coverArtworkId,
    collection_descriptions: {
      [collection.collection_id]: collection.short_description,
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
}

function isSeededFeaturedCollection(collection = {}) {
  return (
    String(collection.collection_id || "").endsWith("_featured") &&
    !String(collection.collection_id || "").includes("_copy_") &&
    collection.title === "Featured Collection"
  );
}

function normalizeCollectionStatus(collection = {}) {
  const rawStatus = String(collection.status || "").toLowerCase();
  if (rawStatus === COLLECTION_STATUS.archived) return COLLECTION_STATUS.archived;
  if (collection.archived === true || collection.archived === "true") return COLLECTION_STATUS.archived;
  if (rawStatus === COLLECTION_STATUS.featured) return COLLECTION_STATUS.featured;
  if (collection.featured === true || collection.featured === "true") return COLLECTION_STATUS.featured;
  if (isSeededFeaturedCollection(collection) && !collection.status_updated_at) return COLLECTION_STATUS.featured;
  if (rawStatus === COLLECTION_STATUS.draft) return COLLECTION_STATUS.draft;
  return COLLECTION_STATUS.draft;
}

function normalizeCollectionRecord(collection) {
  const { featured, archived, ...rest } = collection;
  return {
    ...rest,
    status: normalizeCollectionStatus(collection),
  };
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
    status: COLLECTION_STATUS.featured,
    last_updated: timestamp,
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

export function normalizeCollectionFoundation(collectionState) {
  if (!collectionState) return collectionState;
  const timestamp = nowIso();
  const existingDrafts = collectionState.presentation_drafts || [];
  const nextDrafts = [...existingDrafts];

  const collections = (collectionState.collections || []).map((collection) => {
    const normalizedCollection = normalizeCollectionRecord(collection);
    const savedDraftIds = collection.saved_presentation_draft_ids || [];
    const usableSavedDraftIds = savedDraftIds.filter((draftId) =>
      nextDrafts.some((draft) => draft.draft_id === draftId && draft.collection_id === collection.collection_id)
    );
    const activeDraftId = nextDrafts.some(
      (draft) => draft.draft_id === collection.active_presentation_draft_id && draft.collection_id === collection.collection_id
    )
      ? collection.active_presentation_draft_id
      : usableSavedDraftIds[0];

    if (activeDraftId) {
      return {
        ...normalizedCollection,
        active_presentation_draft_id: activeDraftId,
        saved_presentation_draft_ids: usableSavedDraftIds.includes(activeDraftId)
          ? usableSavedDraftIds
          : [activeDraftId, ...usableSavedDraftIds],
      };
    }

    const draft = buildPresentationDraftFromCollection(collection, timestamp);
    nextDrafts.push(draft);
    return {
      ...normalizedCollection,
      active_presentation_draft_id: draft.draft_id,
      saved_presentation_draft_ids: [draft.draft_id],
    };
  });

  return {
    ...collectionState,
    collections,
    presentation_drafts: nextDrafts,
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
  if (store[artistId]) {
    const normalized = normalizeCollectionFoundation(store[artistId]);
    store[artistId] = normalized;
    writeStore(store);
    return normalized;
  }
  const seeded = buildCollectionFoundationFromArtistProfile(artist);
  store[artistId] = seeded;
  writeStore(store);
  return seeded;
}

export function saveCollectionFoundation(collectionState) {
  const artistId = collectionState?.artist_id || "artist";
  const store = readStore();
  const normalized = normalizeCollectionFoundation(collectionState);
  store[artistId] = {
    ...normalized,
    save_state: {
      ...normalized.save_state,
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

export function findPresentationDraft(collectionState, draftId) {
  return (collectionState?.presentation_drafts || []).find((draft) => draft.draft_id === draftId) || null;
}

export function findActivePresentationDraft(collectionState, collectionId) {
  const collection = findCollection(collectionState, collectionId);
  if (!collection) return null;
  return findPresentationDraft(collectionState, collection.active_presentation_draft_id);
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
    status: COLLECTION_STATUS.draft,
    last_updated: timestamp,
    active_presentation_draft_id: "",
    saved_presentation_draft_ids: [],
  };
  const duplicateDraft = buildPresentationDraftFromCollection(duplicate, timestamp);
  duplicate.active_presentation_draft_id = duplicateDraft.draft_id;
  duplicate.saved_presentation_draft_ids = [duplicateDraft.draft_id];

  return {
    ...collectionState,
    collections: [...collectionState.collections, duplicate],
    presentation_drafts: [...(collectionState.presentation_drafts || []), duplicateDraft],
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
  return setCollectionStatusState(collectionState, collectionId, "archived");
}

export function restoreCollectionState(collectionState, collectionId) {
  return setCollectionStatusState(collectionState, collectionId, "draft");
}

export function deleteCollectionState(collectionState, collectionId) {
  const collections = collectionState?.collections || [];
  if (collections.length <= 1) return collectionState;

  const timestamp = nowIso();
  const nextCollections = collections.filter((collection) => collection.collection_id !== collectionId);
  return withSaveState(collectionState, nextCollections, undefined, timestamp);
}

export function collectionStatus(collection) {
  const status = normalizeCollectionStatus(collection);
  if (status === COLLECTION_STATUS.archived) return "Archived";
  if (status === COLLECTION_STATUS.featured) return "Featured";
  return "Draft";
}

export function filterCollectionsByView(collections = [], view = "all") {
  const activeCollections = collections.filter((collection) => collectionStatus(collection) !== "Archived");
  if (view === "featured") return activeCollections.filter((collection) => collectionStatus(collection) === "Featured");
  if (view === "draft") return activeCollections.filter((collection) => collectionStatus(collection) === "Draft");
  if (view === "archived") return collections.filter((collection) => collectionStatus(collection) === "Archived");
  return activeCollections;
}

function withSaveState(collectionState, collections, artwork, timestamp = nowIso()) {
  return {
    ...collectionState,
    collections,
    artwork: artwork || collectionState.artwork,
    save_state: {
      ...collectionState.save_state,
      last_saved_at: timestamp,
      last_meaningful_change_at: timestamp,
      restorable: true,
      restoration_label: "Return to the previous Collection possibility",
    },
  };
}

function withPresentationSaveState(collectionState, collections, presentationDrafts, timestamp = nowIso()) {
  return {
    ...collectionState,
    collections,
    presentation_drafts: presentationDrafts,
    save_state: {
      ...collectionState.save_state,
      last_saved_at: timestamp,
      last_meaningful_change_at: timestamp,
      restorable: true,
      restoration_label: "Return to the previous Presentation possibility",
    },
  };
}

export function getPresentationArtworkOrder(collection) {
  return collection?.artwork_ids || [];
}

export function createSavedPresentationDraftState(collectionState, collectionId) {
  const collection = findCollection(collectionState, collectionId);
  if (!collection) return collectionState;
  const timestamp = nowIso();
  const draftTitle = `Presentation Possibility ${(collection.saved_presentation_draft_ids || []).length + 1}`;
  const draft = buildPresentationDraftFromCollection(collection, timestamp, draftTitle);
  const collections = collectionState.collections.map((item) =>
    item.collection_id === collectionId
      ? {
          ...item,
          active_presentation_draft_id: draft.draft_id,
          saved_presentation_draft_ids: [...(item.saved_presentation_draft_ids || []), draft.draft_id],
          last_updated: timestamp,
        }
      : item
  );

  return withPresentationSaveState(
    collectionState,
    collections,
    [...(collectionState.presentation_drafts || []), draft],
    timestamp
  );
}

export function setActivePresentationDraftState(collectionState, collectionId, draftId) {
  const collection = findCollection(collectionState, collectionId);
  const draft = findPresentationDraft(collectionState, draftId);
  if (!collection || draft?.collection_id !== collectionId) return collectionState;
  const timestamp = nowIso();
  const collections = collectionState.collections.map((item) =>
    item.collection_id === collectionId
      ? { ...item, active_presentation_draft_id: draftId, last_updated: timestamp }
      : item
  );

  return withPresentationSaveState(collectionState, collections, collectionState.presentation_drafts || [], timestamp);
}

export function setPresentationCoverArtworkState(collectionState, collectionId, artworkId) {
  const collection = findCollection(collectionState, collectionId);
  if (!collection?.artwork_ids?.includes(artworkId)) return collectionState;
  const draft = findActivePresentationDraft(collectionState, collectionId);
  if (!draft) return collectionState;
  const timestamp = nowIso();
  const presentationDrafts = (collectionState.presentation_drafts || []).map((item) =>
    item.draft_id === draft.draft_id
      ? { ...item, cover_artwork_id: artworkId, artwork_order: collection.artwork_ids || [], updated_at: timestamp }
      : item
  );

  return withPresentationSaveState(collectionState, collectionState.collections, presentationDrafts, timestamp);
}

export function togglePresentationFeaturedArtworkState(collectionState, collectionId, artworkId) {
  const collection = findCollection(collectionState, collectionId);
  if (!collection?.artwork_ids?.includes(artworkId)) return collectionState;
  const draft = findActivePresentationDraft(collectionState, collectionId);
  if (!draft) return collectionState;
  const timestamp = nowIso();
  const featuredArtworkIds = new Set(draft.featured_artwork_ids || []);
  if (featuredArtworkIds.has(artworkId)) {
    featuredArtworkIds.delete(artworkId);
  } else {
    featuredArtworkIds.add(artworkId);
  }
  const presentationDrafts = (collectionState.presentation_drafts || []).map((item) =>
    item.draft_id === draft.draft_id
      ? {
          ...item,
          artwork_order: collection.artwork_ids || [],
          featured_artwork_ids: Array.from(featuredArtworkIds),
          updated_at: timestamp,
        }
      : item
  );

  return withPresentationSaveState(collectionState, collectionState.collections, presentationDrafts, timestamp);
}

export function setCollectionStatusState(collectionState, collectionId, status) {
  const normalized = String(status || "").toLowerCase();
  const nextStatus = Object.prototype.hasOwnProperty.call(COLLECTION_STATUS, normalized)
    ? normalized
    : COLLECTION_STATUS.draft;
  const activeCollections = (collectionState.collections || []).filter(
    (collection) => collectionStatus(collection) !== "Archived"
  );
  if (nextStatus === COLLECTION_STATUS.archived && activeCollections.length <= 1) return collectionState;
  const timestamp = nowIso();

  const collections = collectionState.collections.map((collection) => {
    if (collection.collection_id !== collectionId) return collection;
    const { featured, archived, ...rest } = collection;
    return { ...rest, status: nextStatus, status_updated_at: timestamp, last_updated: timestamp };
  });

  return withSaveState(collectionState, collections, undefined, timestamp);
}

export function updateCollectionStoryState(collectionState, collectionId, story) {
  const timestamp = nowIso();
  const collections = collectionState.collections.map((collection) =>
    collection.collection_id === collectionId
      ? { ...collection, collection_story: story, last_updated: timestamp }
      : collection
  );

  return withSaveState(collectionState, collections, undefined, timestamp);
}

export function setFeaturedArtworkState(collectionState, collectionId, artworkId) {
  const collection = findCollection(collectionState, collectionId);
  if (!collection?.artwork_ids?.includes(artworkId)) return collectionState;
  const timestamp = nowIso();
  const collectionArtworkIds = new Set(collection.artwork_ids);
  const collections = collectionState.collections.map((item) =>
    item.collection_id === collectionId
      ? { ...item, cover_artwork_id: artworkId, last_updated: timestamp }
      : item
  );
  const artwork = collectionState.artwork.map((item) =>
    collectionArtworkIds.has(item.artwork_id)
      ? { ...item, featured: item.artwork_id === artworkId, last_updated: timestamp }
      : item
  );

  return withSaveState(collectionState, collections, artwork, timestamp);
}

export function moveArtworkInCollectionState(collectionState, collectionId, artworkId, direction) {
  const collection = findCollection(collectionState, collectionId);
  const currentIndex = collection?.artwork_ids?.indexOf(artworkId) ?? -1;
  if (currentIndex < 0) return collectionState;
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= collection.artwork_ids.length) return collectionState;
  const timestamp = nowIso();
  const nextArtworkIds = [...collection.artwork_ids];
  [nextArtworkIds[currentIndex], nextArtworkIds[targetIndex]] = [nextArtworkIds[targetIndex], nextArtworkIds[currentIndex]];
  const collections = collectionState.collections.map((item) =>
    item.collection_id === collectionId
      ? { ...item, artwork_ids: nextArtworkIds, last_updated: timestamp }
      : item
  );

  return withSaveState(collectionState, collections, undefined, timestamp);
}
