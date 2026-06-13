---
id: T10
title: "Build dashboard page"
layer: ui
deps: ["T5", "T6", "T7", "T8"]
acs: ["AC-01", "AC-04", "AC-04b", "AC-04c", "AC-05", "AC-09", "AC-09b", "AC-09c", "AC-09d", "AC-09e", "AC-09f", "AC-09g", "AC-18"]
files_hint: ["src/pages/dashboard/"]
owner: Aleksandr
estimate: M
status: todo
---

# T10 — Build dashboard page

## Why

Dashboard is the main capture surface ([CONTEXT.md](../CONTEXT.md), [sad.md §5 pages/dashboard](../sad.md)). Integrates quick-add, today's dailies, rolled-over block, and navigation to long-term section (AC-18 entry point).

## What

- Implement `src/pages/dashboard/` composing T5 primitives and T6/T7/T8 hooks:
  - Quick-add field — Enter to submit, retain focus after success (AC-01); show inline errors (AC-05).
  - Today's daily list — oldest first (AC-17 via repo order); complete/edit/delete buttons (AC-04, AC-04b, AC-04c, AC-07b, AC-14).
  - Rolled-over block — visible when T8 reports prior-day incomplete tasks; move-to-today, complete, edit, delete actions (AC-09*).
  - Link/tab to long-term section (AC-18 navigation trigger).
- Call `runDayTransition()` on mount (AC-09f).
- Mobile-first layout; list items show completed state inline (AC-04).

## Definition of Done

- [ ] Component/integration tests cover quick-add success, empty submit error, daily CRUD, and rollover block actions with mocked features.
- [ ] Manual smoke: confirm quick-add → list update ≤ 500 ms on warm state (spec §6 NFR — spot check).
- [ ] Uses T5 `Input`, `Button`, `Checkbox`, `ConfirmDialog` — no duplicate primitives.
- [ ] Lint + typecheck clean.

## Notes

- Shares `src/pages/dashboard/` lane with T13 (offline shell wraps app) — coordinate file ownership.
- Does not implement backup UI (T12) or long-term detail view (T11).
