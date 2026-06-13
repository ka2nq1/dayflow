---
id: T4
title: "Implement IndexedDB repositories"
layer: infra
deps: ["T2", "T3"]
acs: ["AC-17"]
files_hint: ["src/shared/storage/repositories/", "src/entities/daily-task/", "src/entities/long-term-task/", "src/entities/step/"]
owner: Aleksandr
estimate: M
status: todo
---

# T4 — Implement IndexedDB repositories

## Why

[sad.md §5](../sad.md) places persistence behind a repository layer on top of IndexedDB ([ADR-0002](../adr/0002-store-planner-data-in-indexeddb.md)). Access patterns and indexes are defined in [data-model.md](../data-model.md).

## What

- Implement repositories for `daily_tasks`, `long_term_tasks`, `steps`, and `app_meta` (read/write `lastSeenCalendarDay`).
- Queries per data-model access patterns:
  - Today's list via `by_activeDate_createdAt` (oldest first — AC-17).
  - Rolled-over block: `activeDate < today AND completed = false`, oldest first.
  - Long-term list via `by_createdAt` ASC.
  - Latest long-term via `by_createdAt` cursor `prev` (AC-03).
  - Steps by goal via `by_longTermTaskId_createdAt`.
  - Duplicate step lookup via `by_longTermTaskId_title`.
- Cascade delete: removing a long-term task removes child steps (AC-12g).
- `getAllForExport()` and bulk write helpers for backup (used by T9).

## Definition of Done

- [ ] Repository unit/integration tests with `fake-indexeddb` verify ordering (AC-17), rollover query shape, latest-long-term selection, cascade delete, and app_meta read/write.
- [ ] All CRUD operations return typed entity records from T3.
- [ ] Lint + typecheck clean.

## Notes

- Blocks all `app`-layer feature tasks (T6–T9).
- Repositories must not import from `features/` or `pages/`.
