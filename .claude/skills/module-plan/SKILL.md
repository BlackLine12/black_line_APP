---
name: module-plan
description: Use when someone asks to plan a new module, design a complete feature from scratch, or get a full implementation blueprint for something new in BlackLine. Accepts the module name as argument. Also triggers on "planear módulo", "diseñar feature completa", "cómo implementaríamos", "blueprint para".
argument-hint: [module-name]  (e.g. reviews, notifications, payments, chat)
---

# Module Plan — BlackLine

Designs a complete, implementation-ready plan for a new module in the BlackLine tattoo marketplace. Covers database models, API endpoints, Angular components, business rules, and the recommended build order.

## Input

`$ARGUMENTS` — The module name to plan (e.g., `reviews`, `notifications`, `payments`, `chat`, `availability`).

If no argument is provided, ask the user: "Which module do you want to plan? (e.g., reviews, notifications, payments, in-app chat, availability calendar)"

## Context to load

Before designing anything, read:

1. `CLAUDE.md` — Architecture patterns, normalization rules, existing models, tech stack
2. `docs/plans/normalization-and-architecture.md` — Current DB schema and relationships
3. `backend/apps/quotes/models.py` and `backend/apps/artists/models.py` — Existing model patterns to follow
4. `backend/apps/quotes/serializers.py` — Serializer patterns to follow
5. `frontend/src/app/core/services/quote.service.ts` — Service pattern to follow
6. `frontend/src/app/features/client/pages/` — Component structure patterns to follow

**The new module must fit within the existing architecture.** Do not propose a different tech stack, different auth system, or patterns that conflict with what's already built.

## Design Steps

### Step 1 — Define the module scope

Clarify for the specific `$ARGUMENTS` module:
- **Who uses it?** (CLIENT, STUDIO, ADMIN, or multiple roles)
- **What is the primary user action?** (create, view, respond, configure)
- **What existing models does it relate to?** (User, ArtistProfile, QuoteRequest, Appointment)
- **What is the business trigger?** (When does a user need this?)

### Step 2 — Database design

Design Django models following these project conventions:
- Use `models.Model` (no abstract base — project pattern)
- Foreign keys use `on_delete=models.CASCADE` (for ownership) or `SET_NULL` (for optional references)
- Include `created_at = models.DateTimeField(auto_now_add=True)` on every model
- Include `updated_at = models.DateTimeField(auto_now=True)` where state changes over time
- Use `TextChoices` enums for status fields
- Validate business rules in `clean()` method

For each model provide:
- Model name and purpose
- All fields with types, constraints, and `verbose_name`
- Relationships (FK, M2M, OneToOne) with `related_name`
- Any `Meta` options (ordering, unique_together, indexes)
- Any `clean()` validations

### Step 3 — API endpoint design

Design DRF endpoints following project conventions:
- Use `APIView` (not ViewSets — project pattern)
- `permission_classes = [IsAuthenticated]` on all views
- Separate read serializers (expanded) from write serializers (strict)
- Response format: `{ data: T }` for single, `{ count: N, results: T[] }` for lists
- URL pattern: `/api/[app-name]/[resource]/` and `/api/[app-name]/[resource]/<pk>/`

For each endpoint provide:
- HTTP method + URL
- Who can call it (CLIENT only, STUDIO only, both, ADMIN)
- Request body schema
- Response schema
- Business rules enforced (permissions, ownership checks, state transitions)

### Step 4 — Angular component design

Design the frontend following Angular 19 standalone conventions:
- All components are standalone with `imports: [CommonModule, ...]`
- Use `signal()`, `computed()`, `effect()` — no RxJS state except for HTTP
- Use `@for` / `@if` — not `*ngFor` / `*ngIf`
- Use `inject()` — no constructor injection
- Follow BlackLine design system (dark luxury, gold accents, `#0C0A08` bg)

For each component provide:
- Component name and selector
- Route path where it lives
- Signals and computed values needed
- Methods (API calls, state transitions)
- Template structure (top-level elements, key conditional blocks)
- Which existing service to extend or whether a new service is needed

### Step 5 — Business rules

List all business rules the module must enforce, written as:
```
RULE [N]: [Subject] [condition] [consequence]
Example: RULE 1: A CLIENT can only submit one review per completed Appointment.
```

Include rules for:
- Who can create / read / update / delete
- State transitions (what triggers what)
- Validation constraints beyond DB-level
- Edge cases (what happens when X is null, when Y is deleted, etc.)

### Step 6 — Build order

Recommend the exact order to implement the module:

```
Phase 1 — Backend foundation
  1. Create model(s) + migration
  2. Write serializers (read + write)
  3. Write views
  4. Register URLs
  5. Test endpoints manually with Swagger UI (/api/docs/)

Phase 2 — Frontend integration
  6. Add types to frontend/src/app/core/models/
  7. Add service methods to relevant service (or create new service)
  8. Build Angular component(s)
  9. Register route in feature routing file
  10. Add navigation link in navbar (if user-facing)

Phase 3 — Polish
  11. Empty states, error states, loading states
  12. Mobile responsive layout
  13. Update docs/plans/ with implementation status
```

## Output Format

```markdown
# Module Plan: [Module Name]
**Date:** [YYYY-MM-DD]
**Estimated complexity:** S | M | L
**Roles involved:** CLIENT | STUDIO | ADMIN

## Overview
[2–3 sentences: what this module does and why it matters for BlackLine]

## Database Design

### Model: [ModelName]
```python
class [ModelName](models.Model):
    # [full model code]
```
**Relationships:** [describe FK/M2M context]
**Indexes to add:** [list]

## API Endpoints

| Method | URL | Role | Description |
|--------|-----|------|-------------|
| POST | /api/... | CLIENT | ... |

### [Endpoint name]
**Request:** `{ field: type, ... }`
**Response:** `{ field: type, ... }`
**Business rules:** [list]

## Angular Components

### [ComponentName] (`/path/in/app`)
**Signals:** `signalName = signal<Type>(default)`
**Methods:** `methodName(): void`
**Template outline:** [key blocks]

## Business Rules
- RULE 1: ...
- RULE 2: ...

## Build Order
[Phase 1, 2, 3 as described above]

## Open Questions
[Any design decisions that need input before implementation]
```

## Delivery

1. **Display the full plan** in chat
2. **Write to file:** `docs/plans/module-[name]-[YYYY-MM-DD].md`
3. **Update `docs/plans/README.md`** with an index entry for the new plan

## Rules

- Every model field must have a `verbose_name` (project convention)
- Every endpoint must specify who can call it and what business rules it enforces
- The build order must be followed — never design frontend before the backend contract is defined
- Do not add complexity beyond what the module needs (no over-engineering)
- If `$ARGUMENTS` is a module that could affect payments or legal compliance (consent, medical data), flag it explicitly and recommend legal review
