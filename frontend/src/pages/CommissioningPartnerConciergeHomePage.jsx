import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { http } from "@/lib/api";
import { isDemoModeEnabled, listDemoProjects } from "@/lib/demoMode";
import { buildConciergeHomeState } from "@/lib/commissioningPartnerConciergeDemo";

function firstName(name = "") {
  return name.trim().split(/\s+/)[0] || "there";
}

function EmptyNote({ children }) {
  return (
    <div className="bg-white p-6 sm:p-8">
      <p className="text-sm text-neutral-600 leading-relaxed">{children}</p>
    </div>
  );
}

function ConciergeAreaCard({ title, description, action, onOpen }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <span className="overline text-neutral-500">Available</span>
      <h3 className="font-serif text-2xl mt-3">{title}</h3>
      <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{description}</p>
      <button type="button" className="btn-secondary mt-5 !py-2 !px-4" onClick={onOpen}>
        {action}
      </button>
    </div>
  );
}

function ConciergeAreaNote({ title, description }) {
  return (
    <div className="bg-white p-6 sm:p-7">
      <span className="overline text-neutral-500">Not yet available in Concierge</span>
      <h3 className="font-serif text-2xl mt-3">{title}</h3>
      <p className="text-sm text-neutral-600 mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

function PrimaryAttentionCard({ attention }) {
  const nav = useNavigate();
  if (!attention) return null;

  return (
    <section className="mt-10 bg-white border border-neutral-200 p-7 sm:p-8" data-testid="concierge-primary-attention">
      <span className="overline text-neutral-500">{attention.eyebrow}</span>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:items-end">
        <div>
          <h2 className="font-serif text-3xl tracking-tight">{attention.title}</h2>
          <p className="text-neutral-600 mt-3 leading-relaxed">{attention.description}</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => nav(attention.destination_path)}>
          {attention.action_label}
        </button>
      </div>
    </section>
  );
}

function RelationshipSummaryCard({ relationship }) {
  const nav = useNavigate();

  return (
    <article className="bg-white p-5 sm:p-6" data-testid={`concierge-relationship-${relationship.relationship_id}`}>
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={relationship.artist.avatar_url}
            alt={relationship.artist.name}
            className="h-12 w-12 rounded-full object-cover bg-neutral-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 truncate">{relationship.artist.name}</p>
            <p className="text-xs text-neutral-500">{relationship.artist.role}</p>
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
          <button
            type="button"
            className="btn-secondary mt-5 !py-2 !px-4 text-xs"
            onClick={() => nav(relationship.destination_path)}
          >
            {relationship.action_label}
          </button>
        </div>
      </div>
    </article>
  );
}

function CommissionSummaryCard({ commission }) {
  const nav = useNavigate();

  return (
    <article className="bg-white p-6 sm:p-7" data-testid={`concierge-commission-${commission.commission_id}`}>
      <span className="overline text-neutral-500">Commission</span>
      <h3 className="font-serif text-2xl tracking-tight mt-3">{commission.title}</h3>
      <p className="text-sm text-neutral-700 mt-3">{commission.current_state}</p>
      <p className="text-sm text-neutral-500 mt-3 leading-relaxed line-clamp-3">{commission.creative_context}</p>
      <button type="button" className="btn-secondary mt-5 !py-2 !px-4 text-xs" onClick={() => nav(commission.destination_path)}>
        {commission.action_label}
      </button>
    </article>
  );
}

function ConversationSummaryCard({ conversation }) {
  const nav = useNavigate();

  return (
    <article className="bg-white p-6 sm:p-7" data-testid={`concierge-conversation-${conversation.relationship_id}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="overline text-neutral-500">Conversation</span>
        <span className="text-xs text-neutral-500">{conversation.time_label}</span>
      </div>
      <h3 className="font-serif text-2xl tracking-tight mt-3">{conversation.artist_name}</h3>
      <p className="text-sm text-neutral-700 mt-3">{conversation.title}</p>
      <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{conversation.current_state}</p>
      <button
        type="button"
        className="btn-secondary mt-5 !py-2 !px-4 text-xs"
        onClick={() => nav(conversation.destination_path)}
      >
        Open Conversation
      </button>
    </article>
  );
}

function OpportunityCard({ opportunity }) {
  const nav = useNavigate();

  return (
    <article className="bg-white p-5 sm:p-6" data-testid={`concierge-opportunity-${opportunity.artist_id}`}>
      {opportunity.artwork?.image_url && (
        <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
          <img
            src={opportunity.artwork.image_url}
            alt={opportunity.artwork.alt}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <span className="overline text-neutral-500 block mt-5">Opportunity</span>
      <h3 className="font-serif text-2xl tracking-tight mt-2">{opportunity.artist_name}</h3>
      <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{opportunity.headline}</p>
      {opportunity.reason_label && (
        <p className="text-xs text-neutral-500 mt-4">{opportunity.reason_label}</p>
      )}
      <button type="button" className="btn-secondary mt-5 !py-2 !px-4 text-xs" onClick={() => nav(opportunity.destination_path)}>
        Explore Artist
      </button>
    </article>
  );
}

function UpcomingMomentCard({ moment }) {
  return (
    <article className="bg-white p-6 sm:p-7" data-testid={`concierge-moment-${moment.moment_id}`}>
      <span className="text-xs text-neutral-500">{moment.date_label}</span>
      <h3 className="font-serif text-2xl tracking-tight mt-3">{moment.title}</h3>
      <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{moment.description}</p>
    </article>
  );
}

function ConciergeHomeContent({ user, homeState }) {
  const nav = useNavigate();

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#FAFAFA]" data-testid="commissioning-partner-concierge-home">
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-3xl">
          <span className="overline text-neutral-500">Commissioning Partner Concierge</span>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tighter mt-6">
            Welcome back, {firstName(user.name)}.
          </h1>
          <p className="text-neutral-700 mt-6 text-lg leading-relaxed">
            A considered view of the creative relationships, commissions, and decisions that matter most.
          </p>
          <p className="text-neutral-600 mt-3 leading-relaxed">
            Begin where clarity is needed most: a relationship, a commission, or a new creative possibility.
          </p>
        </div>

        <PrimaryAttentionCard attention={homeState.primary_attention} />

        <div className="mt-12 space-y-12">
          <section data-testid="concierge-relationships-section">
            <div className="flex items-end justify-between gap-5">
              <h2 className="font-serif text-3xl tracking-tight">Active Creative Relationships</h2>
              <span className="text-xs text-neutral-500">{homeState.relationships.length} active</span>
            </div>
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
              {homeState.relationships.length ? (
                homeState.relationships.slice(0, 2).map((relationship) => (
                  <RelationshipSummaryCard key={relationship.relationship_id} relationship={relationship} />
                ))
              ) : (
                <EmptyNote>Creative relationships will appear here when a commission begins to take shape.</EmptyNote>
              )}
            </div>
          </section>

          <section data-testid="concierge-commissions-section">
            <h2 className="font-serif text-3xl tracking-tight">Active Commissions</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
              {homeState.commissions.length ? (
                homeState.commissions.slice(0, 2).map((commission) => (
                  <CommissionSummaryCard key={commission.commission_id} commission={commission} />
                ))
              ) : (
                <EmptyNote>Active commissions will appear here once a commission has been established with an artist.</EmptyNote>
              )}
            </div>
          </section>

          <section data-testid="concierge-conversations-section">
            <h2 className="font-serif text-3xl tracking-tight">Meaningful Conversations</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200 border border-neutral-200">
              {homeState.conversations.length ? (
                homeState.conversations.map((conversation) => (
                  <ConversationSummaryCard key={conversation.relationship_id} conversation={conversation} />
                ))
              ) : (
                <EmptyNote>Meaningful conversations will gather here with their creative context preserved.</EmptyNote>
              )}
            </div>
          </section>

          <section data-testid="concierge-opportunities-section">
            <div>
              <h2 className="font-serif text-3xl tracking-tight">Artists to Explore</h2>
              <p className="text-neutral-600 mt-2 leading-relaxed">
                Artists you may want to explore based on available creative context.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
              {homeState.opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.artist_id} opportunity={opportunity} />
              ))}
            </div>
          </section>

          <section data-testid="concierge-upcoming-section">
            <h2 className="font-serif text-3xl tracking-tight">Commission Timeline</h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200">
              {homeState.upcoming_moments.length ? (
                homeState.upcoming_moments.map((moment) => (
                  <UpcomingMomentCard key={moment.moment_id} moment={moment} />
                ))
              ) : (
                <EmptyNote>Upcoming moments will appear here when they are part of an active creative relationship.</EmptyNote>
              )}
            </div>
          </section>

          <section>
            <span className="overline text-neutral-500">Your Concierge Experience</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-neutral-200 border border-neutral-200 mt-5">
              <ConciergeAreaCard
                title="Artists"
                description="Explore artists whose work may support a future commission."
                action="Explore Artists"
                onOpen={() => nav("/artists")}
              />
              <ConciergeAreaNote
                title="Favorites"
                description="Saved artists and creative references will become easy to revisit here."
              />
              <ConciergeAreaCard
                title="Messages"
                description="Return to commission conversations with artist and context preserved."
                action="Open Messages"
                onOpen={() => nav("/concierge/messages")}
              />
              <ConciergeAreaNote title="Commissions" description="Future commissions will gather here without turning Home into administrative software." />
              <ConciergeAreaNote
                title="Projects"
                description="Larger creative initiatives will have room to hold multiple commissions when needed."
              />
              <ConciergeAreaNote
                title="Calendar"
                description="Meaningful upcoming moments will remain visible without becoming a scheduling application."
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default function CommissioningPartnerConciergeHomePage() {
  const { user, loading } = useAuth();
  const [homeState, setHomeState] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadHome() {
      if (!user) return;
      if (user.role === "artist" && !isDemoModeEnabled()) return;
      try {
        const projects = isDemoModeEnabled()
          ? listDemoProjects()
          : (await http.get("/projects")).data;
        if (!mounted) return;
        setHomeState(buildConciergeHomeState({
          commissioningPartnerId: user.user_id,
          projects,
        }));
      } catch (e) {
        if (!mounted) return;
        setError(e.response?.data?.detail || "We could not open your Concierge.");
      }
    }
    loadHome();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (loading) return <div className="p-16 overline text-neutral-500">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <h1 className="font-serif text-4xl">Please sign in</h1>
          <p className="text-neutral-600 mt-4">Your Concierge is one click away.</p>
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
          <h1 className="font-serif text-4xl mt-4">Concierge belongs to Commissioning Partners.</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      {error ? (
        <div className="max-w-2xl mx-auto px-6 py-32 text-center">
          <p className="text-neutral-700">{error}</p>
        </div>
      ) : homeState ? (
        <ConciergeHomeContent user={user} homeState={homeState} />
      ) : (
        <div className="p-16 overline text-neutral-500">Opening your Concierge...</div>
      )}
    </div>
  );
}
