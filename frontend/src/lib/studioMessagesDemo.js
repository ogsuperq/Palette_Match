export const MESSAGE_SECTIONS = [
  {
    id: "active",
    title: "Active Relationships",
    empty: "Active creative relationships will appear here as conversations begin to take shape.",
  },
  {
    id: "completed",
    title: "Completed Relationships",
    empty: "Completed creative relationships will remain easy to revisit when you want to return to their context.",
  },
  {
    id: "archived",
    title: "Archived Relationships",
    empty: "Archived relationships will rest here, available whenever their history becomes useful again.",
  },
];

export const DEMO_STUDIO_RELATIONSHIPS = [
  {
    relationship_id: "relationship_emily_proposal",
    section: "active",
    priority: 1,
    collaborator: {
      name: "Emily Carter",
      role: "Collector",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
    },
    title: "Entryway Commission",
    stage: "Proposal",
    current_state: "Proposal under review",
    time_label: "Today",
    artwork: {
      title: "Tidal Light",
      thumbnail_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=240&q=80",
      alt: "Abstract artwork with luminous layered color",
    },
    recommendation: "Emily reviewed your latest proposal.",
    action_label: "Continue Conversation",
    conversation_path: "/studio/messages/relationship_emily_proposal",
    summary: "A calm abstract piece for an entryway with layered coastal light.",
  },
  {
    relationship_id: "relationship_david_sketch",
    section: "active",
    priority: 2,
    collaborator: {
      name: "David Lin",
      role: "Collector",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
    },
    title: "Living Room Color Study",
    stage: "Sketch review",
    current_state: "Waiting for your thoughts",
    time_label: "Yesterday",
    artwork: {
      title: "Quiet Horizon",
      thumbnail_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=240&q=80",
      alt: "Quiet abstract artwork with warm horizon tones",
    },
    recommendation: "",
    action_label: "Continue Conversation",
    conversation_path: "/studio/messages/relationship_david_sketch",
    summary: "Color direction is taking shape around warm neutrals and quiet movement.",
  },
  {
    relationship_id: "relationship_sarah_planning",
    section: "active",
    priority: 3,
    collaborator: {
      name: "Sarah Mitchell",
      role: "Designer",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
    },
    title: "Dining Room Pairing",
    stage: "Planning",
    current_state: "Conversation active",
    time_label: "This week",
    artwork: {
      title: "Tidal Light",
      thumbnail_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=240&q=80",
      alt: "Abstract artwork with luminous layered color",
    },
    recommendation: "",
    action_label: "Continue Conversation",
    conversation_path: "/studio/messages/relationship_sarah_planning",
    summary: "Early planning for a paired work that can anchor a dining space.",
  },
  {
    relationship_id: "relationship_mara_completed",
    section: "completed",
    priority: 1,
    collaborator: {
      name: "Mara Bell",
      role: "Collector",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    },
    title: "Bedroom Commission",
    stage: "Completed commission",
    current_state: "Completed commission",
    time_label: "Last week",
    artwork: {
      title: "Quiet Horizon",
      thumbnail_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=240&q=80",
      alt: "Quiet abstract artwork with warm horizon tones",
    },
    recommendation: "",
    action_label: "Continue Conversation",
    conversation_path: "/studio/messages/relationship_mara_completed",
    summary: "A finished work with shared decisions preserved for future reference.",
  },
  {
    relationship_id: "relationship_noah_archived",
    section: "archived",
    priority: 1,
    collaborator: {
      name: "Noah Reed",
      role: "Collector",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    },
    title: "Study for a Quiet Hallway",
    stage: "Archived relationship",
    current_state: "Archived for later reference",
    time_label: "Earlier this month",
    artwork: {
      title: "Tidal Light",
      thumbnail_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=240&q=80",
      alt: "Abstract artwork with luminous layered color",
    },
    recommendation: "",
    action_label: "Continue Conversation",
    conversation_path: "/studio/messages/relationship_noah_archived",
    summary: "A paused conversation that remains available as creative context.",
  },
];

export const DEMO_STUDIO_CONVERSATIONS = [
  {
    conversation_id: "conversation_emily_proposal",
    relationship_id: "relationship_emily_proposal",
    date_groups: [
      {
        label: "Earlier this week",
        messages: [
          {
            message_id: "message_emily_1",
            sender_name: "Emily Carter",
            sender_role: "Collector",
            body: "The softer palette feels very close to what we imagined for the entryway. I keep coming back to the way the light gathers near the center.",
          },
          {
            message_id: "message_artist_1",
            sender_name: "Avery Stone",
            sender_role: "Artist",
            body: "That center glow can become the quiet anchor of the piece. I can keep the edges more atmospheric so the work feels welcoming as someone enters the home.",
          },
        ],
      },
      {
        label: "Today",
        messages: [
          {
            message_id: "message_emily_2",
            sender_name: "Emily Carter",
            sender_role: "Collector",
            body: "I reviewed the latest proposal and the direction feels right. Could we keep the lower left area a little calmer?",
          },
        ],
      },
    ],
  },
  {
    conversation_id: "conversation_david_sketch",
    relationship_id: "relationship_david_sketch",
    date_groups: [
      {
        label: "Yesterday",
        messages: [
          {
            message_id: "message_artist_david_1",
            sender_name: "Avery Stone",
            sender_role: "Artist",
            body: "I explored two warmer studies for the room. The second one gives the wall more breathing room while still holding enough movement.",
          },
          {
            message_id: "message_david_1",
            sender_name: "David Lin",
            sender_role: "Collector",
            body: "The second study feels more settled to me. I would love your thoughts on whether the warmer edge could continue across the top.",
          },
        ],
      },
    ],
  },
  {
    conversation_id: "conversation_sarah_planning",
    relationship_id: "relationship_sarah_planning",
    date_groups: [
      {
        label: "This week",
        messages: [
          {
            message_id: "message_sarah_1",
            sender_name: "Sarah Mitchell",
            sender_role: "Designer",
            body: "The dining room has strong morning light. I think a paired work could bring softness without losing structure.",
          },
        ],
      },
    ],
  },
  {
    conversation_id: "conversation_mara_completed",
    relationship_id: "relationship_mara_completed",
    date_groups: [
      {
        label: "Last week",
        messages: [
          {
            message_id: "message_mara_1",
            sender_name: "Mara Bell",
            sender_role: "Collector",
            body: "The finished work feels peaceful in the room. Thank you for carrying the early sketch into something so complete.",
          },
          {
            message_id: "message_artist_mara_1",
            sender_name: "Avery Stone",
            sender_role: "Artist",
            body: "I am so glad it settled into the space. The final piece kept the quiet movement we found in the first study.",
          },
        ],
      },
    ],
  },
  {
    conversation_id: "conversation_noah_archived",
    relationship_id: "relationship_noah_archived",
    date_groups: [],
  },
];

export const DEMO_STUDIO_SHARED_REFERENCES = [
  {
    reference_id: "reference_emily_artwork_tidal_light",
    relationship_id: "relationship_emily_proposal",
    reference_type: "Artwork",
    title: "Tidal Light",
    description: "Shared while discussing proposal revisions.",
    preview_image_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Abstract artwork with luminous layered color",
    destination_path: "/studio/artwork/artwork_demo-artist-mira_1",
  },
  {
    reference_id: "reference_emily_collection_featured",
    relationship_id: "relationship_emily_proposal",
    reference_type: "Collection",
    title: "Featured Collection",
    description: "Shared as a quiet view of the work shaping this direction.",
    preview_image_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Featured Collection cover artwork",
    destination_path: "/studio/collections?collection=collection_demo-artist-mira_featured",
  },
  {
    reference_id: "reference_emily_presentation_current",
    relationship_id: "relationship_emily_proposal",
    reference_type: "Presentation",
    title: "Current Presentation",
    description: "Shared so the proposal can be experienced with artwork order and rhythm.",
    preview_image_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Presentation cover artwork",
    destination_path: "/studio/collections/collection_demo-artist-mira_featured/presentation/preview",
  },
  {
    reference_id: "reference_david_artwork_quiet_horizon",
    relationship_id: "relationship_david_sketch",
    reference_type: "Artwork",
    title: "Quiet Horizon",
    description: "Shared while considering the warmer sketch direction.",
    preview_image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Quiet abstract artwork with warm horizon tones",
    destination_path: "/studio/artwork/artwork_demo-artist-mira_2",
  },
  {
    reference_id: "reference_david_collection_featured",
    relationship_id: "relationship_david_sketch",
    reference_type: "Collection",
    title: "Featured Collection",
    description: "Shared to keep the broader Collection language close at hand.",
    preview_image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Featured Collection artwork detail",
    destination_path: "/studio/collections?collection=collection_demo-artist-mira_featured",
  },
  {
    reference_id: "reference_david_presentation_current",
    relationship_id: "relationship_david_sketch",
    reference_type: "Presentation",
    title: "Current Presentation",
    description: "Shared as a calm presentation view of the active Collection.",
    preview_image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Presentation reference artwork",
    destination_path: "/studio/collections/collection_demo-artist-mira_featured/presentation/preview",
  },
  {
    reference_id: "reference_sarah_artwork_tidal_light",
    relationship_id: "relationship_sarah_planning",
    reference_type: "Artwork",
    title: "Tidal Light",
    description: "Shared while planning a paired work for the dining room.",
    preview_image_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Abstract artwork with luminous layered color",
    destination_path: "/studio/artwork/artwork_demo-artist-mira_1",
  },
  {
    reference_id: "reference_sarah_collection_featured",
    relationship_id: "relationship_sarah_planning",
    reference_type: "Collection",
    title: "Featured Collection",
    description: "Shared to keep the Collection's tone visible during planning.",
    preview_image_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Featured Collection cover artwork",
    destination_path: "/studio/collections?collection=collection_demo-artist-mira_featured",
  },
  {
    reference_id: "reference_sarah_presentation_current",
    relationship_id: "relationship_sarah_planning",
    reference_type: "Presentation",
    title: "Current Presentation",
    description: "Shared to experience the Collection as a composed presentation.",
    preview_image_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=360&q=80",
    preview_alt: "Presentation cover artwork",
    destination_path: "/studio/collections/collection_demo-artist-mira_featured/presentation/preview",
  },
];

export const DEMO_STUDIO_SHARED_COMMITMENTS = [
  {
    commitment_id: "commitment_emily_first_concept",
    relationship_id: "relationship_emily_proposal",
    commitment: "First concept",
    current_state: "Planned for Friday",
  },
  {
    commitment_id: "commitment_emily_proposal_review",
    relationship_id: "relationship_emily_proposal",
    commitment: "Proposal under review",
    current_state: "In progress",
  },
  {
    commitment_id: "commitment_emily_final_approval",
    relationship_id: "relationship_emily_proposal",
    commitment: "Final approval",
    current_state: "Upcoming",
  },
  {
    commitment_id: "commitment_david_sketch_direction",
    relationship_id: "relationship_david_sketch",
    commitment: "Sketch direction",
    current_state: "In progress",
  },
  {
    commitment_id: "commitment_david_color_study",
    relationship_id: "relationship_david_sketch",
    commitment: "Warm color study",
    current_state: "Planned for Friday",
  },
  {
    commitment_id: "commitment_sarah_room_context",
    relationship_id: "relationship_sarah_planning",
    commitment: "Dining room context",
    current_state: "Completed",
  },
  {
    commitment_id: "commitment_sarah_pairing_direction",
    relationship_id: "relationship_sarah_planning",
    commitment: "Artwork pairing direction",
    current_state: "Upcoming",
  },
  {
    commitment_id: "commitment_mara_delivery",
    relationship_id: "relationship_mara_completed",
    commitment: "Artwork delivery",
    current_state: "Completed",
  },
  {
    commitment_id: "commitment_noah_pause",
    relationship_id: "relationship_noah_archived",
    commitment: "Conversation set aside",
    current_state: "Archived for later reference",
  },
];

export const DEMO_STUDIO_CONVERSATION_HISTORY = [
  {
    history_id: "history_emily_first_conversation",
    relationship_id: "relationship_emily_proposal",
    milestone: "First conversation",
    date_label: "Earlier this week",
    description: "Emily shared the feeling she hoped the entryway would carry.",
  },
  {
    history_id: "history_emily_proposal_shared",
    relationship_id: "relationship_emily_proposal",
    milestone: "Proposal shared",
    date_label: "Earlier this week",
    description: "The first proposal gathered palette, scale, and the quiet center of the work.",
  },
  {
    history_id: "history_emily_presentation_reviewed",
    relationship_id: "relationship_emily_proposal",
    milestone: "Presentation reviewed",
    date_label: "Today",
    description: "Emily reviewed the current presentation and named the refinement that matters most.",
  },
  {
    history_id: "history_david_first_conversation",
    relationship_id: "relationship_david_sketch",
    milestone: "First conversation",
    date_label: "Yesterday",
    description: "David described the warmth and breathing room he wanted the room to hold.",
  },
  {
    history_id: "history_david_sketch_shared",
    relationship_id: "relationship_david_sketch",
    milestone: "Sketch shared",
    date_label: "Yesterday",
    description: "A warmer study opened a clearer direction for the living room.",
  },
  {
    history_id: "history_sarah_first_conversation",
    relationship_id: "relationship_sarah_planning",
    milestone: "First conversation",
    date_label: "This week",
    description: "Sarah introduced the dining room light and the possibility of a paired work.",
  },
  {
    history_id: "history_sarah_collection_shared",
    relationship_id: "relationship_sarah_planning",
    milestone: "Collection shared",
    date_label: "This week",
    description: "The Featured Collection gave the planning conversation a shared visual language.",
  },
  {
    history_id: "history_mara_commission_accepted",
    relationship_id: "relationship_mara_completed",
    milestone: "Commission accepted",
    date_label: "Last month",
    description: "The bedroom commission moved forward with a soft horizon as its anchor.",
  },
  {
    history_id: "history_mara_artwork_delivered",
    relationship_id: "relationship_mara_completed",
    milestone: "Artwork delivered",
    date_label: "Last week",
    description: "The finished work settled into the room with the quiet movement from the first study.",
  },
  {
    history_id: "history_noah_first_conversation",
    relationship_id: "relationship_noah_archived",
    milestone: "First conversation",
    date_label: "Earlier this month",
    description: "Noah explored a study for a hallway that may return later.",
  },
];

const CONVERSATION_STORAGE_KEY = "palette_match_studio_conversations_v1";
const DRAFT_STORAGE_PREFIX = "palette_match_studio_conversation_draft_v1:";
const PROPOSAL_STORAGE_KEY = "palette_match_studio_proposals_v1";

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readStoredConversations() {
  if (!canUseLocalStorage()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(CONVERSATION_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStoredConversations(conversations) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
}

function readStoredProposals() {
  if (!canUseLocalStorage()) return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROPOSAL_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStoredProposals(proposals) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(PROPOSAL_STORAGE_KEY, JSON.stringify(proposals));
}

export function groupRelationshipsBySection(relationships = DEMO_STUDIO_RELATIONSHIPS) {
  return MESSAGE_SECTIONS.reduce((groups, section) => {
    groups[section.id] = relationships
      .filter((relationship) => relationship.section === section.id)
      .sort((a, b) => a.priority - b.priority);
    return groups;
  }, {});
}

export function getRelationshipRecommendation(relationships = DEMO_STUDIO_RELATIONSHIPS) {
  return [...relationships]
    .filter((relationship) => relationship.section === "active" && relationship.recommendation)
    .sort((a, b) => a.priority - b.priority)[0] || null;
}

export function findStudioRelationship(relationshipId, relationships = DEMO_STUDIO_RELATIONSHIPS) {
  return relationships.find((relationship) => relationship.relationship_id === relationshipId) || null;
}

export function loadStudioConversation(relationshipId) {
  const stored = readStoredConversations();
  const storedConversation = stored[relationshipId];
  if (storedConversation) return storedConversation;
  return DEMO_STUDIO_CONVERSATIONS.find((conversation) => conversation.relationship_id === relationshipId) || {
    conversation_id: `conversation_${relationshipId}`,
    relationship_id: relationshipId,
    date_groups: [],
  };
}

export function sharedReferencesForRelationship(relationshipId, references = DEMO_STUDIO_SHARED_REFERENCES) {
  return references.filter((reference) => reference.relationship_id === relationshipId);
}

export function sharedCommitmentsForRelationship(relationshipId, commitments = DEMO_STUDIO_SHARED_COMMITMENTS) {
  return commitments.filter((commitment) => commitment.relationship_id === relationshipId);
}

export function conversationHistoryForRelationship(relationshipId, history = DEMO_STUDIO_CONVERSATION_HISTORY) {
  return history.filter((milestone) => milestone.relationship_id === relationshipId);
}

export function appendStudioConversationMessage(relationshipId, body, sender = { name: "Avery Stone", role: "Artist" }) {
  const message = {
    message_id: `message_${relationshipId}_${Date.now()}`,
    sender_name: sender.name,
    sender_role: sender.role,
    body: body.trim(),
  };
  const stored = readStoredConversations();
  const conversation = loadStudioConversation(relationshipId);
  const dateGroups = conversation.date_groups?.length ? [...conversation.date_groups] : [];
  const lastGroup = dateGroups[dateGroups.length - 1];

  if (lastGroup?.label === "Today") {
    dateGroups[dateGroups.length - 1] = {
      ...lastGroup,
      messages: [...lastGroup.messages, message],
    };
  } else {
    dateGroups.push({
      label: "Today",
      messages: [message],
    });
  }

  const nextConversation = {
    ...conversation,
    date_groups: dateGroups,
  };
  stored[relationshipId] = nextConversation;
  writeStoredConversations(stored);
  return nextConversation;
}

export function loadConversationDraft(relationshipId) {
  if (!canUseLocalStorage()) return "";
  return window.localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${relationshipId}`) || "";
}

export function saveConversationDraft(relationshipId, draft) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${relationshipId}`, draft);
}

export function clearConversationDraft(relationshipId) {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${relationshipId}`);
}

export function buildProposalFoundation(relationshipId) {
  return {
    relationship_id: relationshipId,
    creative_vision: "",
    artist_perspective: "",
    collector_perspective: "",
    updated_at: "",
  };
}

export function loadStudioProposal(relationshipId) {
  const stored = readStoredProposals();
  return stored[relationshipId] || buildProposalFoundation(relationshipId);
}

export function saveStudioProposal(relationshipId, proposal) {
  const stored = readStoredProposals();
  const nextProposal = {
    ...buildProposalFoundation(relationshipId),
    ...proposal,
    relationship_id: relationshipId,
    updated_at: new Date().toISOString(),
  };
  stored[relationshipId] = nextProposal;
  writeStoredProposals(stored);
  return nextProposal;
}
