import { DEMO_ARTISTS, listDemoProjects } from "./demoMode";
import {
  appendStudioConversationMessage,
  conversationHistoryForRelationship,
  DEMO_STUDIO_RELATIONSHIPS,
  DEMO_STUDIO_SHARED_COMMITMENTS,
  loadStudioConversation,
  sharedCommitmentsForRelationship,
  sharedReferencesForRelationship,
} from "./studioMessagesDemo";

const DEFAULT_ARTIST = DEMO_ARTISTS[0] || {};
const CONCIERGE_DRAFT_STORAGE_PREFIX = "palette_match_concierge_conversation_draft_v1:";
export const CONCIERGE_MESSAGE_SECTIONS = [
  {
    id: "attention",
    title: "Needs Your Review",
    empty: "Conversations that need your perspective will appear here with their commission context preserved.",
  },
  {
    id: "active",
    title: "Active Creative Partnerships",
    empty: "Active creative relationships will appear here as commissions begin to take shape.",
  },
  {
    id: "completed",
    title: "Completed Commissions",
    empty: "Completed commissions will remain easy to revisit when their context becomes useful.",
  },
  {
    id: "archived",
    title: "Set Aside for Later",
    empty: "Relationships set aside for later will rest here without creating noise.",
  },
];

function activeRelationships(relationships) {
  return (relationships || [])
    .filter((relationship) => relationship.section === "active")
    .sort((a, b) => a.priority - b.priority);
}

function artistFromDemo(artist = DEFAULT_ARTIST) {
  return {
    artist_id: artist.user_id,
    name: artist.name,
    avatar_url: artist.picture,
    headline: artist.headline,
    role: "Artist",
  };
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function commissionStateLabel(status = "") {
  const labels = {
    matching: "Artist possibilities are being gathered",
    matched: "Artist possibilities are ready to explore",
    awaiting_approval: "Ready for your review",
    artist_selected: "Artist selected",
    deposit_pending: "Agreement details are being prepared",
    in_progress: "Creative work in progress",
    completed: "Arrival",
  };
  return labels[status] || "Creative engagement active";
}

export function conciergeRelationshipStateLabel(currentState = "") {
  return currentState === "Waiting for your thoughts" ? "Awaiting Your Feedback" : currentState;
}

export function listConciergeRelationships({
  relationships = DEMO_STUDIO_RELATIONSHIPS,
  artist = DEFAULT_ARTIST,
} = {}) {
  return activeRelationships(relationships).map((relationship) => ({
    relationship_id: relationship.relationship_id,
    artist: artistFromDemo(artist),
    title: relationship.title,
    stage: relationship.stage,
    current_state: conciergeRelationshipStateLabel(relationship.current_state),
    time_label: relationship.time_label,
    creative_context: relationship.summary,
    artwork: relationship.artwork,
    destination_path: `/concierge/messages/${relationship.relationship_id}`,
    action_label: "Continue Conversation",
  }));
}

export function listConciergeCommissions(projects = []) {
  return (projects || []).map((project) => ({
    commission_id: project.project_id,
    title: project.title,
    current_state: commissionStateLabel(project.status),
    creative_context: project.ai_brief || project.description || "A creative engagement is taking shape.",
    destination_path: `/project/${project.project_id}`,
    action_label: "Open Commission",
    source: {
      type: "legacy_project_bridge",
      project_id: project.project_id,
    },
  }));
}

export function listConciergeConversations({
  relationships = DEMO_STUDIO_RELATIONSHIPS,
  artist = DEFAULT_ARTIST,
} = {}) {
  return activeRelationships(relationships).slice(0, 2).map((relationship) => ({
    relationship_id: relationship.relationship_id,
    artist_name: artist.name,
    artist: artistFromDemo(artist),
    title: relationship.title,
    current_state: conciergeRelationshipStateLabel(relationship.current_state),
    time_label: relationship.time_label,
    creative_context: relationship.summary,
    artwork: relationship.artwork,
    destination_path: `/concierge/messages/${relationship.relationship_id}`,
  }));
}

function conversationSection(relationship = {}) {
  if (relationship.section === "archived") return "archived";
  if (relationship.section === "completed") return "completed";
  if (/waiting|review|thoughts|approval/i.test(relationship.current_state || "")) return "attention";
  return "active";
}

export function listConciergeMessageRelationships({
  relationships = DEMO_STUDIO_RELATIONSHIPS,
  artist = DEFAULT_ARTIST,
} = {}) {
  return (relationships || [])
    .map((relationship) => ({
      relationship_id: relationship.relationship_id,
      section: conversationSection(relationship),
      priority: relationship.priority,
      artist: artistFromDemo(artist),
      title: relationship.title,
      stage: relationship.stage,
      current_state: conciergeRelationshipStateLabel(relationship.current_state),
      attention_label: /waiting|thoughts/i.test(relationship.current_state || "")
        ? "Your perspective will help finalize direction."
        : /review|approval/i.test(relationship.current_state || "")
          ? "Ready for your review"
          : "Context available",
      time_label: relationship.time_label,
      creative_context: relationship.summary,
      artwork: relationship.artwork,
      destination_path: `/concierge/messages/${relationship.relationship_id}`,
    }))
    .sort((a, b) => a.priority - b.priority);
}

export function groupConciergeMessageRelationships(messageRelationships = []) {
  return CONCIERGE_MESSAGE_SECTIONS.reduce((groups, section) => {
    groups[section.id] = messageRelationships.filter((relationship) => relationship.section === section.id);
    return groups;
  }, {});
}

export function getConciergeMessageRecommendation(messageRelationships = []) {
  return messageRelationships.find((relationship) => relationship.section === "attention") ||
    messageRelationships.find((relationship) => relationship.section === "active") ||
    null;
}

export function findConciergeMessageRelationship(relationshipId, options = {}) {
  return listConciergeMessageRelationships(options).find((relationship) => relationship.relationship_id === relationshipId) || null;
}

export function adaptConversationForConcierge(conversation = { date_groups: [] }) {
  return {
    ...conversation,
    date_groups: (conversation.date_groups || []).map((group) => ({
      ...group,
      messages: (group.messages || []).map((message) => ({
        ...message,
        sender_role: message.sender_role === "Collector" ? "Commissioning Partner" : message.sender_role,
      })),
    })),
  };
}

export function loadConciergeConversation(relationshipId) {
  return adaptConversationForConcierge(loadStudioConversation(relationshipId));
}

export function appendConciergeConversationMessage(relationshipId, body, senderName = "Commissioning Partner") {
  return adaptConversationForConcierge(
    appendStudioConversationMessage(relationshipId, body, {
      name: senderName,
      role: "Commissioning Partner",
    })
  );
}

export function loadConciergeConversationDraft(relationshipId) {
  if (!canUseLocalStorage()) return "";
  return window.localStorage.getItem(`${CONCIERGE_DRAFT_STORAGE_PREFIX}${relationshipId}`) || "";
}

export function saveConciergeConversationDraft(relationshipId, draft) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(`${CONCIERGE_DRAFT_STORAGE_PREFIX}${relationshipId}`, draft);
}

export function clearConciergeConversationDraft(relationshipId) {
  if (!canUseLocalStorage()) return;
  window.localStorage.removeItem(`${CONCIERGE_DRAFT_STORAGE_PREFIX}${relationshipId}`);
}

export function creativeReferencesForConciergeRelationship(relationshipId) {
  return sharedReferencesForRelationship(relationshipId).map((reference) => ({
    ...reference,
    destination_path: "",
  }));
}

export function sharedCommitmentsForConciergeRelationship(relationshipId) {
  return sharedCommitmentsForRelationship(relationshipId);
}

export function conversationHistoryForConciergeRelationship(relationshipId) {
  return conversationHistoryForRelationship(relationshipId);
}

export function listConciergeOpportunities(artists = DEMO_ARTISTS) {
  return (artists || []).slice(0, 3).map((artist) => ({
    artist_id: artist.user_id,
    artist_name: artist.name,
    headline: artist.headline,
    artwork: artist.portfolio?.[0]
      ? {
          title: artist.portfolio[0].title,
          image_url: artist.portfolio[0].url,
          alt: artist.portfolio[0].title || `${artist.name} artwork`,
        }
      : null,
    reason_label: [artist.mediums?.[0], artist.specialties?.[0]].filter(Boolean).join(" · "),
    destination_path: `/artist/${artist.user_id}`,
  }));
}

export function listConciergeUpcomingMoments({
  relationships = DEMO_STUDIO_RELATIONSHIPS,
  commitments = DEMO_STUDIO_SHARED_COMMITMENTS,
  artist = DEFAULT_ARTIST,
} = {}) {
  const relationshipById = new Map((relationships || []).map((relationship) => [relationship.relationship_id, relationship]));
  return (commitments || [])
    .filter((commitment) => /planned|upcoming|today/i.test(commitment.current_state || ""))
    .slice(0, 3)
    .map((commitment) => {
      const relationship = relationshipById.get(commitment.relationship_id);
      return {
        moment_id: commitment.commitment_id,
        relationship_id: commitment.relationship_id,
        title: commitment.commitment,
        date_label: commitment.current_state,
        description: relationship
          ? `${artist.name} · ${relationship.title}`
          : `${artist.name} creative relationship`,
      };
    });
}

export function getConciergePrimaryAttention(homeState = {}) {
  const relationship = homeState.relationships?.[0];
  if (relationship) {
    return {
      type: "relationship",
      eyebrow: "Where to begin today",
      title: `Return to ${relationship.artist.name}.`,
      description: `${relationship.title} · ${relationship.current_state}`,
      destination_path: relationship.destination_path,
      action_label: relationship.action_label,
    };
  }

  const commission = homeState.commissions?.[0];
  if (commission) {
    return {
      type: "commission",
      eyebrow: "Where to begin today",
      title: commission.title,
      description: commission.current_state,
      destination_path: commission.destination_path,
      action_label: commission.action_label,
    };
  }

  const opportunity = homeState.opportunities?.[0];
  if (opportunity) {
    return {
      type: "opportunity",
      eyebrow: "Where to begin today",
      title: `Explore ${opportunity.artist_name}.`,
      description: opportunity.headline,
      destination_path: opportunity.destination_path,
      action_label: "Explore Artist",
    };
  }

  return null;
}

export function buildConciergeHomeState({
  commissioningPartnerId = "demo_collector",
  projects,
  artists = DEMO_ARTISTS,
  relationships = DEMO_STUDIO_RELATIONSHIPS,
  commitments = DEMO_STUDIO_SHARED_COMMITMENTS,
} = {}) {
  const bridgedProjects = projects || listDemoProjects();
  const artist = artists[0] || DEFAULT_ARTIST;
  const state = {
    commissioning_partner_id: commissioningPartnerId,
    relationships: listConciergeRelationships({ relationships, artist }),
    commissions: listConciergeCommissions(bridgedProjects),
    conversations: listConciergeConversations({ relationships, artist }),
    opportunities: listConciergeOpportunities(artists),
    upcoming_moments: listConciergeUpcomingMoments({ relationships, commitments, artist }),
    save_state: {
      source: "local_demo_commissioning_partner_concierge",
      legacy_sources: ["demo_artist_bridge", "demo_relationship_bridge", "legacy_project_bridge"],
      last_loaded_at: new Date().toISOString(),
    },
  };
  return {
    ...state,
    primary_attention: getConciergePrimaryAttention(state),
  };
}
