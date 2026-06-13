import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import {
  exportBackup,
  parseBackupFile,
  validateBackup,
  importReplace,
  importMerge,
  ImportBlockedError,
} from '@/features/backup/backup';
import {
  saveDailyTask,
  getAllDailyTasks,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  saveLongTermTask,
  getAllLongTermTasks,
} from '@/shared/storage/repositories/long-term-task-repository';
import {
  saveStep,
  getAllSteps,
} from '@/shared/storage/repositories/step-repository';
import { buildBackupFile, buildDailyTask, buildLongTermTask, buildStep } from '@/test/fixtures';

describe('backup service', () => {
  let db: IDBDatabase;

  beforeEach(async () => {
    await downgrade().catch(() => undefined);
    db = await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase(db);
    await downgrade().catch(() => undefined);
  });

  it('exports versioned JSON with all records (AC-10)', async () => {
    const daily = buildDailyTask({ title: 'Test task' });
    const goal = buildLongTermTask({ title: 'Example goal' });
    const step = buildStep({ longTermTaskId: goal.id, title: 'Example step' });
    await saveDailyTask(db, daily);
    await saveLongTermTask(db, goal);
    await saveStep(db, step);

    const backup = await exportBackup(db);

    expect(backup.dayflowBackupVersion).toBe(1);
    expect(backup.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(backup.dailyTasks).toHaveLength(1);
    expect(backup.longTermTasks).toHaveLength(1);
    expect(backup.steps).toHaveLength(1);
    expect(backup.dailyTasks[0]?.id).toBe(daily.id);
    expect(backup.longTermTasks[0]?.id).toBe(goal.id);
    expect(backup.steps[0]?.id).toBe(step.id);
  });

  it('merges backup records by id and skips duplicates (AC-11)', async () => {
    const existing = buildDailyTask({ id: 'daily-existing', title: 'On device' });
    await saveDailyTask(db, existing);

    const incoming = buildBackupFile({
      dailyTasks: [
        existing,
        buildDailyTask({ id: 'daily-new', title: 'From backup' }),
      ],
    });

    const summary = await importMerge(db, incoming, { mode: 'merge', confirmed: true });

    expect(summary).toEqual({ added: 1, skipped: 1 });
    expect((await getAllDailyTasks(db)).map((t) => t.id).sort()).toEqual([
      'daily-existing',
      'daily-new',
    ]);
  });

  it('replaces all on-device data after confirmed replace (AC-11b)', async () => {
    await saveDailyTask(db, buildDailyTask({ id: 'old-daily', title: 'Old' }));

    const backup = buildBackupFile({
      dailyTasks: [buildDailyTask({ id: 'new-daily', title: 'New' })],
      longTermTasks: [buildLongTermTask({ id: 'new-goal', title: 'Goal' })],
      steps: [],
    });

    await importReplace(db, backup, { mode: 'replace', confirmed: true });

    const dailies = await getAllDailyTasks(db);
    expect(dailies).toHaveLength(1);
    expect(dailies[0]?.id).toBe('new-daily');
    expect((await getAllLongTermTasks(db)).map((t) => t.id)).toEqual(['new-goal']);
    expect(await getAllSteps(db)).toEqual([]);
  });

  it('blocks import without mode or confirm (AC-07)', async () => {
    const backup = buildBackupFile({
      dailyTasks: [buildDailyTask({ id: 'blocked-daily' })],
    });
    await saveDailyTask(db, buildDailyTask({ id: 'keep-me' }));

    await expect(
      importReplace(db, backup, { mode: null, confirmed: true }),
    ).rejects.toThrow(ImportBlockedError);
    await expect(
      importMerge(db, backup, { mode: 'merge', confirmed: false }),
    ).rejects.toThrow(ImportBlockedError);

    expect((await getAllDailyTasks(db)).map((t) => t.id)).toEqual(['keep-me']);
  });

  it('blocks invalid backup with no data changes (AC-15, AC-19)', async () => {
    await saveDailyTask(db, buildDailyTask({ id: 'keep-me', title: 'Keep' }));

    expect(parseBackupFile('not json')).toBeNull();
    expect(parseBackupFile('{}')).toBeNull();
    expect(parseBackupFile(JSON.stringify({ dayflowBackupVersion: 2 }))).toBeNull();
    expect(
      validateBackup({ dayflowBackupVersion: 1, exportedAt: 'x', dailyTasks: [] }),
    ).toBe(false);

    const invalid = { dayflowBackupVersion: 1, exportedAt: 'x' };
    await expect(
      importReplace(db, invalid as never, { mode: 'replace', confirmed: true }),
    ).rejects.toThrow();
    await expect(
      importMerge(db, invalid as never, { mode: 'merge', confirmed: true }),
    ).rejects.toThrow();

    expect((await getAllDailyTasks(db)).map((t) => t.id)).toEqual(['keep-me']);
  });

  it('merges by id within each store only (ADR-0003)', async () => {
    const sharedId = 'shared-id-across-stores';
    await saveDailyTask(db, buildDailyTask({ id: sharedId, title: 'On device daily' }));

    const goal = buildLongTermTask({ id: 'goal-1', title: 'Goal' });
    const incoming = buildBackupFile({
      dailyTasks: [buildDailyTask({ id: sharedId, title: 'Backup daily duplicate' })],
      longTermTasks: [goal],
      steps: [buildStep({ id: sharedId, longTermTaskId: goal.id, title: 'Backup step' })],
    });

    const summary = await importMerge(db, incoming, { mode: 'merge', confirmed: true });

    expect(summary).toEqual({ added: 2, skipped: 1 });
    expect((await getAllDailyTasks(db)).map((t) => t.title)).toEqual(['On device daily']);
    expect((await getAllLongTermTasks(db)).map((t) => t.id)).toEqual(['goal-1']);
    expect((await getAllSteps(db)).map((s) => s.id)).toEqual([sharedId]);
  });

  it('parses valid backup files', () => {
    const backup = buildBackupFile({
      dailyTasks: [buildDailyTask()],
    });
    const parsed = parseBackupFile(JSON.stringify(backup));
    expect(parsed).toEqual(backup);
  });
});
