---
id: T15
title: "Add core integration tests"
layer: tests
deps: ["T9", "T14"]
acs: []
files_hint: ["src/**/*.test.ts", "src/**/*.test.tsx", "vitest.config.ts"]
owner: Aleksandr
estimate: M
status: todo
---

# T15 — Add core integration tests

## Why

Spec §6 NFRs require automated verification of persistence-after-reload and backup export completeness ([sad.md §10 QG-3](../sad.md)). Test fixtures planned in [data-model.md §Test fixtures](../data-model.md).

## What

- Add Vitest integration tests with `fake-indexeddb`:
  - **Persistence:** create daily + long-term + step → reload db connection → assert records present (spec §6 NFR).
  - **Export completeness:** seed known dataset → export → assert counts match all stores (spec §6 NFR).
  - **Import replace:** replace import → assert device matches backup exactly.
  - **Import merge:** merge import with overlapping ids → assert skipped count; new ids added (ADR-0003).
  - **Invalid import:** corrupt file → assert zero writes.
- Implement test builders: `buildDailyTask`, `buildLongTermTask`, `buildStep`, `buildBackupFile` per data-model.md.
- Document test commands in README.

## Definition of Done

- [ ] All integration tests pass in CI/local `npm test`.
- [ ] Coverage includes the two spec §6 automated NFR scenarios (persistence + export completeness).
- [ ] PII guard: fixture titles use `Test task` / `Example goal` only.
- [ ] Lint + typecheck clean.

## Notes

- Feature-level unit tests belong in their task DoDs (T3–T9, T10–T12); this task covers cross-cutting integration only.
- No new product code except test helpers unless gaps found — fix forward in the owning feature task if a bug surfaces.
