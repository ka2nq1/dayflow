import { describe, expect, it, afterEach } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import { DB_NAME } from '@/shared/storage/migrations/01_create_planner_schema.up';

async function resetDatabase(): Promise<void> {
  await downgrade().catch(() => undefined);
}

describe('IndexedDB v1 schema migration', () => {
  afterEach(async () => {
    await resetDatabase();
  });

  it('creates all object stores and indexes on upgrade', async () => {
    await resetDatabase();
    const db = await openDatabase();

    expect(db.objectStoreNames.contains('daily_tasks')).toBe(true);
    expect(db.objectStoreNames.contains('long_term_tasks')).toBe(true);
    expect(db.objectStoreNames.contains('steps')).toBe(true);
    expect(db.objectStoreNames.contains('app_meta')).toBe(true);

    const dailyTx = db.transaction('daily_tasks', 'readonly');
    const dailyStore = dailyTx.objectStore('daily_tasks');
    expect(dailyStore.indexNames.contains('by_activeDate_createdAt')).toBe(true);
    expect(dailyStore.indexNames.contains('by_activeDate')).toBe(true);

    const ltTx = db.transaction('long_term_tasks', 'readonly');
    expect(ltTx.objectStore('long_term_tasks').indexNames.contains('by_createdAt')).toBe(true);

    const stepsTx = db.transaction('steps', 'readonly');
    const stepsStore = stepsTx.objectStore('steps');
    expect(stepsStore.indexNames.contains('by_longTermTaskId_createdAt')).toBe(true);
    expect(stepsStore.indexNames.contains('by_longTermTaskId_title')).toBe(true);

    await closeDatabase(db);
  });

  it('downgrade deletes the database cleanly', async () => {
    await resetDatabase();
    const db = await openDatabase();
    await closeDatabase(db);
    await downgrade();

    const reopened = await openDatabase();
    expect(reopened.name).toBe(DB_NAME);
    expect(reopened.version).toBe(1);
    await closeDatabase(reopened);
  });
});
