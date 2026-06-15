const DEMO_STORE_KEY = "palette_match_demo_commissions";
const DEMO_PREFIX = "demo_project_";

export const DEMO_USER = {
  user_id: "demo_collector",
  email: "demo@palettematch.local",
  name: "Demo Collector",
  picture: "",
  role: "collector",
  demo: true,
};

export function isDemoModeEnabled() {
  if (process.env.REACT_APP_DEMO_MODE === "true") return true;
  if (process.env.REACT_APP_DEMO_MODE === "false") return false;
  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function isDemoProjectId(projectId = "") {
  return String(projectId).startsWith(DEMO_PREFIX);
}

export const DEMO_ARTISTS = [
  {
    user_id: "demo_artist_mira",
    name: "Mira Solene",
    email: "mira@demo.palettematch",
    picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    headline: "Luminous abstract oils for calm, layered interiors",
    location: "Santa Fe, NM",
    bio: "Mira paints atmospheric, texture-rich pieces that balance quiet color fields with subtle movement.",
    specialties: ["Abstract", "Large-scale", "Calming interiors"],
    mediums: ["Oil", "Mixed media"],
    styles: ["Abstract", "Minimalist", "Contemporary"],
    price_low: 2400,
    price_high: 9200,
    availability: "Available for select commissions",
    portfolio: [
      { url: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=900&q=80", title: "Tidal Light", medium: "Oil", year: 2024 },
      { url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=900&q=80", title: "Quiet Horizon", medium: "Oil", year: 2023 },
    ],
    years_experience: 11,
    rating: 4.9,
    reviews_count: 28,
    completion_rate: 100,
  },
  {
    user_id: "demo_artist_jules",
    name: "Jules Marin",
    email: "jules@demo.palettematch",
    picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    headline: "Coastal impressionist paintings with architectural warmth",
    location: "Charleston, SC",
    bio: "Jules creates refined coastal works for homes that need softness, movement, and a clear sense of place.",
    specialties: ["Coastal", "Impressionist", "Residential commissions"],
    mediums: ["Oil", "Watercolor"],
    styles: ["Impressionist", "Coastal", "Classical"],
    price_low: 1800,
    price_high: 7600,
    availability: "Open for commissions",
    portfolio: [
      { url: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=900&q=80", title: "Morning Tide", medium: "Oil", year: 2024 },
      { url: "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?auto=format&fit=crop&w=900&q=80", title: "South Window", medium: "Watercolor", year: 2023 },
    ],
    years_experience: 9,
    rating: 4.8,
    reviews_count: 19,
    completion_rate: 97,
  },
  {
    user_id: "demo_artist_anika",
    name: "Anika Rowe",
    email: "anika@demo.palettematch",
    picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    headline: "Botanical and organic forms for layered design projects",
    location: "Portland, OR",
    bio: "Anika blends botanical drawing, mineral pigments, and modern composition for meaningful interior focal points.",
    specialties: ["Botanical", "Organic forms", "Interior design"],
    mediums: ["Watercolor", "Mixed media"],
    styles: ["Botanical", "Contemporary", "Minimalist"],
    price_low: 1200,
    price_high: 5400,
    availability: "Booking six weeks out",
    portfolio: [
      { url: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=900&q=80", title: "Fern Study", medium: "Watercolor", year: 2024 },
      { url: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?auto=format&fit=crop&w=900&q=80", title: "Ochre Garden", medium: "Mixed media", year: 2023 },
    ],
    years_experience: 8,
    rating: 4.9,
    reviews_count: 34,
    completion_rate: 100,
  },
  {
    user_id: "demo_artist_leo",
    name: "Leo Calder",
    email: "leo@demo.palettematch",
    picture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    headline: "Bold contemporary color studies for statement rooms",
    location: "Los Angeles, CA",
    bio: "Leo works with designers and collectors on confident color, strong scale, and energetic modern compositions.",
    specialties: ["Statement pieces", "Color field", "Modern interiors"],
    mediums: ["Acrylic", "Digital"],
    styles: ["Contemporary", "Abstract", "Bold"],
    price_low: 3000,
    price_high: 12500,
    availability: "Open to larger commissions",
    portfolio: [
      { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=900&q=80", title: "Signal Room", medium: "Acrylic", year: 2024 },
      { url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80", title: "Cadmium Suite", medium: "Acrylic", year: 2023 },
    ],
    years_experience: 13,
    rating: 4.7,
    reviews_count: 22,
    completion_rate: 96,
  },
  {
    user_id: "demo_artist_sena",
    name: "Sena Park",
    email: "sena@demo.palettematch",
    picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    headline: "Quiet realism and intimate portraits of place",
    location: "Brooklyn, NY",
    bio: "Sena paints refined realist works with gentle light, careful surfaces, and a strong sense of memory.",
    specialties: ["Realism", "Portraits of place", "Heirloom commissions"],
    mediums: ["Oil", "Graphite"],
    styles: ["Realist", "Classical", "Contemporary"],
    price_low: 2200,
    price_high: 8800,
    availability: "Accepting two commissions",
    portfolio: [
      { url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=900&q=80", title: "Room in June", medium: "Oil", year: 2024 },
      { url: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?auto=format&fit=crop&w=900&q=80", title: "Still Morning", medium: "Oil", year: 2023 },
    ],
    years_experience: 10,
    rating: 4.9,
    reviews_count: 17,
    completion_rate: 100,
  },
];

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_STORE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store) {
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
}

function briefFrom(form) {
  const style = form.style ? `${form.style.toLowerCase()} ` : "";
  const palette = form.colors ? ` using ${form.colors}` : "";
  const location = form.location ? ` for ${form.location}` : "";
  return `A ${style}${form.medium?.toLowerCase() || "custom"} artwork in ${form.size}${palette}${location}, shaped around: ${form.description}`;
}

function matchReasoning(artist, form, index) {
  const mediumFit = artist.mediums.includes(form.medium) ? `${form.medium} is already core to their practice` : `their mixed practice can translate the requested medium`;
  const styleFit = form.style && artist.styles.includes(form.style) ? `${form.style.toLowerCase()} work` : "a compatible visual language";
  const palette = form.colors ? ` The palette note (${form.colors}) fits their recent portfolio.` : "";
  return `${artist.name} is a strong fit because ${mediumFit}, with ${styleFit}, and a commission range aligned to the brief.${palette} Ranked ${index + 1} for concept, budget, and timeline fit.`;
}

export function createDemoProject(form) {
  const projectId = `${DEMO_PREFIX}${Date.now()}`;
  const createdAt = new Date().toISOString();
  const project = {
    ...form,
    project_id: projectId,
    collector_id: DEMO_USER.user_id,
    collector_name: DEMO_USER.name,
    status: "matched",
    ai_brief: briefFrom(form),
    created_at: createdAt,
    updated_at: createdAt,
    demo: true,
  };
  const matches = DEMO_ARTISTS.map((artist, index) => ({
    match_id: `demo_match_${projectId}_${artist.user_id}`,
    project_id: projectId,
    artist_id: artist.user_id,
    artist,
    score: [96, 92, 89, 86, 83][index],
    reasoning: matchReasoning(artist, form, index),
    created_at: createdAt,
    demo: true,
  }));
  const store = readStore();
  store[projectId] = {
    project,
    matches,
    proposals: [],
    messages: [],
    escrow: null,
  };
  writeStore(store);
  return project;
}

export function getDemoProjectBundle(projectId) {
  return readStore()[projectId] || null;
}

export function listDemoProjects() {
  return Object.values(readStore())
    .map((bundle) => ({
      ...bundle.project,
      match: bundle.matches?.[0],
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getDemoArtist(artistId) {
  return DEMO_ARTISTS.find((artist) => artist.user_id === artistId) || null;
}

export function listDemoArtists({ q = "", medium = "" } = {}) {
  const query = q.trim().toLowerCase();
  return DEMO_ARTISTS.filter((artist) => {
    const matchesQuery = !query || [artist.name, artist.headline, artist.location, ...(artist.specialties || [])]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesMedium = !medium || artist.mediums.includes(medium);
    return matchesQuery && matchesMedium;
  });
}

export function getDemoReviews(artistId) {
  const artist = getDemoArtist(artistId);
  if (!artist) return [];
  return [
    {
      review_id: `demo_review_${artistId}`,
      collector_name: "Palette Match collector",
      average: artist.rating,
      text: "The proposal was clear, the process felt considered, and the finished work anchored the room beautifully.",
    },
  ];
}

export function createDemoProposal(projectId, artistId, overrides = {}) {
  const store = readStore();
  const bundle = store[projectId];
  const artist = getDemoArtist(artistId);
  if (!bundle || !artist) return null;
  const existing = bundle.proposals.find((proposal) => proposal.artist_id === artistId);
  if (existing) return existing;
  const price = Math.min(
    Math.max(Math.round((bundle.project.budget || artist.price_low) * 0.92), artist.price_low),
    artist.price_high
  );
  const proposal = {
    proposal_id: `demo_proposal_${projectId}_${artistId}`,
    project_id: projectId,
    artist_id: artistId,
    artist,
    artist_name: artist.name,
    price: overrides.price || price,
    timeline_days: overrides.timeline_days || (bundle.project.timeline?.includes("1–4") ? 28 : 45),
    concept: overrides.concept || `I would translate your brief into a custom ${bundle.project.medium?.toLowerCase()} work with a composed palette, a strong sense of place, and enough restraint to live beautifully in the room.`,
    references: [],
    status: "pending",
    created_at: new Date().toISOString(),
    demo: true,
  };
  bundle.proposals.push(proposal);
  bundle.messages.push({
    message_id: `demo_message_${Date.now()}_${artistId}`,
    project_id: projectId,
    artist_id: artistId,
    sender_id: artistId,
    sender_name: artist.name,
    text: "Thank you for the thoughtful brief. I added a proposal with concept direction, pricing, and timeline for review.",
    created_at: new Date().toISOString(),
    demo: true,
  });
  bundle.project.updated_at = new Date().toISOString();
  writeStore(store);
  return proposal;
}

export function acceptDemoProposal(projectId, proposalId) {
  const store = readStore();
  const bundle = store[projectId];
  if (!bundle) return;
  bundle.proposals = bundle.proposals.map((proposal) => ({
    ...proposal,
    status: proposal.proposal_id === proposalId ? "accepted" : "declined",
  }));
  const accepted = bundle.proposals.find((proposal) => proposal.proposal_id === proposalId);
  if (!accepted) return;
  bundle.project.status = "artist_selected";
  bundle.project.hired_artist_id = accepted.artist_id;
  bundle.project.updated_at = new Date().toISOString();
  bundle.escrow = {
    project_id: projectId,
    status: "deposit_pending",
    total: accepted.price,
    deposit: Math.round(accepted.price / 2),
    demo: true,
  };
  writeStore(store);
}

export function advanceDemoProject(projectId, status) {
  const store = readStore();
  const bundle = store[projectId];
  if (!bundle) return;
  bundle.project.status = status;
  bundle.project.updated_at = new Date().toISOString();
  if (status === "in_progress" && bundle.escrow) {
    bundle.escrow.status = "deposit_held";
  }
  if (status === "completed" && bundle.escrow) {
    bundle.escrow.status = "released";
  }
  writeStore(store);
}

export function createDemoMessage(projectId, artistId, text) {
  const store = readStore();
  const bundle = store[projectId];
  if (!bundle) return;
  bundle.messages.push({
    message_id: `demo_message_${Date.now()}`,
    project_id: projectId,
    artist_id: artistId,
    sender_id: DEMO_USER.user_id,
    sender_name: DEMO_USER.name,
    text,
    created_at: new Date().toISOString(),
    demo: true,
  });
  bundle.project.updated_at = new Date().toISOString();
  writeStore(store);
}
