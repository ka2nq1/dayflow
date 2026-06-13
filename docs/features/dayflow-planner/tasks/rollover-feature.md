---
id: T8
title: "Implement rollover feature"
layer: app
deps: ["T4", "T7"]
acs: ["AC-09", "AC-09b", "AC-09c", "AC-09d", "AC-09e", "AC-09f", "AC-09g"]
files_hint: ["src/features/rollover/"]
owner: Aleksandr
estimate: M
status: todo
---

# T8 — Implement rollover feature

## Why

Uncapped daily rollover is a product wedge ([spec US-06](../spec.md)). Event-driven day transition on dashboard load per [sad.md §6 Rollover on dashboard load](../sad.md) and [CONTEXT.md](../CONTEXT.md) calendar-day glossary.

## What

- Implement `runDayTransition()` in `src/features/rollover/`:
  - Compare `app_meta.lastSeenCalendarDay` to today (local timezone).
  - On new calendar day: identify incomplete dailies with `activeDate < today`; expose as rolled-over block payload (AC-09f, AC-09b — no dropping older days).
  - Update `lastSeenCalendarDay` after transition.
- Implement rolled-over actions reusing T7 daily CRUD where applicable:
  - Move to today → set `activeDate = today` (AC-09).
  - Complete from rollover block → completed + removed from block (AC-09c).
  - Edit title in block (AC-09d).
  - Delete with confirm (AC-09e, AC-09g).
- Export `useRollover()` hook for T10 dashboard.

## Definition of Done

- [ ] Unit tests: multi-day incomplete tasks all appear in rollover block (AC-09b); day-transition moves prior incomplete dailies (AC-09f); move-to-today, complete, edit, delete paths (AC-09, AC-09c–g).
- [ ] Same-calendar-day reload does not duplicate rollover processing.
- [ ] Lint + typecheck clean.

## Notes

- Depends on T7 for shared daily mutate semantics and confirm patterns.
- No UI in this task — T10 renders the rolled-over block.
