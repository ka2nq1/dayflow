## Summary

Ships **DayFlow v1** — an offline-first, installable PWA for solo planners with prefix quick-add (`!` / `+`), daily tasks with uncapped rollover, long-term goals with step progress, and manual JSON backup export/import. No backend, no accounts. Implements the full [spec](docs/features/dayflow-planner/spec.md) at S scope.

## Acceptance criteria

All 37 acceptance criteria (AC-01 … AC-20) are implemented and covered by unit, integration, component, contract, load, visual, and e2e suites:

- AC-01 — plain-text quick-add creates today's daily task; focus retained ✓
- AC-02 — `!` prefix creates long-term goal ✓
- AC-03 — `+` prefix appends step to latest long-term goal ✓
- AC-04 / AC-04b / AC-04c — daily complete, edit, delete (with confirm) ✓
- AC-05 — empty quick-add blocked ✓
- AC-06 — `+` without long-term goal blocked with hint ✓
- AC-07 / AC-11 / AC-11b — import requires replace-or-merge choice; merge and replace paths ✓
- AC-07b / AC-09e / AC-12d / AC-12f — destructive actions withheld until confirmed ✓
- AC-08 — duplicate step title within goal blocked ✓
- AC-09 … AC-09g / AC-09f / AC-09b — rollover block CRUD, auto-roll on new day, multi-day retention ✓
- AC-10 / AC-15 / AC-19 — backup export; invalid backup blocked with no data change ✓
- AC-12 … AC-12h — long-term progress, expandable checklist, goal/step CRUD ✓
- AC-13 — offline read/write in same session (e2e) ✓
- AC-14 — blank daily edit blocked ✓
- AC-16 / AC-17 / AC-20 — prefix rules, oldest-first ordering, duplicate daily titles allowed ✓
- AC-18 — navigation to long-term section with progress ✓

## Design

- Spec: `docs/features/dayflow-planner/spec.md`
- Architecture: `docs/features/dayflow-planner/sad.md`
- Decisions: `docs/features/dayflow-planner/adr/` (0001 PWA, 0002 IndexedDB, 0003 merge dedup)
- Data model: `docs/features/dayflow-planner/data-model.md` (IndexedDB v1 client migration)

## Tasks (SDD-Task trailers)

```
58cfc5c feat(dayflow-planner): scaffold Vite React PWA + FSD skeleton
e11bc2c feat(dayflow-planner): promote IndexedDB v1 schema migration
7aed0ad feat(dayflow-planner): define planner domain types and validation
827c907 feat(dayflow-planner): implement IndexedDB repositories
0201f48 feat(dayflow-planner): build shared UI primitives
4e71be0 feat(dayflow-planner): implement quick-add feature
bebe1cf feat(dayflow-planner): implement task-crud feature
2198c95 feat(dayflow-planner): implement rollover feature
84d6825 feat(dayflow-planner): implement backup export/import service
4b4f411 feat(dayflow-planner): build dashboard page
c82312d feat(dayflow-planner): build long-term page
be1a4ec feat(dayflow-planner): build backup settings UI
750a60c feat(dayflow-planner): wire PWA offline shell
d246db7 feat(dayflow-planner): compose app routing and empty-state recovery
3942672 test(dayflow-planner): add core integration tests
a587cc4 feat(dayflow-planner): add PWA icons and features folder placeholder
<this PR> test(dayflow-planner): review-fix coverage + ship artifacts
```

## Verification

- **Lint:** `npm run lint` — pass (1 react-refresh warning, no errors)
- **Unit + integration + component + contract + load + visual:** `npm test` — **17 files, 82/82 pass**
- **E2E-through-UI:** `npm run test:e2e` — **3/3 pass** (AC-01, AC-13 offline same-session, AC-18)
- **Ran the feature:**
  - AC-01: e2e — `Buy milk` → task visible, quick-add stays focused
  - AC-06: component — `+First step` without long-term → blocked with `!` hint
  - AC-09: component — rolled-over task → move to today appears on today's list
  - AC-13: e2e — offline context → dashboard loads, tasks readable and writable
  - Dev server loads dashboard, nav, and quick-add at `http://127.0.0.1:5173`
- **Deferred:** cold-start offline after PWA install (full AC-13 prod SW path); production `npm run build` SW generation on Node 18 (use Node 20+)

## Operational notes

- Migration: IndexedDB v1 schema applied client-side on first open — no server deploy step
- Feature flag / config: none
- Rollback: revert merge; user data persists in IndexedDB until browser clears storage
