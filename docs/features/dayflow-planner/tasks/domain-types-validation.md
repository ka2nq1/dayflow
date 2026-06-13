---
id: T3
title: "Define planner domain types and validation"
layer: domain
deps: ["T1"]
acs: ["AC-05", "AC-06", "AC-08", "AC-14", "AC-16", "AC-17", "AC-20"]
files_hint: ["src/entities/daily-task/", "src/entities/long-term-task/", "src/entities/step/", "src/shared/lib/"]
owner: Aleksandr
estimate: S
status: todo
---

# T3 — Define planner domain types and validation

## Why

Entity invariants from [spec §5](../spec.md) (AC-05, AC-06, AC-08, AC-14, AC-16, AC-17, AC-20) and [sad.md §2 Constraints](../sad.md) (UUID v4 ids, creation-order sort, prefix semantics) belong in the entities layer — prefix-agnostic records, validation in pure functions.

## What

- Define TypeScript types for `DailyTask`, `LongTermTask`, `Step`, and domain sentinel errors (e.g. `TitleRequired`, `NoLongTermTaskForStep`, `DuplicateStepTitle`).
- Implement `parseQuickAddEntry(raw: string)` → `{ kind: 'daily' | 'longTerm' | 'step'; title: string }` per [sad.md §6 Quick-add prefix capture](../sad.md) and AC-16 (strip optional whitespace after prefix).
- Implement title validators (non-empty on create/edit).
- Implement step duplicate-title check helper (case-sensitive exact match within parent goal — AC-08).
- Add `generateId()` UUID v4 helper and date helpers (`todayLocalDate()`, ISO calendar-day strings) in `src/shared/lib/`.

## Definition of Done

- [ ] Unit tests cover: empty quick-add (AC-05), `+` with no long-term task (AC-06), duplicate step title (AC-08), blank edit save (AC-14), prefix stripping (AC-16), duplicate daily titles allowed (AC-20).
- [ ] Types exported from `entities/` with no imports from `features/` or `pages/`.
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T2 after T1 — no IndexedDB dependency.
- Ordering (AC-17) enforced at repository read layer (T4), but types include `createdAt` field.
