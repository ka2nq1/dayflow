/**
 * Staged rollback — dayflow-planner v1 schema (IndexedDB).
 * Promote target: src/shared/storage/migrations/01_create_planner_schema.down.ts
 *
 * IndexedDB has no DROP STORE in-place; rollback deletes the entire database.
 * Safe for v1 greenfield — no production data yet.
 */

import { DB_NAME } from './01_create_planner_schema.up';

export function downgrade(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database delete blocked — close open connections'));
  });
}
