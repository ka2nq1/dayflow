---
id: T9
title: "Implement backup export/import service"
layer: app
deps: ["T4"]
acs: ["AC-07", "AC-10", "AC-11", "AC-11b", "AC-15", "AC-19"]
files_hint: ["src/features/backup/"]
owner: Aleksandr
estimate: M
status: todo
---

# T9 — Implement backup export/import service

## Why

Manual migration path ([spec US-07, US-08](../spec.md)). Backup JSON shape in [data-model.md §Backup JSON](../data-model.md); merge dedup by record UUID only ([ADR-0003](../adr/0003-deduplicate-merge-import-by-record-identity.md)).

## What

- Implement in `src/features/backup/`:
  - **Export:** build versioned JSON with `dayflowBackupVersion`, `exportedAt`, and all entity arrays (AC-10).
  - **Validate:** parse file; reject unreadable JSON, missing version marker, or missing collections (AC-15, AC-19) — no data changes on failure.
  - **Replace:** clear all stores, bulk-write backup records after explicit confirm flag (AC-11b).
  - **Merge:** insert records whose `id` is not already present; skip existing ids; return summary `{ added, skipped }` (AC-11, ADR-0003).
  - **Gate:** reject import when mode not chosen or not confirmed (AC-07).
- Export pure validation helpers for unit testing without DOM.

## Definition of Done

- [ ] Unit tests: valid export shape; invalid file blocked with no writes (AC-15, AC-19); replace overwrites all data; merge skips duplicate ids and adds new ones; unconfirmed import blocked (AC-07).
- [ ] Export includes 100% of on-device records (assert count parity — spec §6 NFR).
- [ ] Lint + typecheck clean.

## Notes

- Parallel with T6/T7 after T4.
- File picker and download UX in T12; this task is service logic only.
