---
status: Accepted
owner: "Aleksandr"
reviewers: ["Tech Lead"]
updated_at: "2026-06-13"
feature_size: "S"
ticket: ""
---

# 0001 — Deliver as installable PWA SPA

- **Status:** Accepted
- **Date:** 2026-06-13
- **Deciders:** Aleksandr (Architect), Planner (product owner via Socratic walk)

## Context

DayFlow must ship as a self-contained, installable experience on the planner's phone with full offline read/write (AC-13). The repository is greenfield with no existing frontend stack. The spec explicitly excludes cloud accounts, backend services, and app-store distribution in v1.

## Decision drivers

- Offline read/write availability — 100% of core flows (spec §6 NFR).
- US-09 / AC-13 — install from supported mobile browser, use offline afterward.
- Non-goal: cloud accounts and automatic sync — no backend surface in v1.
- Feature size S — minimize build and distribution complexity.

## Considered options

1. **Installable PWA SPA with service worker** — browser-delivered React SPA cached by a service worker; add-to-home-screen install prompt.
2. **PWA with server-side rendering (SSR)** — requires a server for initial render; conflicts with no-backend constraint.
3. **Native or cross-platform mobile app** — React Native / Flutter with local SQLite; app-store or sideload distribution.

## Decision outcome

**Chosen:** Option 1 — installable PWA SPA with service worker. Meets AC-13 without a backend, matches the spec's «install from browser» constraint, and keeps the S-scope delivery path to static build artifacts on the planner's device.

## Consequences

**Positive**
- Single codebase deployable as static files; no server ops.
- Service worker enables offline shell and warm-start dashboard within the ≤ 1000 ms NFR target.
- Aligns with spec non-goals (no cloud, no accounts).

**Negative**
- Browser storage eviction remains a platform risk outside app control (mitigated in §11).
- PWA install UX varies by mobile browser; not a fully native shell.

**Neutral**
- Switching to native mobile later requires a new surface and data-migration path, but backup JSON provides an export bridge.

## Links

- Spec: [[../spec.md]] — US-09, AC-13
- SAD: [[../sad.md]] §4
- Related ADR: [[0002-store-planner-data-in-indexeddb]]
