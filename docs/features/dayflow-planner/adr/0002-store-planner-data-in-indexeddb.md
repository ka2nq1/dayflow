---
status: Accepted
owner: "Aleksandr"
reviewers: ["Tech Lead"]
updated_at: "2026-06-13"
feature_size: "S"
ticket: ""
---

# 0002 — Store planner data in IndexedDB

- **Status:** Accepted
- **Date:** 2026-06-13
- **Deciders:** Aleksandr (Architect), Planner (product owner via Socratic walk)

## Context

All planner data — daily tasks, long-term tasks, and steps — must persist on-device with 100% survival across app restarts (spec §6 NFR) and support full JSON backup export (AC-10). The PWA runs entirely in the browser with no backend.

## Decision drivers

- Data persistence after app restart — 100% (spec §6 NFR).
- Backup export completeness — 100% of tasks and steps (spec §6 NFR).
- Structured entities with relationships (steps belong to long-term tasks; daily tasks keyed by calendar day).
- Long-term usage over weeks/months — storage must scale beyond localStorage's ~5 MB practical limit.

## Considered options

1. **IndexedDB** — browser-native structured store with async API, indexes, and tens-of-MB capacity.
2. **localStorage** — synchronous key-value store with ~5 MB limit and no relational indexing.
3. **In-memory only with periodic JSON file write** — loses data on tab close unless flushed; fails persistence NFR.

## Decision outcome

**Chosen:** Option 1 — IndexedDB as the sole on-device datastore. Supports structured queries for rollover (prior-day incomplete dailies), long-term progress counts, and merge-import identity lookups without size anxiety.

## Consequences

**Positive**
- Natural fit for entity collections (dailies, long-term tasks, steps) with indexes on date and parent id.
- Async API avoids blocking the UI thread during quick-add (≤ 500 ms p95 target).
- Export reads all stores in one pass for AC-10 completeness.

**Negative**
- IndexedDB API is verbose; a thin wrapper (e.g. `idb` or Dexie) adds a dependency.
- Browser may evict storage under disk pressure — mitigated by empty-state recovery guidance (§11).

**Neutral**
- Migrating to another store (e.g. native SQLite in a future mobile surface) requires a one-time export/import via the existing backup format.

## Links

- Spec: [[../spec.md]] — AC-10, AC-11, §6 NFR persistence rows
- SAD: [[../sad.md]] §4, §5
- Related ADR: [[0001-deliver-as-installable-pwa-spa]], [[0003-deduplicate-merge-import-by-record-identity]]
