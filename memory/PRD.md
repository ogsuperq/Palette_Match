# Palette Match — PRD

## Problem Statement
AI-Powered Commission Marketplace for Art — "Describe your dream artwork. Meet the perfect artist."
Connect art collectors with vetted artists for custom commissioned work, guided by an AI concierge and protected by escrow.

## Tech Stack (adapted to env)
- Frontend: React + Tailwind + Shadcn/UI + Framer Motion
- Backend: FastAPI + Motor (MongoDB)
- AI: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) via Emergent Universal LLM key
- Auth: Emergent-managed Google OAuth
- Payments: MOCKED Stripe escrow workflow (architected to swap in real Stripe later)

## User Personas
- **Collector**: wants custom art, doesn't want to research artists.
- **Artist**: wants qualified leads, doesn't want cold outreach.

## What's been implemented (v0.1) — 2026-02-28
- Landing page with luxury museum hero + featured artists
- Emergent Google OAuth (session cookie + DB-stored sessions, 7d expiry)
- Role selection (collector vs artist) after first login
- Multi-step intake wizard (Vision → Form → Budget → Style → Review)
- AI brief generation from buyer request (Claude Sonnet 4.5)
- AI matching engine (Claude scores top-5 artists; deterministic fallback)
- Matches page with "94% Match" cards + reasoning
- Artist profile pages (portfolio-first, bio, specialties, price, reviews)
- Artist onboarding (build profile: bio, mediums, styles, portfolio, pricing)
- Browse artists page with filters
- Dashboard (collector & artist views)
- Project detail page with side-by-side proposals + threaded messaging
- AI pricing assistant (low/recommended/premium tiers)
- Proposal submission + acceptance
- MOCKED Stripe escrow (deposit_held → released)
- Reviews & ratings (auto-recompute artist rating)
- 6 demo artists auto-seeded at boot

## Prioritized Backlog
### P1 (next iteration)
- Image uploads for inspiration photos & artist portfolio (object storage)
- Room visualization mockup (AI-generated)
- Real Stripe escrow integration

### P2
- Designer Portal (multi-client management)
- Local Artist Search with map
- Luxury Concierge Mode (>$5k projects)
- Admin Dashboard (artist approvals, disputes)

### P3
- Email notifications (proposal received, milestone updates)
- Mobile-optimized intake wizard
- Saved artists / favorites
