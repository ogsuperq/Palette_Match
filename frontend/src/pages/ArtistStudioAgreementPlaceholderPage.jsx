import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WorkspaceReturn from "@/components/WorkspaceReturn";
import { useAuth } from "@/lib/AuthContext";
import { DEMO_ARTISTS, isDemoModeEnabled } from "@/lib/demoMode";
import {
  findStudioRelationship,
  loadStudioAgreement,
  loadStudioProposal,
  saveStudioAgreement,
} from "@/lib/studioMessagesDemo";

function formatSaved(value) {
  if (!value) return "Your agreement is ready when you are.";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Changes saved";
  return `Changes saved ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function AgreementWritingSection({ title, purpose, value, onChange, placeholder }) {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-7">
      <label className="overline text-neutral-500" htmlFor={id}>
        {title}
      </label>
      <p className="text-neutral-600 mt-3 leading-relaxed">{purpose}</p>
      <textarea
        id={id}
        className="input-luxury mt-5 min-h-[170px] leading-relaxed"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </section>
  );
}

function SharedVision({ value }) {
  const hasVision = Boolean(String(value || "").trim());

  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-7" data-testid="agreement-shared-vision">
      <span className="overline text-neutral-500">Shared Vision</span>
      <p className="text-neutral-600 mt-3 leading-relaxed">Carry forward the creative vision you shaped in the Proposal.</p>
      <p className="font-serif text-3xl tracking-tight mt-5 leading-snug whitespace-pre-wrap">
        {hasVision ? value : "The shared vision from the Proposal will appear here as it takes shape."}
      </p>
    </section>
  );
}

function AgreementReviewTransition() {
  return (
    <section className="bg-white border border-neutral-200 p-6 sm:p-7">
      <span className="overline text-neutral-500">Review Agreement</span>
      <p className="text-neutral-600 mt-3 leading-relaxed">
        Review the agreement details before beginning the creative process.
      </p>
      <button type="button" className="btn-primary mt-6 disabled:opacity-40 disabled:cursor-default" disabled>
        Review Agreement
      </button>
    </section>
  );
}

function AgreementWorkspace({ relationship }) {
  const artistName = DEMO_ARTISTS[0]?.name || "Artist";
  const proposal = useMemo(() => loadStudioProposal(relationship.relationship_id), [relationship.relationship_id]);
  const [agreement, setAgreement] = useState(() => loadStudioAgreement(relationship.relationship_id));

  function updateAgreement(field, value) {
    setAgreement((current) => {
      const nextAgreement = saveStudioAgreement(relationship.relationship_id, {
        ...current,
        [field]: value,
      });
      return nextAgreement;
    });
  }

  return (
    <main className="bg-[#FAFAFA] px-6 sm:px-10 py-10 sm:py-14" data-testid="agreement-foundation">
      <section className="max-w-5xl mx-auto">
        <WorkspaceReturn workspace="studio" className="mb-10" />
        <header className="max-w-3xl">
          <span className="overline text-neutral-500">Commission</span>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">Agreement</h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">
            Created by:
          </p>
          <p className="font-serif text-3xl tracking-tight mt-3">
            {artistName}
            <span className="text-neutral-400"> + </span>
            {relationship.collaborator.name}
          </p>
          <p className="text-neutral-600 mt-6 text-lg leading-relaxed">
            A professional foundation for bringing the shared creative vision to life.
          </p>
          <p className="text-xs text-neutral-500 mt-6" aria-live="polite">{formatSaved(agreement.updated_at)}</p>
        </header>

        <div className="mt-12 space-y-6">
          <SharedVision value={proposal.creative_vision} />
          <AgreementWritingSection
            title="Commission Scope"
            purpose="Define the artwork or creative work being commissioned and the details both parties should understand."
            value={agreement.creative_scope}
            onChange={(value) => updateAgreement("creative_scope", value)}
            placeholder="Describe the commissioned work, including artwork type, number of pieces, medium, dimensions, materials, placement, or special considerations."
          />
          <AgreementWritingSection
            title="Creative Process"
            purpose="Describe how the work will progress from concept development through refinement and completion."
            value={agreement.creative_journey}
            onChange={(value) => updateAgreement("creative_journey", value)}
            placeholder="Outline how concept development, review opportunities, feedback, refinement, and completion expectations may unfold."
          />
          <AgreementWritingSection
            title="Investment"
            purpose="Recognize the professional financial commitment supporting the artist's expertise, creative time, materials, and agreed scope of work."
            value={agreement.investment}
            onChange={(value) => updateAgreement("investment", value)}
            placeholder="Describe what the investment supports, including expertise, creative time, materials, scope, and any future considerations that should be understood."
          />
          <AgreementWritingSection
            title="Responsibilities & Communication"
            purpose="Clarify communication, responsibilities, approvals, and collaboration practices that support a successful commission."
            value={agreement.expectations}
            onChange={(value) => updateAgreement("expectations", value)}
            placeholder="Describe how both parties will communicate, make decisions, review work, and care for the professional relationship."
          />
          <AgreementReviewTransition />
        </div>
      </section>
    </main>
  );
}

export default function ArtistStudioAgreementPlaceholderPage() {
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
          <p className="text-neutral-600 mt-4">Your Studio agreement is one click away.</p>
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
          <h1 className="font-serif text-4xl mt-4">Agreements belong in the Artist Studio.</h1>
        </div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <span className="overline text-neutral-500">Agreement</span>
          <h1 className="font-serif text-4xl mt-4">This relationship is not available.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <AgreementWorkspace relationship={relationship} />
    </div>
  );
}
