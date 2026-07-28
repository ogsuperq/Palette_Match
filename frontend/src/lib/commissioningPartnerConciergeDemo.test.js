import {
  buildConciergeHomeState,
  conciergeRelationshipStateLabel,
  getConciergePrimaryAttention,
  adaptConversationForConcierge,
  groupConciergeMessageRelationships,
  listConciergeCommissions,
  listConciergeMessageRelationships,
  listConciergeOpportunities,
  listConciergeRelationships,
} from "./commissioningPartnerConciergeDemo";

const artist = {
  user_id: "artist_mira",
  name: "Mira Solene",
  picture: "mira.jpg",
  headline: "Luminous abstract oils",
  mediums: ["Oil"],
  specialties: ["Large-scale"],
  portfolio: [{ title: "Tidal Light", url: "tidal.jpg" }],
};

const relationship = {
  relationship_id: "relationship_1",
  section: "active",
  priority: 1,
  title: "Entryway Commission",
  stage: "Proposal",
  current_state: "Proposal under review",
  time_label: "Today",
  summary: "A calm abstract piece for an entryway.",
  artwork: {
    title: "Tidal Light",
    thumbnail_url: "tidal.jpg",
    alt: "Abstract artwork",
  },
};

describe("commissioningPartnerConciergeDemo", () => {
  it("uses the same Concierge state label on landing and Messages while preserving legacy data", () => {
    const waitingRelationship = { ...relationship, current_state: "Waiting for your thoughts" };

    expect(listConciergeRelationships({ relationships: [waitingRelationship], artist })[0].current_state).toBe("Awaiting Your Feedback");
    expect(listConciergeMessageRelationships({ relationships: [waitingRelationship], artist })[0].current_state).toBe("Awaiting Your Feedback");
    expect(conciergeRelationshipStateLabel(waitingRelationship.current_state)).toBe("Awaiting Your Feedback");
    expect(waitingRelationship.current_state).toBe("Waiting for your thoughts");
  });

  it("adapts relationship data to Commissioning Partner presentation language", () => {
    const relationships = listConciergeRelationships({ relationships: [relationship], artist });

    expect(relationships).toEqual([
      expect.objectContaining({
        relationship_id: "relationship_1",
        artist: expect.objectContaining({ name: "Mira Solene", role: "Artist" }),
        title: "Entryway Commission",
        action_label: "Continue Conversation",
        destination_path: "/concierge/messages/relationship_1",
      }),
    ]);
    expect(JSON.stringify(relationships)).not.toMatch(/Collector|Dashboard/);
  });

  it("bridges legacy project records into commission summaries without making projects canonical", () => {
    const commissions = listConciergeCommissions([
      {
        project_id: "demo_project_1",
        title: "Entryway artwork",
        status: "matched",
        ai_brief: "A luminous work for an entryway.",
      },
    ]);

    expect(commissions[0]).toEqual(expect.objectContaining({
      commission_id: "demo_project_1",
      current_state: "Artist possibilities are ready to explore",
      source: {
        type: "legacy_project_bridge",
        project_id: "demo_project_1",
      },
    }));
  });

  it("presents opportunities without scores, rankings, or automated authority", () => {
    const opportunities = listConciergeOpportunities([artist]);

    expect(opportunities[0]).toEqual(expect.objectContaining({
      artist_name: "Mira Solene",
      reason_label: "Oil · Large-scale",
      destination_path: "/artist/artist_mira",
    }));
    expect(opportunities[0].score).toBeUndefined();
    expect(opportunities[0].rank).toBeUndefined();
  });

  it("prioritizes relationships before commissions and opportunities", () => {
    const state = buildConciergeHomeState({
      commissioningPartnerId: "partner_1",
      projects: [{ project_id: "demo_project_1", title: "Entryway artwork", status: "matched" }],
      artists: [artist],
      relationships: [relationship],
      commitments: [],
    });

    expect(getConciergePrimaryAttention(state)).toEqual(expect.objectContaining({
      type: "relationship",
      title: "Return to Mira Solene.",
    }));
  });

  it("keeps an early state calm when no relationships or commissions exist", () => {
    const state = buildConciergeHomeState({
      commissioningPartnerId: "partner_1",
      projects: [],
      artists: [artist],
      relationships: [],
      commitments: [],
    });

    expect(state.relationships).toEqual([]);
    expect(state.commissions).toEqual([]);
    expect(state.primary_attention).toEqual(expect.objectContaining({
      type: "opportunity",
      action_label: "Explore Artist",
    }));
  });

  it("groups Concierge message relationships by meaningful attention rather than chronology", () => {
    const messages = listConciergeMessageRelationships({ relationships: [relationship], artist });
    const grouped = groupConciergeMessageRelationships(messages);

    expect(grouped.attention).toEqual([
      expect.objectContaining({
        relationship_id: "relationship_1",
        attention_label: "Ready for your review",
        destination_path: "/concierge/messages/relationship_1",
      }),
    ]);
  });

  it("adapts legacy conversation roles at the presentation layer", () => {
    const conversation = adaptConversationForConcierge({
      conversation_id: "conversation_1",
      relationship_id: "relationship_1",
      date_groups: [
        {
          label: "Today",
          messages: [
            {
              message_id: "message_1",
              sender_name: "Emily Carter",
              sender_role: "Collector",
              body: "This direction feels right.",
            },
          ],
        },
      ],
    });

    expect(conversation.date_groups[0].messages[0].sender_role).toBe("Commissioning Partner");
  });
});
