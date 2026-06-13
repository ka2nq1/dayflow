---
id: T6
title: "Implement quick-add feature"
layer: app
deps: ["T4"]
acs: ["AC-01", "AC-02", "AC-03", "AC-05", "AC-06", "AC-08", "AC-16", "AC-20"]
files_hint: ["src/features/quick-add/"]
owner: Aleksandr
estimate: M
status: todo
---

# T6 — Implement quick-add feature

## Why

Core capture loop from [spec US-01–US-03](../spec.md) and [sad.md §6 Quick-add flows](../sad.md). Prefix parsing lives in a dedicated feature module; entities stay prefix-agnostic ([sad.md §4](../sad.md)).

## What

- Implement `useQuickAdd` hook (or equivalent orchestrator) in `src/features/quick-add/`:
  - Parse entry via T3 `parseQuickAddEntry`.
  - No prefix → create daily task for today's `activeDate` (AC-01, AC-20 duplicates allowed).
  - `!` prefix → create long-term task (AC-02).
  - `+` prefix → append step to latest long-term task (AC-03); block if none (AC-06) or duplicate title (AC-08).
  - Block empty title (AC-05); apply prefix rules per AC-16.
- Map domain sentinel errors to plain-language messages via T5 `InlineError` contract (message keys exported for UI).
- Return `{ submit, error, clearError }` for page wiring in T10.

## Definition of Done

- [ ] Unit tests cover all prefix branches and error paths (AC-01–AC-03, AC-05, AC-06, AC-08, AC-16, AC-20) with mocked repositories.
- [ ] Successful submit persists via T4 repositories.
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T7/T9 after T4.
- Does not render UI — T10 wires the hook to dashboard quick-add field.
