import { buildCollectionFoundationFromArtistProfile } from "./collectionDemoState";

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
});
