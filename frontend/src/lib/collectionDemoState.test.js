import {
  archiveCollectionState,
  buildCollectionFoundationFromArtistProfile,
  duplicateCollectionState,
  findArtwork,
  findCollection,
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
});
