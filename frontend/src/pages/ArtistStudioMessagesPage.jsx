import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WorkspaceReturn from "@/components/WorkspaceReturn";
import { useAuth } from "@/lib/AuthContext";
import { isDemoModeEnabled } from "@/lib/demoMode";
import {
  DEMO_STUDIO_RELATIONSHIPS,
  MESSAGE_SECTIONS,
  getRelationshipRecommendation,
  groupRelationshipsBySection,
  participantRoleLabel,
} from "@/lib/studioMessagesDemo";

function RelationshipCard({ relationship, onSelect }) {
  return (
    <button
      type="button"
      className="w-full bg-white p-5 sm:p-6 text-left transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900"
      onClick={onSelect}
      data-testid={`relationship-card-${relationship.relationship_id}`}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={relationship.collaborator.avatar_url}
            alt={relationship.collaborator.name}
            className="h-12 w-12 rounded-full object-cover bg-neutral-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 truncate">{relationship.collaborator.name}</p>
            <p className="text-xs text-neutral-500">{participantRoleLabel(relationship.collaborator.role)}</p>
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
          <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{relationship.summary}</p>
        </div>
      </div>
    </button>
  );
}

function RelationshipSection({ section, relationships, onSelect }) {
  return (
    <section data-testid={`relationship-section-${section.id}`}>
      <div className="flex items-end justify-between gap-5">
        <h2 className="font-serif text-3xl tracking-tight">{section.title}</h2>
        <span className="text-xs text-neutral-500">{relationships.length} {relationships.length === 1 ? "relationship" : "relationships"}</span>
      </div>
      <div className="mt-5 space-y-px bg-neutral-200 border border-neutral-200">
        {relationships.length ? (
          relationships.map((relationship) => (
            <RelationshipCard
              key={relationship.relationship_id}
              relationship={relationship}
              onSelect={() => onSelect(relationship)}
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

function MessagesDashboard() {
  const nav = useNavigate();
  const groupedRelationships = useMemo(() => groupRelationshipsBySection(DEMO_STUDIO_RELATIONSHIPS), []);
  const recommendation = useMemo(() => getRelationshipRecommendation(DEMO_STUDIO_RELATIONSHIPS), []);

  function openRelationship(relationship) {
    nav(relationship.conversation_path);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA]" data-testid="artist-studio-messages">
      <section className="max-w-[1300px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <WorkspaceReturn workspace="studio" className="mb-10" />
        <div className="max-w-3xl">
          <span className="overline text-neutral-500">Artist Studio</span>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">Messages</h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">Welcome back.</p>
          <p className="text-neutral-600 mt-2 leading-relaxed">
            Here are the conversations that matter today.
          </p>
        </div>

        {recommendation && (
          <div
            className="mt-10 bg-white border border-neutral-200 p-7 sm:p-8"
            data-testid="messages-recommendation"
          >
            <span className="overline text-neutral-500">Where to begin today</span>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:items-end">
              <div>
                <h2 className="font-serif text-3xl tracking-tight">{recommendation.recommendation}</h2>
                <p className="text-neutral-600 mt-3 leading-relaxed">
                  {recommendation.collaborator.name} · {recommendation.title}
                </p>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => openRelationship(recommendation)}
              >
                Continue Conversation
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 space-y-12">
          {MESSAGE_SECTIONS.map((section) => (
            <RelationshipSection
              key={section.id}
              section={section}
              relationships={groupedRelationships[section.id] || []}
              onSelect={openRelationship}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function ArtistStudioMessagesPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Studio messages are one click away.</p>
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
          <h1 className="font-serif text-4xl mt-4">Messages belong in the Artist Studio.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <MessagesDashboard />
    </div>
  );
}
