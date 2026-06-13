# Tracker — dayflow-planner

> Status of every task in the epic. `implement` updates `done` as it commits each task.
> States: `todo` · `in_progress` · `blocked` · `review` · `done`.

| # | Task | Layer | Owner | Estimate | Blocked by | Status |
|---|---|---|---|---|---|---|
| T1 | Scaffold Vite React PWA + FSD skeleton | wiring | Aleksandr | M | — | done |
| T2 | Promote IndexedDB v1 schema migration | migration | Aleksandr | S | T1 | done |
| T3 | Define planner domain types and validation | domain | Aleksandr | S | T1 | done |
| T4 | Implement IndexedDB repositories | infra | Aleksandr | M | T2, T3 | done |
| T5 | Build shared UI primitives | ui | Aleksandr | M | T1 | done |
| T6 | Implement quick-add feature | app | Aleksandr | M | T4 | done |
| T7 | Implement task-crud feature | app | Aleksandr | M | T4 | done |
| T8 | Implement rollover feature | app | Aleksandr | M | T4, T7 | done |
| T9 | Implement backup export/import service | app | Aleksandr | M | T4 | done |
| T10 | Build dashboard page | ui | Aleksandr | M | T5, T6, T7, T8 | done |
| T11 | Build long-term page | ui | Aleksandr | M | T5, T6, T7 | done |
| T12 | Build backup settings UI | ui | Aleksandr | S | T5, T9 | done |
| T13 | Wire PWA offline shell | wiring | Aleksandr | S | T1, T10 | done |
| T14 | Compose app routing and empty-state recovery | wiring | Aleksandr | S | T10–T13 | done |
| T15 | Add core integration tests | tests | Aleksandr | M | T9, T14 | done |

**Total:** 15 tasks, ~8–10 person-days.
