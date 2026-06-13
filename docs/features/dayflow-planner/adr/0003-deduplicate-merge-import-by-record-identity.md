---
status: Accepted
owner: "Aleksandr"
reviewers: ["Tech Lead"]
updated_at: "2026-06-13"
feature_size: "S"
ticket: ""
---

# 0003 — Deduplicate merge import by record identity

- **Status:** Accepted
- **Date:** 2026-06-13
- **Deciders:** Aleksandr (Architect), Planner (product owner via Socratic walk)

## Context

Merge import (AC-11) must combine backup contents with on-device data without creating unbounded duplicates (spec §6.1 abuse case: repeat import duplicates). Spec §8 Open Question #1 asked whether deduplication uses exact record identity or title/date heuristics; default was identity-only, due before design.

## Decision drivers

- AC-11 merge path — combine backup with existing data and confirm success.
- AC-20 — duplicate daily titles on the same day are allowed (two tasks both titled `Buy milk`).
- Abuse case — repeat import duplicates must be recognized and skipped with a summary.
- Deterministic, testable merge behavior for the ≥ 95% import-success KPI.

## Considered options

1. **Exact record identity** — match on internal record id (UUID) present in backup JSON; skip if id already exists on device.
2. **Title + date/type heuristic** — match daily tasks by title + active date, steps by title + parent long-term task.
3. **Always append** — no deduplication; every merge duplicates all records.

## Decision outcome

**Chosen:** Option 1 — deduplicate by exact record identity only. Preserves AC-20 (same-title dailies coexist), avoids false-positive merges when two distinct tasks share a title, and closes spec §8 OQ #1. Merge summary reports added vs skipped counts.

## Consequences

**Positive**
- Deterministic merge — same backup + same device state always yields the same result.
- Simple automated test: import twice, assert zero net new records on second pass.
- Aligns with UUID id strategy in the assumptions ledger.

**Negative**
- Planner cannot deduplicate semantically identical tasks exported from different devices with different ids — they remain separate until manually deleted.

**Neutral**
- Title-based deduplication could be added in v2 as an optional merge mode without breaking the identity contract.

## Links

- Spec: [[../spec.md]] — AC-11, AC-20, §6.1 abuse case, §8 OQ #1
- SAD: [[../sad.md]] §4, §8
- Related ADR: [[0002-store-planner-data-in-indexeddb]]
