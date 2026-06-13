/**
 * Staged migration — dayflow-planner v1 schema (IndexedDB).
 * Promote target: src/shared/storage/migrations/01_create_planner_schema.up.ts
 *
 * Runs inside IDBDatabase.onupgradeneeded when opening database `dayflow` at version 1.
 */

export const DB_NAME = 'dayflow';
export const DB_VERSION = 1;

export function upgrade(db: IDBDatabase): void {
  // daily_tasks — aggregate root for calendar-day work items
  const dailyTasks = db.createObjectStore('daily_tasks', { keyPath: 'id' });
  dailyTasks.createIndex('by_activeDate_createdAt', ['activeDate', 'createdAt'], {
    unique: false,
  });
  dailyTasks.createIndex('by_activeDate', 'activeDate', { unique: false });

  // long_term_tasks — aggregate root for multi-step goals
  const longTermTasks = db.createObjectStore('long_term_tasks', { keyPath: 'id' });
  longTermTasks.createIndex('by_createdAt', 'createdAt', { unique: false });

  // steps — child of long_term_tasks
  const steps = db.createObjectStore('steps', { keyPath: 'id' });
  steps.createIndex('by_longTermTaskId_createdAt', ['longTermTaskId', 'createdAt'], {
    unique: false,
  });
  steps.createIndex('by_longTermTaskId_title', ['longTermTaskId', 'title'], {
    unique: false,
  });

  // app_meta — singleton keys (lastSeenCalendarDay, schemaVersion)
  db.createObjectStore('app_meta', { keyPath: 'key' });
}
