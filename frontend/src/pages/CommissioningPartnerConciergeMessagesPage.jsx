import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WorkspaceReturn from "@/components/WorkspaceReturn";
import { useAuth } from "@/lib/AuthContext";
import { isDemoModeEnabled } from "@/lib/demoMode";
import {
  appendConciergeConversationMessage,
  clearConciergeConversationDraft,
  CONCIERGE_MESSAGE_SECTIONS,
  conversationHistoryForConciergeRelationship,
  creativeReferencesForConciergeRelationship,
  findConciergeMessageRelationship,
  getConciergeMessageRecommendation,
  groupConciergeMessageRelationships,
  listConciergeMessageRelationships,
  loadConciergeConversation,
  loadConciergeConversationDraft,
  saveConciergeConversationDraft,
  sharedCommitmentsForConciergeRelationship,
} from "@/lib/commissioningPartnerConciergeDemo";

function MessageRelationshipCard({ relationship, onOpen }) {
  return (
    <button
      type="button"
      className="w-full bg-white p-5 sm:p-6 text-left transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
      onClick={onOpen}
      data-testid={`concierge-message-card-${relationship.relationship_id}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={relationship.artist.avatar_url}
            alt={relationship.artist.name}
            className="h-12 w-12 rounded-full object-cover bg-neutral-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 truncate">{relationship.artist.name}</p>
            <p className="text-xs text-neutral-500">{relationship.artist.headline}</p>
          </div>
        </div>
        <span className="text-xs text-neutral-500 flex-shrink-0">{relationship.time_label}</span>
      </div>

      <div className="mt-5 flex gap-4">
        <div className="w-20 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0">
          <img
            src={relationship.artwork.thumbnail_url}
            alt={relationship.artwork.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <span className="overline text-neutral-500">{relationship.stage}</span>
          <h3 className="font-serif text-2xl tracking-tight mt-2">{relationship.title}</h3>
          <p className="text-sm text-neutral-700 mt-2">{relationship.current_state}</p>
          <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{relationship.creative_context}</p>
          <p className="text-xs text-neutral-500 mt-5">{relationship.attention_label}</p>
        </div>
      </div>
    </button>
  );
}

function MessageSection({ section, relationships, onOpen }) {
  return (
    <section data-testid={`concierge-message-section-${section.id}`}>
      <h2 className="font-serif text-3xl tracking-tight">{section.title}</h2>
      <div className="mt-5 space-y-px bg-neutral-200 border border-neutral-200">
        {relationships.length ? (
          relationships.map((relationship) => (
            <MessageRelationshipCard
              key={relationship.relationship_id}
              relationship={relationship}
              onOpen={() => onOpen(relationship)}
            />
          ))
        ) : (
          <div className="bg-white p-6 sm:p-8">
            <p className="text-sm text-neutral-600 leading-relaxed">{section.empty}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function MessagesInbox() {
  const nav = useNavigate();
  const relationships = useMemo(() => listConciergeMessageRelationships(), []);
  const groupedRelationships = useMemo(() => groupConciergeMessageRelationships(relationships), [relationships]);
  const recommendation = useMemo(() => getConciergeMessageRecommendation(relationships), [relationships]);

  function openRelationship(relationship) {
    nav(relationship.destination_path);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA]" data-testid="concierge-messages">
      <section className="max-w-[1300px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <WorkspaceReturn workspace="concierge" className="mb-10" />
        <div className="max-w-3xl">
          <span className="overline text-neutral-500">Commissioning Partner Concierge</span>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">Messages</h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">Welcome back.</p>
          <p className="text-neutral-600 mt-2 leading-relaxed">
            Here are the conversations that matter today.
          </p>
        </div>

        {recommendation && (
          <div
            className="mt-10 bg-white border border-neutral-200 p-7 sm:p-8"
            data-testid="concierge-messages-recommendation"
          >
            <span className="overline text-neutral-500">Where to begin today</span>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:items-end">
              <div>
                <h2 className="font-serif text-3xl tracking-tight">{recommendation.artist.name}</h2>
                <p className="text-neutral-600 mt-3 leading-relaxed">
                  {recommendation.title} · {recommendation.attention_label}
                </p>
              </div>
              <button type="button" className="btn-primary" onClick={() => openRelationship(recommendation)}>
                Open Conversation
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 space-y-12">
          {CONCIERGE_MESSAGE_SECTIONS.map((section) => (
            <MessageSection
              key={section.id}
              section={section}
              relationships={groupedRelationships[section.id] || []}
              onOpen={openRelationship}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function RelationshipHeader({ relationship }) {
  return (
    <header className="max-w-4xl mx-auto">
      <span className="overline text-neutral-500">Conversation</span>
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <img
          src={relationship.artist.avatar_url}
          alt={relationship.artist.name}
          className="h-16 w-16 rounded-full object-cover bg-neutral-100"
        />
        <div>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter">{relationship.artist.name}</h1>
          <p className="text-neutral-700 mt-3 text-lg">{relationship.title}</p>
          <p className="text-sm text-neutral-500 mt-2">{relationship.stage}</p>
        </div>
      </div>
      <p className="text-neutral-700 mt-8 text-lg leading-relaxed">Begin with clarity.</p>
      <p className="text-neutral-600 mt-2 leading-relaxed">
        The best creative partnerships are built one thoughtful conversation at a time.
      </p>
    </header>
  );
}

function CommissionContext({ relationship }) {
  return (
    <section className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-5 sm:p-6" data-testid="concierge-commission-context">
      <span className="overline text-neutral-500">Current Commission</span>
      <div className="mt-4 flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="w-28 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0">
          <img
            src={relationship.artwork.thumbnail_url}
            alt={relationship.artwork.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-2xl tracking-tight">{relationship.artwork.title}</h2>
          <p className="text-sm text-neutral-700 mt-2">{relationship.current_state}</p>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{relationship.creative_context}</p>
        </div>
      </div>
    </section>
  );
}

function ContextAtAGlance({ relationship }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-6 sm:p-7" data-testid="concierge-context-summary">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <span className="overline text-neutral-500">Before You Respond</span>
          <h2 className="font-serif text-3xl tracking-tight mt-3">The strongest partnerships begin with clarity.</h2>
        </div>
        <button type="button" className="btn-secondary !py-2 !px-4" onClick={() => setOpen((value) => !value)}>
          {open ? "Hide Details" : "View Details"}
        </button>
      </div>
      {open && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
          <div className="bg-white p-5">
            <span className="overline text-neutral-500">Artist</span>
            <p className="font-serif text-2xl tracking-tight mt-3">{relationship.artist.name}</p>
          </div>
          <div className="bg-white p-5">
            <span className="overline text-neutral-500">Commission</span>
            <p className="font-serif text-2xl tracking-tight mt-3">{relationship.title}</p>
          </div>
          <div className="bg-white p-5">
            <span className="overline text-neutral-500">Attention</span>
            <p className="font-serif text-2xl tracking-tight mt-3">{relationship.attention_label}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function ConversationTimeline({ conversation }) {
  const hasMessages = conversation.date_groups?.some((group) => group.messages?.length);

  if (!hasMessages) {
    return (
      <section className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-8 sm:p-10" data-testid="concierge-conversation-timeline">
        <h2 className="font-serif text-3xl tracking-tight">The conversation can begin here.</h2>
        <p className="text-neutral-600 mt-3 leading-relaxed">
          When this commission is ready for dialogue, your shared thoughts will gather in this space.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="concierge-conversation-timeline" aria-label="Conversation timeline">
      {conversation.date_groups.map((group) => (
        <div key={group.label} className="mt-10 first:mt-0">
          <div className="flex items-center gap-4">
            <div className="h-px bg-neutral-200 flex-1" />
            <span className="text-xs text-neutral-500">{group.label}</span>
            <div className="h-px bg-neutral-200 flex-1" />
          </div>
          <div className="mt-8 space-y-8">
            {group.messages.map((message) => (
              <article key={message.message_id} className="bg-white border border-neutral-200 p-6 sm:p-7">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-medium text-neutral-900">{message.sender_name}</h3>
                  <span className="text-xs text-neutral-500">{message.sender_role}</span>
                </div>
                <p className="text-neutral-700 mt-4 leading-8 whitespace-pre-wrap">{message.body}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function CreativeReferences({ references }) {
  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="concierge-creative-references">
      <div>
        <span className="overline text-neutral-500">Creative References</span>
        <h2 className="font-serif text-3xl tracking-tight mt-3">Relevant material for this commission.</h2>
        <p className="text-neutral-600 mt-2 leading-relaxed">Artwork, Collections, and presentations remain close to the conversation.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
        {references.length ? (
          references.map((reference) => (
            <article
              key={reference.reference_id}
              className="bg-white p-5"
              data-testid={`concierge-reference-${reference.reference_id}`}
            >
              {reference.preview_image_url && (
                <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                  <img
                    src={reference.preview_image_url}
                    alt={reference.preview_alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <span className="overline text-neutral-500 block mt-5">{reference.reference_type}</span>
              <h3 className="font-serif text-2xl tracking-tight mt-2">{reference.title}</h3>
              <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{reference.description}</p>
            </article>
          ))
        ) : (
          <div className="bg-white p-6 sm:p-8 md:col-span-3">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Creative references will appear here when they become part of the commission conversation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SharedCommitments({ commitments }) {
  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="concierge-shared-commitments">
      <div>
        <span className="overline text-neutral-500">Shared Commitments</span>
        <h2 className="font-serif text-3xl tracking-tight mt-3">Current points of understanding.</h2>
        <p className="text-neutral-600 mt-2 leading-relaxed">Clear, current, and easy to reference.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
        {commitments.length ? (
          commitments.map((commitment) => (
            <article key={commitment.commitment_id} className="bg-white p-5 sm:p-6">
              <span className="overline text-neutral-500">Commitment</span>
              <h3 className="font-serif text-2xl tracking-tight mt-3">{commitment.commitment}</h3>
              <p className="text-neutral-700 mt-5 leading-relaxed">{commitment.current_state}</p>
            </article>
          ))
        ) : (
          <div className="bg-white p-6 sm:p-8 md:col-span-3">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Shared commitments will appear here when the commission has points of understanding to preserve.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ConversationHistory({ history }) {
  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="concierge-conversation-history">
      <div>
        <span className="overline text-neutral-500">Conversation History</span>
        <h2 className="font-serif text-3xl tracking-tight mt-3">Every conversation moves the partnership forward.</h2>
      </div>

      <div className="mt-7 space-y-6">
        {history.length ? (
          history.map((milestone) => (
            <article key={milestone.history_id} className="bg-white border border-neutral-200 p-6 sm:p-7">
              {milestone.date_label && <p className="text-xs text-neutral-500">{milestone.date_label}</p>}
              <h3 className="font-serif text-2xl tracking-tight mt-3">{milestone.milestone}</h3>
              {milestone.description && <p className="text-neutral-600 mt-3 leading-relaxed">{milestone.description}</p>}
            </article>
          ))
        ) : (
          <div className="bg-white border border-neutral-200 p-6 sm:p-8">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Meaningful moments from this commission will gather here over time.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ConversationComposer({ value, onChange, onSubmit }) {
  return (
    <form className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-5 sm:p-6" onSubmit={onSubmit}>
      <label htmlFor="concierge-conversation-composer" className="overline text-neutral-500">
        Continue the conversation
      </label>
      <textarea
        id="concierge-conversation-composer"
        className="input-luxury mt-4 min-h-[160px] leading-relaxed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write your response..."
        data-testid="concierge-conversation-composer"
      />
      <div className="mt-5 flex justify-end">
        <button type="submit" className="btn-primary" disabled={!value.trim()}>
          Send
        </button>
      </div>
    </form>
  );
}

function MessagesConversation({ relationshipId, user }) {
  const nav = useNavigate();
  const relationship = useMemo(() => findConciergeMessageRelationship(relationshipId), [relationshipId]);
  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState("");
  const references = useMemo(() => creativeReferencesForConciergeRelationship(relationshipId), [relationshipId]);
  const commitments = useMemo(() => sharedCommitmentsForConciergeRelationship(relationshipId), [relationshipId]);
  const history = useMemo(() => conversationHistoryForConciergeRelationship(relationshipId), [relationshipId]);

  useEffect(() => {
    if (!relationshipId) return;
    setConversation(loadConciergeConversation(relationshipId));
    setDraft(loadConciergeConversationDraft(relationshipId));
  }, [relationshipId]);

  function handleDraftChange(nextDraft) {
    setDraft(nextDraft);
    saveConciergeConversationDraft(relationshipId, nextDraft);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    const nextConversation = appendConciergeConversationMessage(relationshipId, draft, user.name || "Commissioning Partner");
    setConversation(nextConversation);
    setDraft("");
    clearConciergeConversationDraft(relationshipId);
  }

  if (!relationship || !conversation) {
    return (
      <main className="px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <span className="overline text-neutral-500">Conversation</span>
          <h1 className="font-serif text-4xl mt-4">This conversation is not available.</h1>
          <button type="button" className="btn-secondary mt-6" onClick={() => nav("/concierge/messages")}>
            Return to Messages
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 sm:px-10 py-10 sm:py-14" data-testid="concierge-conversation">
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <WorkspaceReturn workspace="concierge" />
          <button type="button" className="btn-secondary !py-2 !px-4 text-xs" onClick={() => nav("/concierge/messages")}>
            Return to Messages
          </button>
        </div>
      </div>
      <RelationshipHeader relationship={relationship} />
      <CommissionContext relationship={relationship} />
      <ContextAtAGlance relationship={relationship} />
      <ConversationTimeline conversation={conversation} />
      <CreativeReferences references={references} />
      <SharedCommitments commitments={commitments} />
      <ConversationHistory history={history} />
      <ConversationComposer value={draft} onChange={handleDraftChange} onSubmit={handleSubmit} />
    </main>
  );
}

export default function CommissioningPartnerConciergeMessagesPage() {
  const { relationshipId } = useParams();
  const { user, loading } = useAuth();

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Concierge messages are one click away.</p>
        </div>
      </div>
    );
  }

  if (user.role === "artist" && !isDemoModeEnabled()) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Commissioning Partner Concierge</span>
          <h1 className="font-serif text-4xl mt-4">Concierge messages belong to Commissioning Partners.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      {relationshipId ? <MessagesConversation relationshipId={relationshipId} user={user} /> : <MessagesInbox />}
    </div>
  );
}
