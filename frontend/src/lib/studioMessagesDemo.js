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
    current_state: "Collector reviewing proposal",
    time_label: "Today",
    artwork: {
      title: "Tidal Light",
      thumbnail_url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=240&q=80",
      alt: "Abstract artwork with luminous layered color",
    },
    recommendation: "Emily reviewed your latest proposal.",
    action_label: "Continue Conversation",
    conversation_path: "/project/demo_project_relationship_emily",
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
    conversation_path: "/project/demo_project_relationship_david",
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
    conversation_path: "/project/demo_project_relationship_sarah",
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
    conversation_path: "/project/demo_project_relationship_mara",
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
    conversation_path: "/project/demo_project_relationship_noah",
    summary: "A paused conversation that remains available as creative context.",
  },
];

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
