---
status: Living
updated_at: "2026-06-13"
---

# Domain Context — dayflow-planner

## Glossary

- Backup file — the planner's full export of all daily tasks, long-term tasks, and steps as a versioned JSON document with a DayFlow backup version marker, used to migrate or recover data on another device. NOT a partial share or automatic sync packet.
- Calendar day — the active date for a daily task, determined by the device's local timezone and advancing at local midnight. NOT UTC or a user-selected timezone in v1.
- Daily task — a single action intended for a specific calendar day and shown on that day's dashboard. NOT a long-term goal or a step within a goal.
- Dashboard — the main screen with quick-add, today's daily tasks, and the rolled-over block. NOT the long-term tasks section or tab.
- Latest long-term task — the long-term task with the most recent creation timestamp; ties break to the lower internal record identifier. NOT the top of the list unless list order follows creation time.
- Long-term task — a multi-step objective tracked over weeks or months; progress is measured by completed steps. NOT a daily task tied to one calendar date.
- Long-term section — a separate tab or screen reachable from the dashboard where the planner views and manages long-term tasks and their steps. NOT part of the dashboard surface defined above.
- Planner — the individual using DayFlow on their own device to capture and track work. NOT a team member, admin, or shared-account role; there is no multi-user access in v1.
- Rolled-over task — an incomplete daily task from a past date, shown in the rolled-over block until moved to today or completed. NOT a duplicate task; moving to today updates the same task's active date.
- Step — a checklist item belonging to exactly one long-term task. NOT a standalone daily task unless captured separately as such.

## Invariants

- A step always belongs to exactly one long-term task.
- A daily task shown on the dashboard always has exactly one active calendar date (see Calendar day in the glossary).
- Incomplete daily tasks from prior calendar days appear in the rolled-over block when the planner opens the dashboard on a new calendar day.
- All planner data resides only on the device until the planner exports a backup file; no server copy exists in v1.

## Out of scope

- Cloud accounts and automatic multi-device sync — v1 relies on manual backup and restore only.
- Push notifications and timed reminders — capture-first scope; planners use other tools for time-based alerts.
- Drag-and-drop task reorder — deferred to a later phase; v1 uses creation order (oldest first).
