---
name: app-audit
description: Use when someone asks to audit the app, find broken flows, detect incomplete features, review the application state, or identify what is missing in BlackLine. Also triggers on "qué está roto", "qué falta", "qué está incompleto", "revisar la app", "app health check".
disable-model-invocation: true
---

# App Audit — BlackLine

Analyzes the real state of the application, detects broken flows, incomplete features, and gaps between frontend and backend. Produces a prioritized report saved to `docs/plans/`.

## Context to load BEFORE analyzing

Read these files first to have full architectural context:

1. `CLAUDE.md` — architecture, models, data flow, normalization rules
2. `docs/plans/normalization-and-architecture.md` — known issues and backlog
3. All files in `docs/plans/` — existing plans and their status

## Analysis Steps

### Step 1 — Frontend route map

Read `frontend/src/app/app.routes.ts` to list all routes. Then inspect every folder under `frontend/src/app/features/`:

```bash
ls frontend/src/app/features/
```

For each feature module found, read the main `.component.ts` and identify:
- What does the component do? (signals, methods, injected services)
- Does it call any endpoint that might not exist in the backend?
- Are empty states, error states, and loading states implemented?
- Are there buttons or navigation links that lead nowhere?

### Step 2 — Backend endpoint map

Read `backend/apps/quotes/urls.py`, `backend/apps/artists/urls.py`, and `backend/apps/users/urls.py` to map all endpoints.

For each endpoint determine:
- Is the view fully implemented (not a stub or TODO)?
- Does the frontend consume it in any service file?
- Does the serializer return all the fields the frontend expects?

### Step 3 — Frontend ↔ Backend cross-reference

Compare HTTP calls in `frontend/src/app/core/services/` against the backend endpoint map:

- **Endpoints with no frontend consumer:** backend has the endpoint but no Angular component uses it
- **Calls without an endpoint:** frontend calls a URL that doesn't exist in the backend
- **Incomplete data contract:** frontend expects a field the serializer doesn't return

### Step 4 — User flow analysis

Evaluate these critical BlackLine flows to detect breakpoints:

**CLIENT flow:**
1. Register → Login → Client dashboard
2. Dashboard → Cotizador (4-step wizard) → Submit quote
3. Quote submitted → Match page (search by city) → Select artist
4. Artist selected → Appointment panel (date/time) → Health questionnaire → Confirmation
5. Mis Citas → View appointment status and updates

**STUDIO (artist) flow:**
1. Login → Artist dashboard (stats, agenda, calendar blocks)
2. Dashboard → Pending appointments → Approve / Reject / Counter-offer
3. Portfolio → Upload images → Reorder
4. Profile → Configure city, rates, styles

For every step in every flow, determine:
- ✅ Implemented and functional
- ⚠️ Partially implemented (exists but something is missing)
- ❌ Not implemented or broken

### Step 5 — Classify issues

Classify every problem found with:

**Severity:**
- 🔴 CRITICAL — Breaks a core flow; the user cannot complete a primary task
- 🟠 MEDIUM — Degrades experience; there is a workaround but it is confusing
- 🟡 LOW — Nice-to-have; does not block normal use

**Category tag:**
- `[BROKEN FLOW]` — A flow step doesn't work or redirects incorrectly
- `[INCOMPLETE FEATURE]` — The feature exists but is missing parts
- `[MISSING ENDPOINT]` — Frontend needs an API endpoint that doesn't exist
- `[EMPTY UI]` — Screen has no empty state, error state, or loading indicator
- `[BUSINESS LOGIC]` — An important business rule is not implemented

## Report Format

Generate the report using this exact structure:

```markdown
# App Audit — BlackLine
**Date:** [YYYY-MM-DD]

## Executive Summary
[2–3 paragraphs: overall state, most critical areas, trend]

## Issues by Severity

### 🔴 Critical ([N] issues)
| # | Area | Description | Category | Recommended Action |
|---|------|-------------|----------|--------------------|
| 1 | ...  | ...         | [TAG]    | ...                |

### 🟠 Medium ([N] issues)
[same table]

### 🟡 Low ([N] issues)
[same table]

## Flow Analysis

### Client Flow
| Step | Status | Detail |
|------|--------|--------|
| 1. Register → Login | ✅ | ... |
| 2. ...              | ⚠️ | ... |

### Artist Flow
[same table]

## Frontend ↔ Backend Gaps
- **Unconsumed endpoints:** [list]
- **Calls without endpoint:** [list]

## Priority Recommendations
1. [Most urgent item with business justification]
2. ...

## Updated Backlog
[New issues not yet documented in docs/plans/normalization-and-architecture.md]
```

## Delivery

1. **Display the full report** in the chat
2. **Write the file** to `docs/plans/app-audit-[YYYY-MM-DD].md`
3. **Update `docs/plans/README.md`** adding an index entry for the new audit

## Rules

- Do not invent problems — only report what is actually in the code
- If a component exists but you haven't read its code, read it before marking it ✅
- Frame every issue in business terms (tattoo marketplace context), not just technical terms
- If a problem is already documented in `docs/plans/`, reference it instead of duplicating
