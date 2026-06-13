# Changelog — dayflow-planner

## dayflow-planner — Offline installable daily + long-term planner (v1)

**What:** DayFlow is an installable PWA for solo planners: capture daily tasks, long-term goals with steps, uncapped rollover of incomplete dailies, and manual JSON backup export/import — all on-device with no accounts or network.

**Why:** Closes the gap for a minimalist integrated capture loop (daily + long-term + prefix quick-add + rollover) without sync infrastructure. See [spec](./spec.md) §1–§2. Key decisions: [ADR-0001 PWA SPA](./adr/0001-deliver-as-installable-pwa-spa.md), [ADR-0002 IndexedDB persistence](./adr/0002-store-planner-data-in-indexeddb.md), [ADR-0003 merge dedup by record id](./adr/0003-deduplicate-merge-import-by-record-identity.md).

**How to use:**
- Open the app → **Today** dashboard → type in quick-add and press Enter (plain text = daily, `!` = long-term goal, `+` = step on latest goal).
- Incomplete prior-day dailies appear in the rolled-over block; use **Move to today** or complete/edit/delete in place.
- **Long-term** tab shows goal progress and expandable step checklists.
- **Settings** → export backup JSON; import with explicit **Replace** or **Merge** confirmation.

**Operational notes:**
- Migration: client-side IndexedDB schema v1 applied on first open (`src/shared/storage/migrations/` — promoted from [staged migration](./migrations/01_create_planner_schema.up.ts)). No server migration.
- Feature flag / config: none.
- Rollback: revert deploy; IndexedDB data remains on device until cleared by browser. Replace-import can restore from backup.
- Build note: `npm run build` completes the Vite bundle but the PWA service-worker step may fail on Node 18 (`tracingChannel`); use Node 20+ for full production builds, or rely on `npm run dev` / Playwright e2e for verification.

**Acceptance criteria delivered:** AC-01 through AC-20 (37 criteria) — quick-add prefix capture, daily CRUD with confirm-on-delete, rollover (auto + manual move), long-term goals/steps with progress, backup export/import (replace + merge with id dedup), PWA offline read/write, validation error paths, oldest-first ordering.

**Deferred post-v1 (spec §8):** post-install export hint (PM); empty-state recovery banner test (Tech Lead).
