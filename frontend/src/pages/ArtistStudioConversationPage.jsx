import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isDemoModeEnabled } from "@/lib/demoMode";
import {
  appendStudioConversationMessage,
  clearConversationDraft,
  conversationHistoryForRelationship,
  findStudioRelationship,
  loadConversationDraft,
  loadStudioConversation,
  saveConversationDraft,
  sharedCommitmentsForRelationship,
  sharedReferencesForRelationship,
} from "@/lib/studioMessagesDemo";

function RelationshipHeader({ relationship }) {
  return (
    <header className="max-w-4xl mx-auto">
      <span className="overline text-neutral-500">Conversation</span>
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
        <img
          src={relationship.collaborator.avatar_url}
          alt={relationship.collaborator.name}
          className="h-16 w-16 rounded-full object-cover bg-neutral-100"
        />
        <div>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter">{relationship.collaborator.name}</h1>
          <p className="text-neutral-700 mt-3 text-lg">{relationship.title}</p>
          <p className="text-sm text-neutral-500 mt-2">{relationship.stage}</p>
        </div>
      </div>
      <p className="text-neutral-700 mt-8 text-lg leading-relaxed">Take your time.</p>
      <p className="text-neutral-600 mt-2 leading-relaxed">
        The best creative partnerships are built one thoughtful conversation at a time.
      </p>
    </header>
  );
}

function CreativeContext({ relationship }) {
  return (
    <section className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-5 sm:p-6" data-testid="conversation-context">
      <span className="overline text-neutral-500">Creative Context</span>
      <div className="mt-4 flex gap-4 items-center">
        <div className="w-24 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0">
          <img
            src={relationship.artwork.thumbnail_url}
            alt={relationship.artwork.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-2xl tracking-tight">{relationship.artwork.title}</h2>
          <p className="text-sm text-neutral-600 mt-2">{relationship.title}</p>
        </div>
      </div>
    </section>
  );
}

function ConversationTimeline({ conversation }) {
  const hasMessages = conversation.date_groups?.some((group) => group.messages?.length);

  if (!hasMessages) {
    return (
      <section className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-8 sm:p-10" data-testid="conversation-timeline">
        <h2 className="font-serif text-3xl tracking-tight">The conversation can begin here.</h2>
        <p className="text-neutral-600 mt-3 leading-relaxed">
          When this relationship is ready for dialogue, your shared thoughts will gather in this space.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="conversation-timeline" aria-label="Conversation timeline">
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

function SharedReferences({ references, onOpenReference }) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="shared-references">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <span className="overline text-neutral-500">Creative References</span>
          <h2 className="font-serif text-3xl tracking-tight mt-3">Everything that inspires this project.</h2>
          <p className="text-neutral-600 mt-2 leading-relaxed">Beautifully organized. Always within reach.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={() => setShareOpen(true)}>
          Share Creative Reference
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
        {references.length ? (
          references.map((reference) => (
            <button
              type="button"
              key={reference.reference_id}
              className="bg-white text-left p-5 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              onClick={() => onOpenReference(reference)}
              data-testid={`shared-reference-${reference.reference_id}`}
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
            </button>
          ))
        ) : (
          <div className="bg-white p-6 sm:p-8 md:col-span-3">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Every great commission begins with inspiration. Share your first reference whenever you&apos;re ready.
            </p>
          </div>
        )}
      </div>

      {shareOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/30 px-6 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-reference-title"
          data-testid="share-reference-placeholder"
        >
          <div className="bg-white border border-neutral-200 max-w-md w-full p-7 sm:p-8">
            <span className="overline text-neutral-500">Share Creative Reference</span>
            <h3 id="share-reference-title" className="font-serif text-3xl tracking-tight mt-3">
              Reference sharing is taking shape.
            </h3>
            <p className="text-neutral-600 mt-4 leading-relaxed">
              This will become a calm way to share artwork, Collections, and presentations within a creative relationship.
            </p>
            <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
              This demo only establishes the future sharing moment.
            </p>
            <div className="mt-6 flex justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShareOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SharedCommitments({ commitments }) {
  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="shared-commitments">
      <div>
        <span className="overline text-neutral-500">Shared Commitments</span>
        <h2 className="font-serif text-3xl tracking-tight mt-3">The important things we&apos;ve agreed upon.</h2>
        <p className="text-neutral-600 mt-2 leading-relaxed">Clear. Trusted. Always easy to revisit.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
        {commitments.length ? (
          commitments.map((commitment) => (
            <article
              key={commitment.commitment_id}
              className="bg-white p-5 sm:p-6"
              data-testid={`shared-commitment-${commitment.commitment_id}`}
            >
              <span className="overline text-neutral-500">Commitment</span>
              <h3 className="font-serif text-2xl tracking-tight mt-3">{commitment.commitment}</h3>
              <div className="mt-6">
                <span className="overline text-neutral-500">Current State</span>
                <p className="text-neutral-700 mt-2 leading-relaxed">{commitment.current_state}</p>
              </div>
              {commitment.target_date_label && (
                <p className="text-sm text-neutral-500 mt-4">{commitment.target_date_label}</p>
              )}
            </article>
          ))
        ) : (
          <div className="bg-white p-6 sm:p-8 md:col-span-3">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Important understandings will rest here when this relationship is ready for them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ConversationHistory({ history }) {
  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="conversation-history">
      <div>
        <span className="overline text-neutral-500">Conversation History</span>
        <h2 className="font-serif text-3xl tracking-tight mt-3">Every conversation tells a story.</h2>
        <p className="text-neutral-600 mt-2 leading-relaxed">
          Every story becomes part of your creative journey.
        </p>
      </div>

      <div className="mt-7 space-y-6">
        {history.length ? (
          history.map((milestone) => (
            <article
              key={milestone.history_id}
              className="bg-white border border-neutral-200 p-6 sm:p-7"
              data-testid={`conversation-history-${milestone.history_id}`}
            >
              {milestone.date_label && (
                <p className="text-xs text-neutral-500">{milestone.date_label}</p>
              )}
              <h3 className="font-serif text-2xl tracking-tight mt-3">{milestone.milestone}</h3>
              {milestone.description && (
                <p className="text-neutral-600 mt-3 leading-relaxed">{milestone.description}</p>
              )}
            </article>
          ))
        ) : (
          <div className="bg-white border border-neutral-200 p-6 sm:p-8">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Meaningful moments from this creative relationship will gather here over time.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function InvitationToCreate({ onBeginProposal }) {
  return (
    <section className="max-w-4xl mx-auto mt-10" data-testid="invitation-to-create">
      <div className="bg-white border border-neutral-200 p-7 sm:p-8">
        <span className="overline text-neutral-500">Commission</span>
        <h2 className="font-serif text-4xl tracking-tight mt-4">Invitation to Create</h2>
        <div className="text-neutral-600 mt-5 leading-relaxed space-y-3">
          <p>You&apos;ve taken the time to understand one another.</p>
          <p>You&apos;ve shared ideas, inspiration, and expectations.</p>
          <p>
            When you&apos;re both ready, begin creating a proposal that reflects the creative journey
            you&apos;ve already started together.
          </p>
        </div>
        <button type="button" className="btn-primary mt-7" onClick={onBeginProposal}>
          Begin Proposal
        </button>
      </div>
    </section>
  );
}

function ConversationComposer({ value, onChange, onSubmit }) {
  return (
    <form className="max-w-4xl mx-auto mt-10 bg-white border border-neutral-200 p-5 sm:p-6" onSubmit={onSubmit}>
      <label htmlFor="conversation-composer" className="overline text-neutral-500">
        Continue the conversation
      </label>
      <textarea
        id="conversation-composer"
        className="input-luxury mt-4 min-h-[160px] leading-relaxed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Share your thoughts..."
        data-testid="conversation-composer"
      />
      <div className="mt-5 flex justify-end">
        <button type="submit" className="btn-primary" disabled={!value.trim()}>
          Send
        </button>
      </div>
    </form>
  );
}

export default function ArtistStudioConversationPage() {
  const { relationshipId } = useParams();
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [draft, setDraft] = useState("");
  const relationship = useMemo(() => findStudioRelationship(relationshipId), [relationshipId]);
  const sharedReferences = useMemo(() => sharedReferencesForRelationship(relationshipId), [relationshipId]);
  const sharedCommitments = useMemo(() => sharedCommitmentsForRelationship(relationshipId), [relationshipId]);
  const conversationHistory = useMemo(() => conversationHistoryForRelationship(relationshipId), [relationshipId]);

  useEffect(() => {
    if (!relationshipId) return;
    setConversation(loadStudioConversation(relationshipId));
    setDraft(loadConversationDraft(relationshipId));
  }, [relationshipId]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!draft.trim() || !relationshipId) return;
    const nextConversation = appendStudioConversationMessage(relationshipId, draft);
    setConversation(nextConversation);
    setDraft("");
    clearConversationDraft(relationshipId);
  }

  function handleDraftChange(nextDraft) {
    setDraft(nextDraft);
    if (relationshipId) {
      saveConversationDraft(relationshipId, nextDraft);
    }
  }

  function handleOpenReference(reference) {
    nav(reference.destination_path);
  }

  function handleBeginProposal() {
    nav(`/studio/commissions/${relationship.relationship_id}/proposal`);
  }

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Studio conversation is one click away.</p>
        </div>
      </div>
    );
  }

  if (user.role !== "artist" && !isDemoModeEnabled()) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Artist Studio</span>
          <h1 className="font-serif text-4xl mt-4">Conversations belong in the Artist Studio.</h1>
        </div>
      </div>
    );
  }

  if (!relationship || !conversation) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Conversation</span>
          <h1 className="font-serif text-4xl mt-4">This relationship is not available.</h1>
          <button type="button" className="btn-secondary mt-6" onClick={() => nav("/studio/messages")}>
            Return to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="artist-studio-conversation">
      <Navbar />
      <main className="px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto mb-10">
          <button type="button" className="btn-secondary !py-2 !px-4 text-xs" onClick={() => nav("/studio/messages")}>
            Return to Messages
          </button>
        </div>
        <RelationshipHeader relationship={relationship} />
        <CreativeContext relationship={relationship} />
        <ConversationTimeline conversation={conversation} />
        <SharedReferences references={sharedReferences} onOpenReference={handleOpenReference} />
        <SharedCommitments commitments={sharedCommitments} />
        <ConversationHistory history={conversationHistory} />
        <InvitationToCreate onBeginProposal={handleBeginProposal} />
        <ConversationComposer value={draft} onChange={handleDraftChange} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
