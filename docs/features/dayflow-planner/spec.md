---
status: Shipped
owner: "Aleksandr"
reviewers: ["Tech Lead"]
updated_at: "2026-06-13"
feature_size: "S"
---

# Spec — dayflow-planner

> **Glossary:** [CONTEXT](./CONTEXT.md)
> **Reference module / docs / channels used:** User Tech Spec (chat, 2026-06-13); README.md

## 1. Context

DayFlow addresses a gap for solo planners who want a fast, phone-native daily capture loop without accounts, sync infrastructure, or scheduling bloat. The target segment is an individual installing a planner on their own phone — someone who opens the app several times a day to jot tasks, check off dailies, and glance at long-term goal progress. Existing tools tend to optimize for one pillar only: daily lists with rollover but no goal steps, or goal trackers without a frictionless today view, or offline installable apps without a unified prefix capture model.

The trigger is a greenfield build: the repository today is an idea plus README. The product must ship as a self-contained, installable experience that works fully offline, because the explicit constraint is no backend and manual device migration via backup files. Competing products reset dailies at midnight, lack long-term step progress, or bundle AI scheduling — leaving room for a minimalist integrated loop.

The committed approach is a capture-first offline planner that unifies three pillars in one installable app: today's daily tasks with uncapped rollover, persistent long-term tasks with step progress, and prefix quick-add (plain text → daily, `!` → long-term, `+` → step on the latest long-term task). Calendar day follows the device's local timezone and advances at local midnight. The long-term section is a separate tab or screen from the dashboard. Manual backup export/import with explicit replace-or-merge confirmation is the v1 migration path instead of cloud sync. This follows the competitive gap — no verified adjacent product combines all three pillars with prefix capture in a minimalist installable offline app — while accepting the trade-off that data safety depends on planner habit and explicit import choices.

**Traceability:** User Tech Spec (chat) defines prefix semantics, rollover block, export/import, and phased delivery. Ideation confirmed the wedge (integrated daily + long-term + rollover + prefix) and flagged import/data-loss as the sharpest production risk.

## 2. Goals

- Enable the planner to capture any task type in one keystroke flow and keep today's work — including rolled-over incomplete dailies — visible without sign-in or network access.
- Let the planner track long-term objectives through step-level progress that persists across sessions on the same device.
- Provide a reliable manual migration path between devices via backup export and confirmed replace-or-merge import.

## 3. Non-goals

- **Cloud accounts and automatic sync** — v1 is offline-only on device; cross-device continuity is manual backup/restore, not live sync.
- **Push notifications and timed reminders** — out of scope for the minimalist capture focus; planners use other tools for time-based alerts.
- **Drag-and-drop reordering** — deferred to a later phase; v1 lists tasks in creation order (oldest first).
- **Multi-user or shared planning** — no household/team roles, shared lists, or permission models in v1.

## 4. User stories

### US-01: Capture a daily task quickly

**As a** Planner
**I want** to type plain text in the quick-add field and press Enter
**So that** a daily task for today appears immediately without extra taps

### US-02: Capture a long-term task via prefix

**As a** Planner
**I want** to prefix my entry with `!` in the quick-add field
**So that** a new long-term task is created instead of a daily task

### US-03: Add a step to the latest long-term task

**As a** Planner
**I want** to prefix my entry with `+` in the quick-add field
**So that** a step is appended to my most recently created long-term task

### US-04: Complete and manage today's daily tasks

**As a** Planner
**I want** to check off, edit, or delete today's daily tasks from the dashboard
**So that** I can keep today's list accurate as my day progresses

### US-05: Review and complete long-term steps

**As a** Planner
**I want** to open the long-term section, see each goal's progress, check off individual steps, and edit or delete goals and steps when needed
**So that** I can keep long-term objectives accurate as they evolve over weeks or months

### US-06: Handle incomplete work from prior days

**As a** Planner
**I want** to see rolled-over incomplete daily tasks and move them to today
**So that** yesterday's unfinished work is not silently lost or hidden

### US-07: Back up planner data

**As a** Planner
**I want** to export all my tasks and steps to a backup file
**So that** I can recover or migrate my data when changing devices

### US-08: Restore planner data safely

**As a** Planner
**I want** to import a backup file with a clear replace-or-merge choice
**So that** I can restore data without accidental loss of current work

### US-09: Install DayFlow on my phone

**As a** Planner
**I want** to install DayFlow to my home screen and use it offline
**So that** it feels like a native app I can open anywhere without connectivity

## 5. Acceptance criteria

### AC-01 (US-01) — happy path

**Given** the Planner is on the dashboard with the quick-add field focused
**When** the Planner enters `Buy milk` (no prefix) and confirms entry
**Then** the system adds a daily task for today's date to the today's list and keeps focus in the quick-add field

### AC-02 (US-02) — happy path

**Given** the Planner is on the dashboard
**When** the Planner enters `!Launch side project` and confirms entry
**Then** the system creates a new long-term task titled `Launch side project` with zero completed steps and shows it in the long-term section

### AC-03 (US-03) — happy path

**Given** the Planner has at least one long-term task and the latest long-term task (most recent creation timestamp) is `Launch side project`
**When** the Planner enters `+Register domain` and confirms entry
**Then** the system adds an incomplete step `Register domain` to `Launch side project` and updates its progress count

### AC-04 (US-04) — happy path

**Given** the Planner has a daily task `Buy milk` on today's list
**When** the Planner marks it complete
**Then** the system records the task as completed, keeps the task visible on today's list in the completed state, and reflects that state in the list

### AC-04b (US-04) — happy path

**Given** the Planner has a daily task `Buy milk` on today's list
**When** the Planner edits the title to `Buy oat milk` and saves
**Then** the system updates the task title and shows `Buy oat milk` on today's list

### AC-04c (US-04) — happy path

**Given** the Planner has a daily task `Buy milk` on today's list
**When** the Planner deletes the task and confirms deletion
**Then** the system removes the task from today's list

### AC-05 (US-01) — error path

**Given** the Planner is on the dashboard
**When** the Planner confirms an empty quick-add entry
**Then** the system blocks creation and tells the Planner that a task title is required

### AC-06 (US-03) — error path

**Given** the Planner has no long-term tasks yet
**When** the Planner enters `+First step` and confirms entry
**Then** the system blocks the step and tells the Planner to create a long-term task first using the `!` prefix

### AC-07 (US-08) — error path

**Given** the Planner has existing tasks on the device and selects a backup file to import
**When** the Planner has not yet chosen replace or merge and confirmed the action
**Then** the system blocks the import and explains that the Planner must explicitly choose replace or merge before data changes apply

### AC-07b (US-04) — authorization

**Given** the Planner requests deletion of a daily task
**When** the Planner has not confirmed the deletion
**Then** the system withholds removal until the Planner explicitly confirms

### AC-08 (US-03) — domain invariant

**Given** long-term task `Launch side project` already has a step titled `Register domain`
**When** the Planner enters `+Register domain` and confirms entry
**Then** the system blocks the duplicate step and tells the Planner that step titles must be unique within a long-term task

### AC-09 (US-06) — cross-context

**Given** an incomplete daily task `Call dentist` dated yesterday appears in the rolled-over block
**When** the Planner chooses move to today
**Then** the system removes the task from the rolled-over block, sets its active date to today, and shows it in today's daily list

### AC-09c (US-06) — happy path

**Given** an incomplete daily task `Call dentist` appears in the rolled-over block
**When** the Planner marks it complete from the rolled-over block
**Then** the system records the task as completed and removes it from the rolled-over block

### AC-09d (US-06) — happy path

**Given** an incomplete daily task `Call dentist` appears in the rolled-over block
**When** the Planner edits the title to `Call dentist — reschedule` and saves
**Then** the system updates the task title and shows the new title in the rolled-over block

### AC-09e (US-06) — authorization

**Given** the Planner requests deletion of a rolled-over daily task
**When** the Planner has not confirmed the deletion
**Then** the system withholds removal until the Planner explicitly confirms

### AC-09g (US-06) — happy path

**Given** an incomplete daily task `Call dentist` appears in the rolled-over block
**When** the Planner deletes the task and confirms deletion
**Then** the system removes the task from the rolled-over block

### AC-09f (US-06) — cross-context

**Given** the Planner has incomplete daily tasks dated yesterday and opens the dashboard on a new calendar day
**When** the dashboard loads
**Then** the system moves all incomplete prior-day daily tasks into the rolled-over block without requiring planner action

### AC-09b (US-06) — happy path

**Given** the Planner has incomplete daily tasks on each of the prior three calendar days
**When** the Planner opens the dashboard on a new day
**Then** the system shows all incomplete prior-day daily tasks together in the rolled-over block without dropping older items

### AC-10 (US-07) — happy path

**Given** the Planner has daily tasks, long-term tasks, and steps stored on the device
**When** the Planner requests a backup export
**Then** the system produces a downloadable versioned JSON backup file with a DayFlow backup version marker and all daily tasks, long-term tasks, and steps

### AC-11 (US-08) — happy path

**Given** the Planner has chosen merge and confirmed import of a valid backup file
**When** the import completes
**Then** the system combines backup contents with existing data and confirms success to the Planner

### AC-11b (US-08) — happy path

**Given** the Planner has chosen replace and confirmed import of a valid backup file
**When** the import completes
**Then** the system replaces all on-device tasks with the backup contents and confirms success to the Planner

### AC-12 (US-05) — happy path

**Given** long-term task `Launch side project` has two steps, one completed
**When** the Planner opens the long-term section
**Then** the system shows progress as one of two steps completed and allows expanding the step checklist

### AC-12b (US-05) — happy path

**Given** long-term task `Launch side project` has an incomplete step `Register domain`
**When** the Planner marks `Register domain` complete in the long-term section
**Then** the system records the step as completed and updates the goal's progress count

### AC-12c (US-05) — happy path

**Given** long-term task `Launch side project` exists in the long-term section
**When** the Planner edits the title to `Launch SaaS side project` and saves
**Then** the system updates the long-term task title and shows the new title in the long-term section

### AC-12d (US-05) — authorization

**Given** the Planner requests deletion of a long-term task
**When** the Planner has not confirmed the deletion
**Then** the system withholds removal until the Planner explicitly confirms

### AC-12e (US-05) — happy path

**Given** long-term task `Launch side project` has step `Register domain`
**When** the Planner edits the step title to `Register .com domain` and saves
**Then** the system updates the step title and shows the new title under the long-term task

### AC-12f (US-05) — authorization

**Given** the Planner requests deletion of a step on a long-term task
**When** the Planner has not confirmed the deletion
**Then** the system withholds removal until the Planner explicitly confirms

### AC-12g (US-05) — happy path

**Given** long-term task `Launch side project` exists in the long-term section
**When** the Planner deletes the long-term task and confirms deletion
**Then** the system removes the long-term task and all its steps from the long-term section

### AC-12h (US-05) — happy path

**Given** long-term task `Launch side project` has step `Register domain`
**When** the Planner deletes the step and confirms deletion
**Then** the system removes the step and updates the goal's progress count

### AC-13 (US-09) — happy path

**Given** the Planner opens DayFlow in a supported mobile browser while online
**When** the Planner installs the app to the home screen and later opens it without network connectivity
**Then** the system loads the dashboard and allows reading and writing tasks offline

### AC-14 (US-04) — error path

**Given** the Planner is editing a daily task
**When** the Planner saves with a blank title
**Then** the system blocks the save and tells the Planner that a task title is required

### AC-15 (US-08) — error path

**Given** the Planner selects a backup file that is unreadable or not a valid DayFlow backup
**When** the Planner attempts import
**Then** the system blocks the import, makes no data changes, and tells the Planner the backup file is invalid

### AC-16 (US-01) — domain invariant

**Given** the Planner is on the dashboard with the quick-add field focused
**When** the Planner enters an entry whose first character is `!` or `+` immediately followed by non-empty title text (with optional whitespace after the prefix stripped before saving)
**Then** the system applies the matching prefix rule; entries that do not start with a recognized prefix create a daily task

### AC-17 (US-04) — domain invariant

**Given** the Planner views today's daily list, the rolled-over block, or the long-term section
**When** the list renders
**Then** the system orders items by creation time with the oldest item first

### AC-18 (US-05) — happy path

**Given** the Planner is on the dashboard
**When** the Planner opens the long-term section
**Then** the system navigates to the separate long-term tab or screen and shows all long-term tasks with their progress

### AC-19 (US-07) — error path

**Given** the Planner selects a file that is not versioned JSON or is missing the DayFlow backup version marker or required task collections
**When** the Planner attempts import
**Then** the system blocks the import, makes no data changes, and tells the Planner the backup file is invalid

### AC-20 (US-01) — domain invariant

**Given** the Planner already has a daily task titled `Buy milk` on today's list
**When** the Planner enters `Buy milk` again with no prefix and confirms entry
**Then** the system adds a second daily task with the same title on today's list

## Test plan

> **Size:** S — inline plan (no separate `test-plan.md`).
> **Surfaces:** `web-frontend` (from `sad.md`) — adds component, visual-regression, e2e-through-UI tiers.
> **Levels used:** unit · integration · contract · component · e2e-through-UI · load.

### Levels

| Level | Scope | Strategy |
|---|---|---|
| Unit | Prefix parsing, validators, ordering, rollover day logic, backup schema validation, merge dedup by record id. | In-memory; no I/O. |
| Integration | Repository + use-cases against real IndexedDB (not a mocked store API). | Fresh IndexedDB database per suite (`dayflow-test-{runId}`), seeded via factories, deleted on teardown. |
| Contract | Backup JSON export shape consumed by import parser. | Round-trip: export artifact validates against agreed v1 schema; import rejects drift. |
| Component | Quick-add, daily list, rolled-over block, long-term progress, delete-confirm dialogs. | Render in isolation with stubbed store; assert output + interactions. |
| Visual-regression | Dashboard and long-term section default states (empty, populated, rolled-over visible). | Snapshot rendered UI; fail on unintended diff. |
| E2E-through-UI | Critical user-story flows through the real UI + service worker shell. | Browser harness against ephemeral IndexedDB; reset DB per scenario. |
| Load | Numeric latency NFRs only (§6). | The load tool already in the repo, or e.g. k6 or Locust, driving scripted quick-add and dashboard-open timings. |

### AC coverage

| AC | Test name (intent-based) | Level | Expected outcome |
|---|---|---|---|
| AC-01 | plain-text quick-add creates daily on today list | unit + component + e2e-through-UI | Daily task for today appears on today's list; quick-add keeps focus |
| AC-02 | exclamation prefix creates long-term task | unit + e2e-through-UI | Long-term task with zero completed steps appears in long-term section |
| AC-03 | plus prefix appends step to latest long-term | unit + integration + e2e-through-UI | Step added to most recently created long-term task; progress count updates |
| AC-04 | complete daily keeps task visible as completed | integration + component + e2e-through-UI | Task marked completed; remains on today's list in completed state |
| AC-04b | edit daily title updates today's list | integration + e2e-through-UI | Title changes to new value; list shows updated title |
| AC-04c | delete daily removes from today after confirm | integration + e2e-through-UI | Task absent from today's list after confirmed deletion |
| AC-05 | empty quick-add blocked with required-title message | unit + component | No task created; planner told a task title is required |
| AC-06 | plus prefix without long-term task blocked | unit + component | No step created; planner told to create a long-term task with `!` first |
| AC-07 | import blocked until replace-or-merge chosen | component + e2e-through-UI | No data changes; planner told to choose replace or merge explicitly |
| AC-07b | daily delete withheld until confirmed | component + e2e-through-UI | Task remains until planner confirms deletion |
| AC-08 | duplicate step title within goal blocked | unit + integration | No duplicate step created; planner told step titles must be unique within the goal |
| AC-09 | move rolled-over task to today | integration + e2e-through-UI | Task leaves rolled-over block, `activeDate` is today, appears on today's list |
| AC-09b | multi-day incomplete dailies all appear in rollover block | unit + integration + e2e-through-UI | All incomplete tasks from prior calendar days shown together; none dropped |
| AC-09c | complete rolled-over task removes from block | integration + e2e-through-UI | Task marked completed; absent from rolled-over block |
| AC-09d | edit rolled-over task title in block | integration + e2e-through-UI | Title updated; rolled-over block shows new title |
| AC-09e | rolled-over delete withheld until confirmed | component + e2e-through-UI | Task remains in block until planner confirms deletion |
| AC-09f | new calendar day auto-rolls incomplete priors | unit + integration + e2e-through-UI | On dashboard load after midnight, incomplete prior-day tasks move to rolled-over block without planner action |
| AC-09g | delete rolled-over task after confirm | integration + e2e-through-UI | Task removed from rolled-over block after confirmed deletion |
| AC-10 | export produces versioned complete backup JSON | integration + contract | Downloadable file with `dayflowBackupVersion` marker and all daily tasks, long-term tasks, and steps |
| AC-11 | merge import combines data and confirms success | integration + e2e-through-UI | Backup merged with on-device data; planner sees success confirmation |
| AC-11b | replace import overwrites device data | integration + e2e-through-UI | On-device tasks replaced by backup contents; planner sees success confirmation |
| AC-12 | long-term section shows progress and expandable checklist | component + e2e-through-UI | Progress shown as completed-of-total; step checklist expandable |
| AC-12b | complete step updates goal progress | integration + e2e-through-UI | Step marked completed; goal progress count increments |
| AC-12c | edit long-term task title | integration + e2e-through-UI | Goal title updated in long-term section |
| AC-12d | long-term delete withheld until confirmed | component + e2e-through-UI | Goal remains until planner confirms deletion |
| AC-12e | edit step title under goal | integration + e2e-through-UI | Step title updated under parent goal |
| AC-12f | step delete withheld until confirmed | component + e2e-through-UI | Step remains until planner confirms deletion |
| AC-12g | delete long-term task cascades steps | integration + e2e-through-UI | Goal and all child steps removed from long-term section |
| AC-12h | delete step updates progress count | integration + e2e-through-UI | Step removed; goal progress count decrements |
| AC-13 | installed PWA loads and read/writes offline | e2e-through-UI | After install, app opens without network; dashboard loads; tasks can be added and read |
| AC-14 | blank daily edit save blocked | unit + component | Save rejected; planner told a task title is required |
| AC-15 | unreadable backup blocked with no data change | unit + integration + e2e-through-UI | Import blocked; local data unchanged; invalid-backup message shown |
| AC-16 | prefix rules with optional whitespace after prefix | unit | `!` / `+` with stripped whitespace apply prefix rules; unrecognized prefixes create daily tasks |
| AC-17 | lists order oldest-first by creation time | unit + integration | Today's list, rolled-over block, and long-term section render oldest item first |
| AC-18 | navigate to long-term section shows all goals | component + e2e-through-UI | Separate long-term screen opens; all long-term tasks with progress visible |
| AC-19 | backup missing version marker or collections blocked | unit + integration | Import blocked; no data changes; invalid-backup message shown |
| AC-20 | duplicate daily titles allowed on same day | unit + integration | Second task with same title added to today's list |

### Edge cases / error paths

Dedicated rows above cover every error and authorization AC (AC-05, AC-06, AC-07, AC-07b, AC-08, AC-09e, AC-12d, AC-12f, AC-14, AC-15, AC-19). Additional implied boundaries:

- **Merge import with duplicate record ids** → existing on-device records kept; backup duplicates skipped; summary reports added vs skipped (ADR-0003, §6.1 abuse case).
- **Replace import with empty backup** → all on-device tasks cleared; empty state shown.
- **Quick-add with only whitespace after prefix** → treated as empty title; blocked with required-title message (extends AC-05 / AC-16).
- **IndexedDB unavailable on first open** → plain-language error; no silent data loss (mitigation for storage eviction).
- **Service worker not yet active on first offline open** → shell still loads cached assets; read/write works once app bundle is cached (AC-13 boundary).

### Test data

- **Seed strategy:** factories from `data-model.md` — `buildDailyTask`, `buildLongTermTask`, `buildStep`, `buildBackupFile` with neutral titles (`Test task`, `Example goal`); fixed UUIDs only when testing merge dedup.
- **Integration dependency:** real IndexedDB API in test environment — fresh database per suite, not a mocked store layer.
- **Cleanup boundary:** per-suite — delete test database after each integration / e2e-through-UI suite; per-test reset for scenarios that mutate shared rollover state.
- **Time control:** injectable clock / `lastSeenCalendarDay` for rollover tests (AC-09f, AC-09b) — no reliance on real midnight in CI.

### NFR validation

| NFR (§6) | Level | Scenario |
|---|---|---|
| Quick-add p95 ≤ 500 ms | load | 50 sequential quick-add operations after warm start; assert p95 ≤ 500 ms |
| Dashboard warm load p95 ≤ 1000 ms (offline) | load | 20 offline reloads with seeded data; assert p95 ≤ 1000 ms |
| Offline read/write 100% of core flows | e2e-through-UI | Checklist: add daily, complete, rollover move, long-term view, export — all succeed with network disabled |
| Data persistence 100% after restart | integration | Create task → tear down app context → reopen → task present |
| Backup export completeness 100% | integration | Seed known counts → export → parse JSON → counts match for all three collections |

### CI placement

- **Every PR:** unit, contract, component (fast suites).
- **Pre-merge or nightly:** integration, e2e-through-UI, visual-regression (heavier; IndexedDB + browser boot).
- **Pre-release / schedule:** load scenarios (latency NFRs).

## 6. Non-functional requirements

| Aspect | Target | Measurement |
|---|---|---|
| Latency p95 quick-add to visible in list | ≤ 500 ms | manual timing on mid-tier phone |
| Latency p95 dashboard load (offline, warm start) | ≤ 1000 ms | manual timing on mid-tier phone |
| Offline read/write availability | 100% of core flows | checklist: add, complete, rollover, long-term view, export |
| Data persistence after app restart | 100% | automated test: create task, reload, assert presence |
| Backup export completeness | 100% of tasks and steps | automated test: export then compare counts |

## 6.1 Security / privacy

- **Data classification:** confidential — personal planning data stored only on the planner's device.
- **Personal data touched:** task and goal titles (user-generated text); sensitivity low individually, private in aggregate.
- **AuthZ/AuthN impact:** single-planner device scope; no roles or tenants. Destructive import requires explicit replace/merge confirmation before any data changes.
- **Abuse cases:**
  - **Corrupt backup import:** block import, leave local data unchanged, show plain-language invalid-backup message.
  - **Accidental full replace:** require explicit replace confirmation; default screen explains data will be overwritten.
  - **Repeat import duplicates (merge):** merge path must recognize matching tasks and steps already on device; planner sees a summary of added vs skipped items.
  - **Device storage wipe:** no server recovery; product copy and onboarding stress export habit (see §8).
  - **Storage eviction on mobile browsers:** treat unexpected empty state as incident; planner should export before major OS updates (mitigation in design).
- **Security review:** N/A — no auth boundary, no server, no regulated data fields; local-only personal text.

## 7. Metrics / KPIs

- **Median quick-add time** — baseline: 0 (new product), target: ≤ 3 seconds from focus to confirmed entry within 30 days of v1 launch.
- **Week-1 retention after install** — baseline: 0, target: ≥ 40% of installers still open the app on day 7 within 60 days of launch.
- **Import success without data complaint** — baseline: 0, target: ≥ 95% of confirmed imports complete without support/contact about missing or duplicated data within 90 days of launch.
- **Daily open rate among active planners** — baseline: 0, target: ≥ 1.5 opens per active day within 60 days of launch.

## 8. Open questions

- [ ] Should merge import recognize duplicates by exact identity only, or also by title and date when entries differ? Default now: recognize duplicates by exact identity only. — owner: Tech Lead, due: before sdd:design
- [ ] What onboarding copy nudges first export within 7 days without nagging? Default now: one-time post-install hint on dashboard. — owner: PM, due: before ship *(deferred at review 2026-06-13)*
- [ ] Is swipe-to-delete required in v1 or is button-only edit/delete sufficient? Default now: button-only acceptable for S scope. — owner: PM, due: before sdd:tasks
- [ ] How should the app behave if local storage is unexpectedly cleared by the browser/OS? Default now: show empty state with recovery guidance pointing to backup import. — owner: Tech Lead, due: before sdd:design
- [ ] Empty-state recovery banner test coverage (component or e2e-through-UI asserting copy + `/settings` link when store is empty). — owner: Tech Lead, due: with e2e suite *(deferred at review 2026-06-13)*
