import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import { submitQuickAdd } from '@/features/quick-add';
import { exportBackup, importMerge, importReplace, parseBackupFile } from '@/features/backup';
import { buildBackupFile, buildDailyTask } from '@/test/fixtures';
import { getAllDailyTasks } from '@/shared/storage/repositories/daily-task-repository';
import { listDailyTasksForDate } from '@/shared/storage/repositories/daily-task-repository';
import { saveDailyTask } from '@/shared/storage/repositories/daily-task-repository';

describe('core integration flows', () => {
  let db: IDBDatabase;

  beforeEach(async () => {
    await downgrade().catch(() => undefined);
    db = await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase(db);
    await downgrade().catch(() => undefined);
  });

  it('persists task after reload simulation (NFR persistence)', async () => {
    await submitQuickAdd(db, 'Buy milk', '2026-06-13');
    await closeDatabase(db);

    const reopened = await openDatabase();
    const tasks = await listDailyTasksForDate(reopened, '2026-06-13');
    expect(tasks.some((t) => t.title === 'Buy milk')).toBe(true);
    await closeDatabase(reopened);
  });

  it('export includes all seeded tasks (NFR backup completeness)', async () => {
    await saveDailyTask(db, buildDailyTask({ title: 'One' }));
    await saveDailyTask(db, buildDailyTask({ title: 'Two' }));
    const backup = await exportBackup(db);
    expect(backup.dailyTasks).toHaveLength(2);
    expect(backup.dayflowBackupVersion).toBe(1);
  });

  it('replace import overwrites on-device data', async () => {
    await saveDailyTask(db, buildDailyTask({ title: 'Local' }));
    const backup = buildBackupFile({
      dailyTasks: [buildDailyTask({ title: 'From backup', activeDate: '2026-06-01' })],
    });
    await importReplace(db, backup, { mode: 'replace', confirmed: true });
    const tasks = await getAllDailyTasks(db);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe('From backup');
  });

  it('merge import skips duplicate ids', async () => {
    const shared = buildDailyTask({ id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', title: 'Shared' });
    await saveDailyTask(db, shared);
    const backup = buildBackupFile({ dailyTasks: [shared] });
    const summary = await importMerge(db, backup, { mode: 'merge', confirmed: true });
    expect(summary.skipped).toBe(1);
    expect(summary.added).toBe(0);
  });

  it('invalid import is no-op', async () => {
    await saveDailyTask(db, buildDailyTask({ title: 'Keep me' }));
    const parsed = parseBackupFile('{ not valid json');
    expect(parsed).toBeNull();
    const before = await getAllDailyTasks(db);
    expect(before).toHaveLength(1);
  });
});
