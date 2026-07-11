import {
  archiveCollectionState,
  buildCollectionFoundationFromArtistProfile,
  collectionStatus,
  deleteCollectionState,
  duplicateCollectionState,
  findArtwork,
  findCollection,
  moveArtworkInCollectionState,
  restoreCollectionState,
  setCollectionStatusState,
  setFeaturedArtworkState,
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
    expect(duplicated.collections[1]).toEqual(
      expect.objectContaining({
        title: "Featured Collection Study",
        featured: false,
        archived: false,
        artwork_ids: state.collections[0].artwork_ids,
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
    expect(unchanged.collections[0].archived).toBe(false);

    const duplicated = duplicateCollectionState(state, state.collections[0].collection_id);
    const archived = archiveCollectionState(duplicated, duplicated.collections[1].collection_id);
    expect(findCollection(archived, duplicated.collections[1].collection_id).archived).toBe(true);
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
    expect(findCollection(restored, archivedCollectionId).archived).toBe(false);
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
    expect(draft.collections[0].featured).toBe(false);
    expect(draft.collections[0].archived).toBe(false);
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
});
