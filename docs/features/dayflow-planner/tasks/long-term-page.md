---
id: T11
title: "Build long-term page"
layer: ui
deps: ["T5", "T6", "T7"]
acs: ["AC-02", "AC-03", "AC-12", "AC-12b", "AC-12c", "AC-12d", "AC-12e", "AC-12f", "AC-12g", "AC-12h", "AC-18"]
files_hint: ["src/pages/long-term/"]
owner: Aleksandr
estimate: M
status: todo
---

# T11 — Build long-term page

## Why

Long-term section is a separate screen from dashboard ([spec AC-18](../spec.md), [sad.md §6 Long-term section](../sad.md)). Shows goal progress and expandable step checklists (AC-12).

## What

- Implement `src/pages/long-term/`:
  - List all long-term tasks oldest-first with progress label `N of M steps completed` (AC-12).
  - Expandable checklist per goal — step complete/edit/delete via T7 (AC-12b–h).
  - Goal edit/delete with T5 ConfirmDialog (AC-12c, AC-12d, AC-12g).
  - Back/nav link to dashboard.
- Read data via T4 repositories (through feature hooks or page-level data loader).
- Reflect tasks created via quick-add `!` and `+` (AC-02, AC-03) without requiring page refresh beyond query invalidation.

## Definition of Done

- [ ] Component tests: progress count display, step complete updates count, expand/collapse checklist, confirm-gated deletes.
- [ ] Navigation from dashboard opens this route and shows all goals (AC-18).
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T10/T12 once T5, T6, T7 are done.
- Quick-add for `+` steps remains on dashboard — this page is read/manage only.
