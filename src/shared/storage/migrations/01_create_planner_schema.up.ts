/**
 * dayflow-planner v1 schema (IndexedDB).
 * Promoted from docs/features/dayflow-planner/migrations/01_create_planner_schema.up.ts
 */

export const DB_NAME = 'dayflow';
export const DB_VERSION = 1;

export function upgrade(db: IDBDatabase): void {
  const dailyTasks = db.createObjectStore('daily_tasks', { keyPath: 'id' });
  dailyTasks.createIndex('by_activeDate_createdAt', ['activeDate', 'createdAt'], {
    unique: false,
  });
  dailyTasks.createIndex('by_activeDate', 'activeDate', { unique: false });

  const longTermTasks = db.createObjectStore('long_term_tasks', { keyPath: 'id' });
  longTermTasks.createIndex('by_createdAt', 'createdAt', { unique: false });

  const steps = db.createObjectStore('steps', { keyPath: 'id' });
  steps.createIndex('by_longTermTaskId_createdAt', ['longTermTaskId', 'createdAt'], {
    unique: false,
  });
  steps.createIndex('by_longTermTaskId_title', ['longTermTaskId', 'title'], {
    unique: false,
  });

  db.createObjectStore('app_meta', { keyPath: 'key' });
}
