import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  findStudioRelationship,
  loadStudioProposal,
  saveStudioProposal,
  sharedReferencesForRelationship,
} from "@/lib/studioMessagesDemo";

function formatSaved(value) {
  if (!value) return "Your proposal is ready when you are.";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Changes saved";
  return `Changes saved ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function ProposalWritingSection({ title, purpose, value, onChange, placeholder }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-7">
      <label className="overline text-neutral-500" htmlFor={id}>
        {title}
      </label>
      <p className="text-neutral-600 mt-3 leading-relaxed">{purpose}</p>
      <textarea
        id={id}
        className="input-luxury mt-5 min-h-[190px] leading-relaxed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </section>
  );
}

function ProposalSection({ title, children }) {
  const hasContent = Boolean(String(children || "").trim());

  return (
    <section className="bg-white border border-neutral-200 p-7 sm:p-8">
      <span className="overline text-neutral-500">{title}</span>
      <p className="font-serif text-3xl tracking-tight mt-4 leading-snug whitespace-pre-wrap">
        {hasContent ? children : "This part of the shared vision is still taking shape."}
      </p>
    </section>
  );
}

function ProposalCreativeContext({ relationship, references }) {
  return (
    <section className="bg-white border border-neutral-200 p-7 sm:p-8" data-testid="proposal-creative-context">
      <span className="overline text-neutral-500">Creative Context</span>
      <div className="mt-5 flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-44 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0">
          <img
            src={relationship.artwork.thumbnail_url}
            alt={relationship.artwork.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <span className="overline text-neutral-500">Artwork</span>
          <h2 className="font-serif text-3xl tracking-tight mt-3">{relationship.artwork.title}</h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">{relationship.title}</p>
          {references.length > 0 && (
            <div className="mt-7">
              <span className="overline text-neutral-500">Creative References</span>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
                {references.map((reference) => (
                  <div key={reference.reference_id} className="bg-white p-4">
                    <p className="text-xs text-neutral-500">{reference.reference_type}</p>
                    <p className="font-serif text-xl tracking-tight mt-2">{reference.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProposalWorkspace({ relationship }) {
  const nav = useNavigate();
  const [proposal, setProposal] = useState(() => loadStudioProposal(relationship.relationship_id));
  const references = useMemo(
    () => sharedReferencesForRelationship(relationship.relationship_id),
    [relationship.relationship_id]
  );

  function updateProposal(field, value) {
    setProposal((current) => {
      const nextProposal = saveStudioProposal(relationship.relationship_id, {
        ...current,
        [field]: value,
      });
      return nextProposal;
    });
  }

  return (
    <main className="bg-[#FAFAFA] px-6 sm:px-10 py-10 sm:py-14" data-testid="proposal-workspace">
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <header className="lg:col-span-5">
            <span className="overline text-neutral-500">Commission</span>
            <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">Proposal</h1>
            <p className="text-neutral-700 mt-6 text-lg leading-relaxed">
              A creative vision shaped by the conversation you&apos;ve already begun.
            </p>
            <div className="mt-8 space-y-4 text-sm text-neutral-600 leading-relaxed">
              <p>
                <span className="text-neutral-500">Commissioning party</span>
                <br />
                {relationship.collaborator.name}
              </p>
              <p>
                <span className="text-neutral-500">Creative context</span>
                <br />
                {relationship.title}
              </p>
              <p className="text-xs text-neutral-500" aria-live="polite">{formatSaved(proposal.updated_at)}</p>
              <button
                type="button"
                className="btn-secondary mt-4"
                onClick={() => nav(`/studio/commissions/${relationship.relationship_id}/proposal/presentation`)}
              >
                View Presentation
              </button>
            </div>
          </header>

          <div className="lg:col-span-7 space-y-6">
            <ProposalWritingSection
              title="Creative Vision"
              purpose="Capture the shared direction emerging from conversation."
              value={proposal.creative_vision}
              onChange={(value) => updateProposal("creative_vision", value)}
              placeholder="What are you beginning to imagine together?"
            />
            <ProposalWritingSection
              title="Artist Perspective"
              purpose="Describe how you envision bringing the idea to life."
              value={proposal.artist_perspective}
              onChange={(value) => updateProposal("artist_perspective", value)}
              placeholder="How might your materials, process, and point of view shape this work?"
            />
            <ProposalWritingSection
              title="Commissioning Perspective"
              purpose="Represent the commissioning party's intent, inspiration, or hopes for the work."
              value={proposal.collector_perspective}
              onChange={(value) => updateProposal("collector_perspective", value)}
              placeholder="What have they shared about what this piece should hold or express?"
            />
            <ProposalCreativeContext relationship={relationship} references={references} />
          </div>
        </div>
      </section>
    </main>
  );
}

function LookingAhead({ onBeginAgreement }) {
  return (
    <section className="bg-white border border-neutral-200 p-7 sm:p-8" data-testid="proposal-looking-ahead">
      <span className="overline text-neutral-500">Looking Ahead</span>
      <p className="font-serif text-3xl tracking-tight mt-4 leading-snug">
        When this vision feels aligned, the next step is creating an agreement that reflects how you will bring it to life together.
      </p>
      <button type="button" className="btn-primary mt-7" onClick={onBeginAgreement}>
        Begin Agreement
      </button>
    </section>
  );
}

function ProposalPresentation({ relationship }) {
  const nav = useNavigate();
  const artistName = DEMO_ARTISTS[0]?.name || "Artist";
  const proposal = useMemo(() => loadStudioProposal(relationship.relationship_id), [relationship.relationship_id]);
  const references = useMemo(
    () => sharedReferencesForRelationship(relationship.relationship_id),
    [relationship.relationship_id]
  );

  return (
    <main className="bg-[#FAFAFA] px-6 sm:px-10 py-10 sm:py-14" data-testid="proposal-presentation">
      <section className="max-w-5xl mx-auto">
        <header className="max-w-3xl">
          <span className="overline text-neutral-500">Commission</span>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">Proposal</h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">
            Created together by:
          </p>
          <p className="font-serif text-3xl tracking-tight mt-3">
            {artistName}
            <span className="text-neutral-400"> and </span>
            {relationship.collaborator.name}
          </p>
        </header>

        <div className="mt-12 space-y-6">
          <ProposalSection title="Creative Vision">{proposal.creative_vision}</ProposalSection>
          <ProposalSection title="Artist Perspective">{proposal.artist_perspective}</ProposalSection>
          <ProposalSection title="Commissioning Perspective">{proposal.collector_perspective}</ProposalSection>
          <ProposalCreativeContext relationship={relationship} references={references} />
          <LookingAhead onBeginAgreement={() => nav(`/studio/commissions/${relationship.relationship_id}/agreement`)} />
        </div>
      </section>
    </main>
  );
}

export default function ArtistStudioProposalPlaceholderPage({ presentation = false }) {
  const { relationshipId } = useParams();
  const { user, loading } = useAuth();
  const relationship = useMemo(() => findStudioRelationship(relationshipId), [relationshipId]);

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Studio proposal is one click away.</p>
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
          <h1 className="font-serif text-4xl mt-4">Proposals belong in the Artist Studio.</h1>
        </div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Proposal</span>
          <h1 className="font-serif text-4xl mt-4">This relationship is not available.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      {presentation ? <ProposalPresentation relationship={relationship} /> : <ProposalWorkspace relationship={relationship} />}
    </div>
  );
}
