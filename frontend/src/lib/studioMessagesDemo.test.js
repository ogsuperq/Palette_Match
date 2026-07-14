import {
  DEMO_STUDIO_RELATIONSHIPS,
  MESSAGE_SECTIONS,
  getRelationshipRecommendation,
  groupRelationshipsBySection,
} from "./studioMessagesDemo";

describe("studio messages demo relationships", () => {
  it("provides exactly one meaningful recommendation from active relationships", () => {
    const recommendations = DEMO_STUDIO_RELATIONSHIPS.filter((relationship) => relationship.recommendation);
    const recommendation = getRelationshipRecommendation();

    expect(recommendations).toHaveLength(1);
    expect(recommendation.relationship_id).toBe("relationship_emily_proposal");
    expect(recommendation.action_label).toBe("Continue Conversation");
    expect(recommendation.section).toBe("active");
  });

  it("groups relationships by relationship state and priority rather than chronology", () => {
    const grouped = groupRelationshipsBySection([
      {
        relationship_id: "later_active",
        section: "active",
        priority: 3,
      },
      {
        relationship_id: "first_active",
        section: "active",
        priority: 1,
      },
      {
        relationship_id: "completed",
        section: "completed",
        priority: 1,
      },
      {
        relationship_id: "archived",
        section: "archived",
        priority: 1,
      },
    ]);

    expect(MESSAGE_SECTIONS.map((section) => section.id)).toEqual(["active", "completed", "archived"]);
    expect(grouped.active.map((relationship) => relationship.relationship_id)).toEqual(["first_active", "later_active"]);
    expect(grouped.completed.map((relationship) => relationship.relationship_id)).toEqual(["completed"]);
    expect(grouped.archived.map((relationship) => relationship.relationship_id)).toEqual(["archived"]);
  });

  it("keeps card data relationship-centered and visually recognizable", () => {
    DEMO_STUDIO_RELATIONSHIPS.forEach((relationship) => {
      expect(relationship.collaborator.name).toBeTruthy();
      expect(relationship.collaborator.avatar_url).toBeTruthy();
      expect(relationship.artwork.thumbnail_url).toBeTruthy();
      expect(relationship.title).toBeTruthy();
      expect(relationship.stage).toBeTruthy();
      expect(relationship.current_state).toBeTruthy();
      expect(relationship.time_label).toBeTruthy();
      expect(relationship.unread_count).toBeUndefined();
    });
  });
});
