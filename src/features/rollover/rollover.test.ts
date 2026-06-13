import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import { runDayTransition } from '@/features/rollover/run-day-transition';
import {
  moveToToday,
  completeRolledOverTask,
  editRolledOverTask,
  deleteRolledOverTask,
} from '@/features/rollover/rollover-actions';
import {
  getDailyTask,
  listDailyTasksForDate,
  listRolledOverDailyTasks,
  saveDailyTask,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  getLastSeenCalendarDay,
  setLastSeenCalendarDay,
} from '@/shared/storage/repositories/app-meta-repository';
import { buildDailyTask } from '@/test/fixtures';

describe('rollover', () => {
  let db: IDBDatabase;
  const today = '2026-06-13';

  beforeEach(async () => {
    await downgrade().catch(() => undefined);
    db = await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase(db);
    await downgrade().catch(() => undefined);
  });

  it('shows all incomplete prior-day tasks on new day (AC-09b, AC-09f)', async () => {
    await saveDailyTask(
      db,
      buildDailyTask({ title: 'Day -1', activeDate: '2026-06-12', completed: false }),
    );
    await saveDailyTask(
      db,
      buildDailyTask({ title: 'Day -2', activeDate: '2026-06-11', completed: false }),
    );
    await saveDailyTask(
      db,
      buildDailyTask({ title: 'Day -3', activeDate: '2026-06-10', completed: false }),
    );
    await setLastSeenCalendarDay(db, '2026-06-12');

    const result = await runDayTransition(db, today);

    expect(result.didTransition).toBe(true);
    expect(result.rolledOverTasks.map((t) => t.title).sort()).toEqual(['Day -1', 'Day -2', 'Day -3']);
    expect(await getLastSeenCalendarDay(db)).toBe(today);
  });

  it('does not reprocess rollover on same calendar day reload', async () => {
    await saveDailyTask(
      db,
      buildDailyTask({ title: 'Yesterday', activeDate: '2026-06-12', completed: false }),
    );
    await setLastSeenCalendarDay(db, today);

    const first = await runDayTransition(db, today);
    const second = await runDayTransition(db, today);

    expect(first.didTransition).toBe(false);
    expect(second.didTransition).toBe(false);
    expect(await getLastSeenCalendarDay(db)).toBe(today);
  });

  it('moves rolled-over task to today (AC-09)', async () => {
    const task = buildDailyTask({
      title: 'Call dentist',
      activeDate: '2026-06-12',
      completed: false,
    });
    await saveDailyTask(db, task);

    await moveToToday(db, task.id, today);

    expect((await listRolledOverDailyTasks(db, today)).some((t) => t.id === task.id)).toBe(false);
    expect((await listDailyTasksForDate(db, today)).some((t) => t.id === task.id)).toBe(true);
    expect((await getDailyTask(db, task.id))?.activeDate).toBe(today);
  });

  it('completes rolled-over task and removes from block (AC-09c)', async () => {
    const task = buildDailyTask({
      title: 'Call dentist',
      activeDate: '2026-06-12',
      completed: false,
    });
    await saveDailyTask(db, task);

    await completeRolledOverTask(db, task.id);

    expect((await listRolledOverDailyTasks(db, today))).toHaveLength(0);
    expect((await getDailyTask(db, task.id))?.completed).toBe(true);
  });

  it('edits rolled-over task title (AC-09d)', async () => {
    const task = buildDailyTask({
      title: 'Call dentist',
      activeDate: '2026-06-12',
      completed: false,
    });
    await saveDailyTask(db, task);

    await editRolledOverTask(db, task.id, 'Call dentist — reschedule');

    expect((await listRolledOverDailyTasks(db, today))[0]?.title).toBe('Call dentist — reschedule');
  });

  it('withholds rolled-over delete until confirmed (AC-09e)', async () => {
    const task = buildDailyTask({
      title: 'Call dentist',
      activeDate: '2026-06-12',
      completed: false,
    });
    await saveDailyTask(db, task);
    const confirm = vi.fn().mockResolvedValue(false);

    const deleted = await deleteRolledOverTask(db, task.id, confirm);

    expect(deleted).toBe(false);
    expect((await listRolledOverDailyTasks(db, today))).toHaveLength(1);
  });

  it('deletes rolled-over task after confirm (AC-09g)', async () => {
    const task = buildDailyTask({
      title: 'Call dentist',
      activeDate: '2026-06-12',
      completed: false,
    });
    await saveDailyTask(db, task);
    const confirm = vi.fn().mockResolvedValue(true);

    const deleted = await deleteRolledOverTask(db, task.id, confirm);

    expect(deleted).toBe(true);
    expect((await listRolledOverDailyTasks(db, today))).toHaveLength(0);
  });
});
