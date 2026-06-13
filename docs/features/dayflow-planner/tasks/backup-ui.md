---
id: T12
title: "Build backup settings UI"
layer: ui
deps: ["T5", "T9"]
acs: ["AC-07", "AC-10", "AC-11", "AC-11b", "AC-15", "AC-19"]
files_hint: ["src/pages/settings/", "src/features/backup/"]
owner: Aleksandr
estimate: S
status: todo
---

# T12 — Build backup settings UI

## Why

Export/import UX for [spec US-07, US-08](../spec.md) and [sad.md §6 Export/Import flows](../sad.md). Destructive replace requires explicit confirmation (spec §6.1).

## What

- Add settings/backup section (route or modal from dashboard):
  - **Export button** — triggers T9 export, downloads JSON file with sensible filename (AC-10).
  - **Import flow** — file picker → validate via T9 → force explicit replace vs merge choice → confirm dialog explaining overwrite for replace (AC-07, AC-11, AC-11b) → show success or invalid-backup error (AC-15, AC-19).
  - **Merge summary** — display added/skipped counts after merge (spec §6.1 abuse case).
- Use T5 `ConfirmDialog` for replace confirm and T5 `InlineError` for validation failures.

## Definition of Done

- [ ] Component tests: export triggers download payload; import blocked without mode/confirm (AC-07); invalid file shows error with no data change (AC-15); replace and merge success paths mocked.
- [ ] No import writes occur before user confirms chosen mode.
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T10/T11 after T5 + T9.
- Service logic stays in T9 — this task is UI wiring only.
