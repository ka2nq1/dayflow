---
id: T7
title: "Implement task-crud feature"
layer: app
deps: ["T4"]
acs: ["AC-04", "AC-04b", "AC-04c", "AC-07b", "AC-12b", "AC-12c", "AC-12d", "AC-12e", "AC-12f", "AC-12g", "AC-12h", "AC-14"]
files_hint: ["src/features/task-crud/"]
owner: Aleksandr
estimate: M
status: todo
---

# T7 — Implement task-crud feature

## Why

Daily and long-term management flows in [sad.md §6 Manage daily task](../sad.md) and [Long-term section](../sad.md). Button-only edit/delete per resolved spec §8 OQ #3 ([sad.md §11](../sad.md)).

## What

- Implement orchestrators in `src/features/task-crud/` for:
  - **Daily:** complete (AC-04), edit title (AC-04b), delete with confirm gate (AC-04c, AC-07b), blank-title block on edit (AC-14).
  - **Long-term goal:** edit title (AC-12c), delete with confirm + cascade steps (AC-12d, AC-12g).
  - **Step:** complete (AC-12b), edit title (AC-12e), delete with confirm (AC-12f, AC-12h) — update progress count on complete/delete.
- Export hooks/actions consumed by T10 (dashboard dailies) and T11 (long-term section).
- Confirm flow delegates to T5 `ConfirmDialog` via callback injection (feature does not import pages).

## Definition of Done

- [ ] Unit tests with mocked repos cover complete/edit/delete happy paths and confirm-withheld paths for daily, goal, and step.
- [ ] Blank title edit blocked with `TitleRequired` sentinel (AC-14).
- [ ] Goal delete removes child steps in repository (AC-12g).
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T6/T9 after T4.
- T8 (rollover) reuses daily complete/delete/edit actions from this module.
