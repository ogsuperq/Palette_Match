import {
  DEMO_STUDIO_CONVERSATIONS,
  DEMO_STUDIO_CONVERSATION_HISTORY,
  DEMO_STUDIO_RELATIONSHIPS,
  DEMO_STUDIO_SHARED_COMMITMENTS,
  DEMO_STUDIO_SHARED_REFERENCES,
  MESSAGE_SECTIONS,
  buildAgreementFoundation,
  conversationHistoryForRelationship,
  buildProposalFoundation,
  findStudioRelationship,
  getRelationshipRecommendation,
  groupRelationshipsBySection,
  loadStudioAgreement,
  loadStudioProposal,
  loadStudioConversation,
  saveStudioAgreement,
  saveStudioProposal,
  sharedCommitmentsForRelationship,
  sharedReferencesForRelationship,
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

  it("links each relationship to the Studio Conversation route without duplicating relationship state", () => {
    DEMO_STUDIO_RELATIONSHIPS.forEach((relationship) => {
      expect(relationship.conversation_path).toBe(`/studio/messages/${relationship.relationship_id}`);
      expect(findStudioRelationship(relationship.relationship_id)).toBe(relationship);
    });
  });

  it("provides calm demo conversation data keyed by canonical relationship id", () => {
    DEMO_STUDIO_CONVERSATIONS.forEach((conversation) => {
      const relationship = findStudioRelationship(conversation.relationship_id);

      expect(relationship).toBeTruthy();
      expect(loadStudioConversation(conversation.relationship_id).relationship_id).toBe(conversation.relationship_id);
      conversation.date_groups.forEach((group) => {
        expect(group.label).toBeTruthy();
        group.messages.forEach((message) => {
          expect(message.sender_name).toBeTruthy();
          expect(message.sender_role).toBeTruthy();
          expect(message.body).toBeTruthy();
          expect(message.precise_timestamp).toBeUndefined();
          expect(message.read_receipt).toBeUndefined();
          expect(message.reactions).toBeUndefined();
          expect(message.attachments).toBeUndefined();
        });
      });
    });
  });

  it("keeps Creative References relationship-owned and routed to existing Studio destinations", () => {
    const emilyReferences = sharedReferencesForRelationship("relationship_emily_proposal");

    expect(emilyReferences.map((reference) => reference.reference_type)).toEqual([
      "Artwork",
      "Collection",
      "Presentation",
    ]);
    emilyReferences.forEach((reference) => {
      expect(reference.relationship_id).toBe("relationship_emily_proposal");
      expect(reference.title).toBeTruthy();
      expect(reference.description).toBeTruthy();
      expect(reference.destination_path).toMatch(/^\/studio\//);
      expect(reference.message_id).toBeUndefined();
      expect(reference.uploaded_by).toBeUndefined();
      expect(reference.attachment_url).toBeUndefined();
    });
  });

  it("does not create orphaned Creative References outside canonical relationships", () => {
    DEMO_STUDIO_SHARED_REFERENCES.forEach((reference) => {
      expect(findStudioRelationship(reference.relationship_id)).toBeTruthy();
    });
  });

  it("keeps Shared Commitments relationship-owned without task-management fields", () => {
    const emilyCommitments = sharedCommitmentsForRelationship("relationship_emily_proposal");

    expect(emilyCommitments.map((commitment) => commitment.commitment)).toEqual([
      "First concept",
      "Proposal under review",
      "Final approval",
    ]);
    emilyCommitments.forEach((commitment) => {
      expect(commitment.relationship_id).toBe("relationship_emily_proposal");
      expect(commitment.current_state).toBeTruthy();
      expect(commitment.assignee).toBeUndefined();
      expect(commitment.priority).toBeUndefined();
      expect(commitment.task_id).toBeUndefined();
      expect(commitment.ticket_id).toBeUndefined();
      expect(commitment.due_date).toBeUndefined();
      expect(commitment.reminder_at).toBeUndefined();
      expect(commitment.completed_by).toBeUndefined();
    });
  });

  it("does not create orphaned Shared Commitments outside canonical relationships", () => {
    DEMO_STUDIO_SHARED_COMMITMENTS.forEach((commitment) => {
      expect(findStudioRelationship(commitment.relationship_id)).toBeTruthy();
    });
  });

  it("keeps Conversation History relationship-owned and milestone-centered", () => {
    const emilyHistory = conversationHistoryForRelationship("relationship_emily_proposal");

    expect(emilyHistory.map((entry) => entry.milestone)).toEqual([
      "First conversation",
      "Proposal shared",
      "Presentation reviewed",
    ]);
    emilyHistory.forEach((entry) => {
      expect(entry.relationship_id).toBe("relationship_emily_proposal");
      expect(entry.date_label).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.message_id).toBeUndefined();
      expect(entry.user_id).toBeUndefined();
      expect(entry.actor_id).toBeUndefined();
      expect(entry.event_type).toBeUndefined();
      expect(entry.timestamp).toBeUndefined();
      expect(entry.audit_id).toBeUndefined();
    });
  });

  it("does not create orphaned Conversation History outside canonical relationships", () => {
    DEMO_STUDIO_CONVERSATION_HISTORY.forEach((entry) => {
      expect(findStudioRelationship(entry.relationship_id)).toBeTruthy();
    });
  });

  it("stores Proposal workspace content as relationship-owned local creative text only", () => {
    const relationshipId = "relationship_emily_proposal";
    const foundation = buildProposalFoundation(relationshipId);

    expect(foundation).toEqual({
      relationship_id: relationshipId,
      creative_vision: "",
      artist_perspective: "",
      collector_perspective: "",
      updated_at: "",
    });

    const saved = saveStudioProposal(relationshipId, {
      creative_vision: "A quiet work for the entryway.",
      artist_perspective: "Layered oil with a luminous center.",
      collector_perspective: "A calm welcome home.",
    });

    expect(loadStudioProposal(relationshipId)).toEqual(saved);
    expect(saved.relationship_id).toBe(relationshipId);
    expect(saved.creative_vision).toContain("entryway");
    expect(saved.price).toBeUndefined();
    expect(saved.payment).toBeUndefined();
    expect(saved.contract).toBeUndefined();
    expect(saved.signature).toBeUndefined();
    expect(saved.milestones).toBeUndefined();
    expect(saved.approval_status).toBeUndefined();
  });

  it("stores Agreement foundation content without legal or transaction workflow fields", () => {
    const relationshipId = "relationship_emily_proposal";
    const foundation = buildAgreementFoundation(relationshipId);

    expect(foundation).toEqual({
      relationship_id: relationshipId,
      creative_scope: "",
      creative_journey: "",
      investment: "",
      expectations: "",
      updated_at: "",
    });

    const saved = saveStudioAgreement(relationshipId, {
      creative_scope: "A luminous entryway work.",
      creative_journey: "A calm movement from shared vision toward finished artwork.",
      investment: "A shared commitment to the creation.",
      expectations: "Clear conversation and thoughtful reflection.",
    });

    expect(loadStudioAgreement(relationshipId)).toEqual(saved);
    expect(saved.relationship_id).toBe(relationshipId);
    expect(saved.creative_scope).toContain("entryway");
    expect(saved.signature).toBeUndefined();
    expect(saved.contract).toBeUndefined();
    expect(saved.payment).toBeUndefined();
    expect(saved.invoice).toBeUndefined();
    expect(saved.tax_information).toBeUndefined();
    expect(saved.milestones).toBeUndefined();
    expect(saved.delivery_tracking).toBeUndefined();
  });
});
