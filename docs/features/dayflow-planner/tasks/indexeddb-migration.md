---
id: T2
title: "Promote IndexedDB v1 schema migration"
layer: migration
deps: ["T1"]
acs: []
files_hint: ["docs/features/dayflow-planner/migrations/01_create_planner_schema.up.ts", "docs/features/dayflow-planner/migrations/01_create_planner_schema.down.ts", "src/shared/storage/"]
owner: Aleksandr
estimate: S
status: todo
---

# T2 — Promote IndexedDB v1 schema migration

## Why

[ADR-0002](../adr/0002-store-planner-data-in-indexeddb.md) and [data-model.md](../data-model.md) define four object stores with indexes. Staged migration files exist under `docs/features/dayflow-planner/migrations/` — `implement` promotes them to live storage code.

## What

- Promote [`01_create_planner_schema.up.ts`](../migrations/01_create_planner_schema.up.ts) and `.down.ts` to `src/shared/storage/migrations/`.
- Implement `openPlannerDb()` wrapper that runs `onupgradeneeded` at `DB_VERSION = 1`.
- Create object stores: `daily_tasks`, `long_term_tasks`, `steps`, `app_meta` with indexes per [data-model.md §Indexes](../data-model.md).
- Seed `app_meta.schemaVersion` on first open.

## Definition of Done

- [ ] Migration applies cleanly in Vitest with `fake-indexeddb` — all stores and indexes exist.
- [ ] Down migration (or test teardown) drops/recreates without leaking state between tests.
- [ ] `openPlannerDb()` resolves to a typed connection usable by repository tasks (T4).

## Notes

- **Serialized lane:** only one migration task in v1; future schema changes add `02_*` in staged docs first.
- No entity CRUD in this task — schema only.
