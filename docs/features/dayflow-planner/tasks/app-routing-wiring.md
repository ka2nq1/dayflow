---
id: T14
title: "Compose app routing and empty-state recovery"
layer: wiring
deps: ["T10", "T11", "T12", "T13"]
acs: ["AC-18"]
files_hint: ["src/app/", "src/pages/"]
owner: Aleksandr
estimate: S
status: todo
---

# T14 — Compose app routing and empty-state recovery

## Why

[sad.md §4](../sad.md) defines client-side routing (Dashboard + Long-term + backup access). Storage eviction risk ([sad.md §11](../sad.md)) requires empty state with recovery guidance pointing to backup import.

## What

- Finalize `src/app/` router: `/` dashboard, `/long-term` goals, `/settings` backup (or equivalent tab bar on mobile).
- Add bottom/tab navigation between dashboard and long-term (AC-18).
- Wire settings/backup route to T12 page.
- Implement empty-state component when all stores are empty **or** on first open: brief copy + link to backup import (resolved spec §8 OQ #4).
- Optional one-time post-install export hint on dashboard (spec §8 OQ #2 default — minimal non-nagging banner, dismissible).
- App-level error boundary for unexpected render failures.

## Definition of Done

- [ ] E2E or integration test navigates dashboard ↔ long-term ↔ settings routes.
- [ ] Empty IndexedDB shows recovery guidance with import CTA.
- [ ] All pages reachable via nav without full page reload.
- [ ] Lint + typecheck clean.

## Notes

- Terminal wiring task before integration tests (T15).
- Lane shares `src/app/` with T1/T13.
