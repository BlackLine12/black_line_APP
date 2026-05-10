---
name: feature-idea
description: Use when someone asks for feature ideas, new functionality suggestions, what to build next, or how to improve a specific area of BlackLine. Accepts an optional area argument (client, artist, admin, business). Also triggers on "qué podemos construir", "ideas para mejorar", "nuevas features", "qué le falta al artista/cliente".
argument-hint: [client|artist|admin|business|all]
---

# Feature Ideas — BlackLine

Generates concrete, prioritized feature ideas for a specific area of the BlackLine tattoo marketplace. Each idea includes business value, implementation complexity, and the technical components required.

## Input

`$ARGUMENTS` — The area to focus on. Valid values:
- `client` — Features for the client-side experience
- `artist` — Features that make the platform more valuable for tattoo artists
- `admin` — Back-office and moderation features
- `business` — Cross-cutting features that drive revenue or retention
- `all` or empty — Cover all areas

## Context to load

Before generating ideas, read:

1. `CLAUDE.md` — Architecture, models, existing flows
2. `docs/plans/normalization-and-architecture.md` — Current DB schema and known gaps
3. All existing files in `docs/plans/` — What's already planned or in progress
4. For the relevant area, read the current component implementations to understand what already exists:
   - Client: `frontend/src/app/features/client/`
   - Artist: `frontend/src/app/features/studio/`
   - Backend models: `backend/apps/quotes/models.py`, `backend/apps/artists/models.py`

**Do not suggest features that are already implemented or already planned in `docs/plans/`.**

## Idea Generation Framework

For each feature idea, think through:

1. **User pain point** — What frustration or gap does this solve?
2. **Business value** — How does this help BlackLine grow (more artists, more bookings, retention, revenue)?
3. **Technical feasibility** — What models, endpoints, and Angular components would it need?
4. **Complexity estimate:**
   - S (Small) — 1–2 days: minor UI change, new endpoint on existing model
   - M (Medium) — 3–5 days: new model + API + Angular component
   - L (Large) — 1–2 weeks: new subsystem, multiple models, complex UI

Generate **8–12 ideas** for the specified area, covering a mix of complexities.

## Ideas to Consider by Area

Use these as inspiration seeds (generate beyond these based on what the app currently lacks):

**Client-side:**
- Review & rating system (after appointment completion)
- Saved / favorited artists list
- Appointment history with photo of completed tattoo
- Price alert: notify when an artist in their city becomes available
- Style preference profile (beyond one quote at a time)
- Reference image upload when creating a quote
- Push / email notifications for appointment status changes
- Re-book a previous artist with one tap

**Artist-side:**
- Availability calendar (set weekly schedule, not just manual blocks)
- Client blacklist / notes (private artist notes per client)
- Earnings dashboard (total revenue, pending, completed)
- Portfolio analytics (views, favorites, conversion to bookings)
- Subscription or featured listing for higher visibility
- Custom pricing per style / zone (override defaults)
- Client intake form builder (custom pre-appointment questions)
- Waiting list for when the artist is fully booked

**Business / Admin:**
- Commission system (% per completed appointment)
- Dispute resolution flow (client vs artist claims)
- Artist verification badges (years of experience, certifications)
- Platform analytics (bookings per city, popular styles, conversion rates)
- Promotional codes / discount system
- Featured artist slots on landing page
- Automated reminders (24h before appointment)

**Cross-cutting:**
- In-app messaging between client and artist
- Social sharing of portfolio images
- Public artist profile page (SEO-indexed, no login required)
- Multi-language support (ES / EN)

## Output Format

Structure each idea as:

```markdown
### [N]. [Feature Name]

**Area:** client | artist | admin | business
**Complexity:** S | M | L
**Priority score:** [High | Medium | Low] — [one-line justification]

**Problem it solves:**
[One sentence from the user's perspective]

**Business value:**
[Why this helps BlackLine: retention, revenue, acquisition, trust]

**Implementation outline:**
- Backend: [new models needed, new endpoints]
- Frontend: [new components or changes to existing ones]
- Business rules: [key logic to implement]

**Dependencies:** [what needs to exist first, if anything]
```

After all ideas, add a **Priority Matrix** section:

```markdown
## Priority Matrix

| Feature | Complexity | Impact | Priority |
|---------|------------|--------|----------|
| [name]  | S          | High   | 🔴 Do first |
| [name]  | M          | High   | 🟠 Do next  |
| [name]  | L          | Medium | 🟡 Backlog  |
```

## Delivery

1. **Display all ideas** in chat with the full formatted output
2. **Write to file:** `docs/plans/feature-ideas-[area]-[YYYY-MM-DD].md`
3. **Update `docs/plans/README.md`** with an index entry pointing to the new file

## Rules

- Every idea must be specific and implementable — no vague concepts like "improve UX"
- Tie each idea to the BlackLine business model (tattoo marketplace, CLIENT/STUDIO roles)
- Do not suggest features already implemented or planned in existing docs/plans files
- Prefer ideas that improve the core loop: Quote → Match → Appointment → Completion
- The priority score must reflect both business impact AND current app maturity
