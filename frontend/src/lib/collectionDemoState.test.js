import {
  archiveCollectionState,
  buildCollectionFoundationFromArtistProfile,
  collectionStatus,
  createSavedPresentationDraftState,
  deleteCollectionState,
  duplicateCollectionState,
  filterCollectionsByView,
  findArtwork,
  findCollection,
  findActivePresentationDraft,
  markPresentationPreviewOpenedState,
  moveArtworkInCollectionState,
  normalizeCollectionFoundation,
  presentationReadiness,
  restoreCollectionState,
  setActivePresentationDraftState,
  setCollectionStatusState,
  setFeaturedArtworkState,
  setPresentationCoverArtworkState,
  togglePresentationFeaturedArtworkState,
  updateCollectionStoryState,
} from "./collectionDemoState";

describe("buildCollectionFoundationFromArtistProfile", () => {
  it("seeds a Collection foundation from legacy portfolio without making portfolio canonical", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      headline: "Coastal oil paintings",
      availability: "Open",
      portfolio: [
        {
          url: "https://example.com/artwork.jpg",
          title: "Morning Tide",
          medium: "Oil",
          year: 2024,
        },
      ],
    });

    expect(state.collections).toHaveLength(1);
    expect(state.artwork).toHaveLength(1);
    expect(state.presentation_drafts).toHaveLength(1);
    expect(state.save_state).toEqual(
      expect.objectContaining({
        source: "local_demo_collection_foundation",
        restoration_label: "Return to this Collection possibility",
      })
    );

    expect(state.portfolio).toBeUndefined();
    expect(state.artwork[0]).toEqual(
      expect.objectContaining({
        title: "Morning Tide",
        medium: "Oil",
        year_created: 2024,
        source: {
          type: "legacy_portfolio_bridge",
          portfolio_index: 0,
        },
      })
    );
    expect(state.collections[0].artwork_ids).toEqual([state.artwork[0].artwork_id]);
    expect(state.presentation_drafts[0].artwork_order).toEqual([state.artwork[0].artwork_id]);
  });

  it("duplicates a Collection without duplicating Artwork records", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });

    const duplicated = duplicateCollectionState(state, state.collections[0].collection_id);

    expect(duplicated.collections).toHaveLength(2);
    expect(duplicated.artwork).toHaveLength(1);
    expect(duplicated.presentation_drafts).toHaveLength(2);
    expect(collectionStatus(duplicated.collections[0])).toBe("Featured");
    expect(duplicated.collections[1]).toEqual(
      expect.objectContaining({
        title: "Featured Collection Study",
        status: "draft",
        artwork_ids: state.collections[0].artwork_ids,
      })
    );
    expect(findActivePresentationDraft(duplicated, duplicated.collections[1].collection_id)).toEqual(
      expect.objectContaining({
        collection_id: duplicated.collections[1].collection_id,
      })
    );
    expect(duplicated.save_state.restorable).toBe(true);
  });

  it("archives a Collection only when another active Collection remains", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });

    const unchanged = archiveCollectionState(state, state.collections[0].collection_id);
    expect(collectionStatus(unchanged.collections[0])).toBe("Featured");

    const duplicated = duplicateCollectionState(state, state.collections[0].collection_id);
    const archived = archiveCollectionState(duplicated, duplicated.collections[1].collection_id);
    expect(collectionStatus(findCollection(archived, duplicated.collections[1].collection_id))).toBe("Archived");
    expect(findArtwork(archived, archived.artwork[0].artwork_id).title).toBe("Morning Tide");
  });

  it("restores an archived Collection to Draft status", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });
    const duplicated = duplicateCollectionState(state, state.collections[0].collection_id);
    const archivedCollectionId = duplicated.collections[1].collection_id;

    const archived = archiveCollectionState(duplicated, archivedCollectionId);
    const restored = restoreCollectionState(archived, archivedCollectionId);

    expect(collectionStatus(findCollection(restored, archivedCollectionId))).toBe("Draft");
    expect(findCollection(restored, archivedCollectionId).status).toBe("draft");
  });

  it("deletes a Collection permanently while keeping the final Collection protected", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });

    const unchanged = deleteCollectionState(state, state.collections[0].collection_id);
    expect(unchanged.collections).toHaveLength(1);

    const duplicated = duplicateCollectionState(state, state.collections[0].collection_id);
    const duplicateId = duplicated.collections[1].collection_id;
    const deleted = deleteCollectionState(duplicated, duplicateId);

    expect(deleted.collections).toHaveLength(1);
    expect(findCollection(deleted, duplicateId)).toBeNull();
    expect(findArtwork(deleted, deleted.artwork[0].artwork_id).title).toBe("Morning Tide");
    expect(deleted.save_state.restorable).toBe(true);
  });

  it("updates Collection Story and status without publishing", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });

    const withStory = updateCollectionStoryState(state, state.collections[0].collection_id, "A quiet coastal study.");
    expect(withStory.collections[0].collection_story).toBe("A quiet coastal study.");

    const draft = setCollectionStatusState(withStory, withStory.collections[0].collection_id, "draft");
    expect(collectionStatus(draft.collections[0])).toBe("Draft");
    expect(draft.collections[0].status).toBe("draft");
    expect(draft.collections[0].featured).toBeUndefined();
    expect(draft.collections[0].archived).toBeUndefined();
  });

  it("sets featured Artwork and reorders Artwork within a Collection", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [
        { url: "https://example.com/one.jpg", title: "First" },
        { url: "https://example.com/two.jpg", title: "Second" },
      ],
    });
    const collectionId = state.collections[0].collection_id;
    const secondArtworkId = state.collections[0].artwork_ids[1];

    const featured = setFeaturedArtworkState(state, collectionId, secondArtworkId);
    expect(featured.collections[0].cover_artwork_id).toBe(secondArtworkId);
    expect(findArtwork(featured, secondArtworkId).featured).toBe(true);

    const reordered = moveArtworkInCollectionState(featured, collectionId, secondArtworkId, "up");
    expect(reordered.collections[0].artwork_ids[0]).toBe(secondArtworkId);
    expect(reordered.save_state.restorable).toBe(true);
  });

  it("normalizes older Collection state with a local active Presentation Draft", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });
    const olderState = {
      ...state,
      collections: state.collections.map(({ active_presentation_draft_id, saved_presentation_draft_ids, ...collection }) => collection),
      presentation_drafts: [],
    };

    const normalized = normalizeCollectionFoundation(olderState);
    const collection = normalized.collections[0];

    expect(collection.active_presentation_draft_id).toBeTruthy();
    expect(collection.saved_presentation_draft_ids).toEqual([collection.active_presentation_draft_id]);
    expect(findActivePresentationDraft(normalized, collection.collection_id)).toEqual(
      expect.objectContaining({
        collection_id: collection.collection_id,
        artwork_order: collection.artwork_ids,
      })
    );
  });

  it("supports active Presentation Draft selection, cover Artwork, and featured works locally", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [
        { url: "https://example.com/one.jpg", title: "First" },
        { url: "https://example.com/two.jpg", title: "Second" },
      ],
    });
    const collectionId = state.collections[0].collection_id;
    const secondArtworkId = state.collections[0].artwork_ids[1];

    const withSavedDraft = createSavedPresentationDraftState(state, collectionId);
    expect(withSavedDraft.collections[0].saved_presentation_draft_ids).toHaveLength(2);
    expect(findActivePresentationDraft(withSavedDraft, collectionId).title).toBe("Presentation Possibility 2");

    const originalDraftId = state.collections[0].active_presentation_draft_id;
    const originalActive = setActivePresentationDraftState(withSavedDraft, collectionId, originalDraftId);
    expect(originalActive.collections[0].active_presentation_draft_id).toBe(originalDraftId);

    const withCover = setPresentationCoverArtworkState(originalActive, collectionId, secondArtworkId);
    expect(findActivePresentationDraft(withCover, collectionId).cover_artwork_id).toBe(secondArtworkId);

    const withFeatured = togglePresentationFeaturedArtworkState(withCover, collectionId, secondArtworkId);
    expect(findActivePresentationDraft(withFeatured, collectionId).featured_artwork_ids).toContain(secondArtworkId);
    expect(findActivePresentationDraft(withFeatured, collectionId).artwork_order).toEqual(state.collections[0].artwork_ids);
  });

  it("derives Presentation Readiness from objective Collection and draft state", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [
        { url: "https://example.com/one.jpg", title: "First" },
        { url: "https://example.com/two.jpg", title: "Second" },
      ],
    });
    const collectionId = state.collections[0].collection_id;

    const initialReadiness = presentationReadiness(
      findCollection(state, collectionId),
      findActivePresentationDraft(state, collectionId)
    );
    expect(initialReadiness.readyToReview).toBe(false);
    expect(initialReadiness.ready).toEqual(
      expect.arrayContaining([
        "Active Presentation Draft available",
        "Artwork included",
        "Artwork order established",
        "Cover artwork selected",
        "Featured artwork chosen",
      ])
    );
    expect(initialReadiness.takingShape).toEqual(
      expect.arrayContaining(["Add a Collection Story", "Preview the presentation"])
    );

    const withStory = updateCollectionStoryState(state, collectionId, "A quiet study in coastal light.");
    const previewed = markPresentationPreviewOpenedState(withStory, collectionId);
    const readyReadiness = presentationReadiness(
      findCollection(previewed, collectionId),
      findActivePresentationDraft(previewed, collectionId)
    );

    expect(readyReadiness.readyToReview).toBe(true);
    expect(readyReadiness.takingShape).toEqual([]);
    expect(readyReadiness.ready).toEqual(
      expect.arrayContaining(["Collection Story included", "Presentation previewed"])
    );
  });

  it("normalizes legacy featured and archived fields into one canonical Collection status", () => {
    const state = buildCollectionFoundationFromArtistProfile({
      user_id: "artist_123",
      portfolio: [{ url: "https://example.com/artwork.jpg", title: "Morning Tide" }],
    });
    const legacyState = {
      ...state,
      collections: [
        { ...state.collections[0], status: undefined, featured: true, archived: false },
        {
          ...state.collections[0],
          collection_id: "legacy_draft",
          status: undefined,
          featured: false,
          archived: false,
        },
        {
          ...state.collections[0],
          collection_id: "legacy_archived",
          status: undefined,
          featured: false,
          archived: true,
        },
      ],
    };

    const normalized = normalizeCollectionFoundation(legacyState);
    const statusTrace = normalized.collections.map((collection) => ({
      collection_id: collection.collection_id,
      raw: {
        status: collection.status,
        featured: collection.featured,
        archived: collection.archived,
      },
      collectionStatus: collectionStatus(collection),
    }));

    expect(statusTrace).toEqual([
      {
        collection_id: state.collections[0].collection_id,
        raw: { status: "featured", featured: undefined, archived: undefined },
        collectionStatus: "Featured",
      },
      {
        collection_id: "legacy_draft",
        raw: { status: "draft", featured: undefined, archived: undefined },
        collectionStatus: "Draft",
      },
      {
        collection_id: "legacy_archived",
        raw: { status: "archived", featured: undefined, archived: undefined },
        collectionStatus: "Archived",
      },
    ]);
  });

  it("filters the exact live demo Collection records through canonical Collection status", () => {
    const liveDemoCollections = [
      {
        collection_id: "collection_demo-collector_featured",
        title: "Featured Collection",
        status: "featured",
      },
      {
        collection_id: "collection_demo-collector_featured_copy_1",
        title: "Featured Collection Study",
        status: "draft",
      },
      {
        collection_id: "collection_demo-collector_featured_copy_2",
        title: "Featured Collection Study",
        status: "archived",
      },
    ];

    expect(filterCollectionsByView(liveDemoCollections, "all").map((collection) => collection.collection_id)).toEqual([
      "collection_demo-collector_featured",
      "collection_demo-collector_featured_copy_1",
    ]);
    expect(filterCollectionsByView(liveDemoCollections, "draft").map((collection) => collection.collection_id)).toEqual([
      "collection_demo-collector_featured_copy_1",
    ]);
    expect(filterCollectionsByView(liveDemoCollections, "featured").map((collection) => collection.collection_id)).toEqual([
      "collection_demo-collector_featured",
    ]);
    expect(filterCollectionsByView(liveDemoCollections, "archived").map((collection) => collection.collection_id)).toEqual([
      "collection_demo-collector_featured_copy_2",
    ]);
  });

  it("repairs the seeded demo Featured Collection if a previous migration persisted it as Draft", () => {
    const previouslyFlattenedState = {
      version: 1,
      artist_id: "demo_collector",
      artwork: [],
      presentation_drafts: [],
      save_state: {},
      collections: [
        {
          collection_id: "collection_demo-collector_featured",
          artist_id: "demo_collector",
          title: "Featured Collection",
          status: "draft",
          artwork_ids: [],
          cover_artwork_id: "",
          short_description: "Luminous abstract oils for calm, layered interiors",
        },
        {
          collection_id: "collection_demo-collector_featured_copy_1",
          artist_id: "demo_collector",
          title: "Featured Collection Study",
          status: "draft",
          artwork_ids: [],
          cover_artwork_id: "",
          short_description: "Luminous abstract oils for calm, layered interiors",
        },
      ],
    };

    const normalized = normalizeCollectionFoundation(previouslyFlattenedState);

    expect(normalized.collections.map((collection) => [collection.collection_id, collection.status])).toEqual([
      ["collection_demo-collector_featured", "featured"],
      ["collection_demo-collector_featured_copy_1", "draft"],
    ]);
    expect(filterCollectionsByView(normalized.collections, "featured").map((collection) => collection.collection_id)).toEqual([
      "collection_demo-collector_featured",
    ]);
    expect(filterCollectionsByView(normalized.collections, "draft").map((collection) => collection.collection_id)).toEqual([
      "collection_demo-collector_featured_copy_1",
    ]);
  });
});
