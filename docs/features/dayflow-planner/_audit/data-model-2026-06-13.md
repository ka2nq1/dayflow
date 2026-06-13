# Data model audit — dayflow-planner (2026-06-13)

## Staged migrations

| File | Purpose |
|---|---|
| `migrations/01_create_planner_schema.up.ts` | Create v1 object stores + indexes |
| `migrations/01_create_planner_schema.down.ts` | Delete `dayflow` IndexedDB database |

**Status:** Staged under `docs/features/dayflow-planner/migrations/` — **not** in live source tree.
`implement` promotes to `src/shared/storage/migrations/` and wires `onupgradeneeded`.

## Promote-time convention hint

Greenfield repo — no existing migration tool. Recommended promote path:

- Database name: `dayflow`
- Version: integer `1`, bump on future schema changes
- Wrapper: `idb` or Dexie (per SAD §2 / ADR-0002)
- File naming at promote: keep ordinal `01_` prefix; assign timestamp/sequence if repo adopts one later

## Convention deviations

| Topic | Choice | Rationale |
|---|---|---|
| Migration format | TypeScript (`.up.ts`/`.down.ts`) not SQL | ADR-0002 — IndexedDB client-side store, no SQL server |
| PK | UUID v4 string | SAD §2, ADR-0003 merge dedup |
| Delete | Hard delete | Spec AC-04c, AC-12g remove records |
| Audit columns | `createdAt` only | AC-17 ordering; no `updatedAt` required by spec |
| FK enforcement | App layer only | IndexedDB has no declarative FK; cascade delete in service layer |
| Step title uniqueness | App layer (AC-08) | Index supports lookup; not a unique constraint |

## Drift detection

N/A — greenfield, no existing domain layer or live schema to compare.

## Self-check

| Check | Result |
|---|---|
| Naming matches convention | ✅ snake_case stores, camelCase record fields (TypeScript/JSON) |
| Down reversibility | ✅ `deleteDatabase` reverses full v1 create |
| FK indexes | ✅ `steps.longTermTaskId` indexed via compound indexes |
| Convention adherence | ✅ Follows SAD + ADRs; TypeScript migrations documented for IndexedDB |

## Next stage

`/sdd:tasks dayflow-planner` — no HTTP/API contract (web-frontend only, no backend). Skip `/sdd:api`.
