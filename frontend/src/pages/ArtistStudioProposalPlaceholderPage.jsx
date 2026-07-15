import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { isDemoModeEnabled } from "@/lib/demoMode";
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

function ProposalCreativeContext({ relationship, references }) {
  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-7" data-testid="proposal-creative-context">
      <span className="overline text-neutral-500">Creative Context</span>
      <div className="mt-5 flex flex-col sm:flex-row gap-5">
        <div className="w-full sm:w-36 aspect-square bg-neutral-100 overflow-hidden flex-shrink-0">
          <img
            src={relationship.artwork.thumbnail_url}
            alt={relationship.artwork.alt}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-3xl tracking-tight">{relationship.artwork.title}</h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">{relationship.title}</p>
          {references.length > 0 && (
            <div className="mt-6">
              <span className="overline text-neutral-500">Creative References</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {references.map((reference) => (
                  <span key={reference.reference_id} className="text-xs text-neutral-600 border border-neutral-200 px-3 py-2">
                    {reference.reference_type}: {reference.title}
                  </span>
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

export default function ArtistStudioProposalPlaceholderPage() {
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
      <ProposalWorkspace relationship={relationship} />
    </div>
  );
}
