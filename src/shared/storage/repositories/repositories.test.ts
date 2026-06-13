import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import {
  listDailyTasksForDate,
  listRolledOverDailyTasks,
  saveDailyTask,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  getLatestLongTermTask,
  listLongTermTasks,
  saveLongTermTask,
  deleteLongTermTask,
} from '@/shared/storage/repositories/long-term-task-repository';
import {
  deleteStepsForGoal,
  listStepsForGoal,
  saveStep,
} from '@/shared/storage/repositories/step-repository';
import {
  getLastSeenCalendarDay,
  setLastSeenCalendarDay,
} from '@/shared/storage/repositories/app-meta-repository';
import { buildDailyTask, buildLongTermTask, buildStep } from '@/test/fixtures';

describe('IndexedDB repositories', () => {
  let db: IDBDatabase;

  beforeEach(async () => {
    await downgrade().catch(() => undefined);
    db = await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase(db);
    await downgrade().catch(() => undefined);
  });

  it('orders daily tasks oldest-first (AC-17)', async () => {
    await saveDailyTask(db, buildDailyTask({ title: 'Second', createdAt: '2026-06-13T10:00:00.000Z' }));
    await saveDailyTask(db, buildDailyTask({ title: 'First', createdAt: '2026-06-13T09:00:00.000Z' }));

    const tasks = await listDailyTasksForDate(db, '2026-06-13');
    expect(tasks.map((t) => t.title)).toEqual(['First', 'Second']);
  });

  it('queries rolled-over incomplete tasks before today', async () => {
    await saveDailyTask(
      db,
      buildDailyTask({ title: 'Yesterday', activeDate: '2026-06-12', completed: false }),
    );
    await saveDailyTask(
      db,
      buildDailyTask({ title: 'Done yesterday', activeDate: '2026-06-12', completed: true }),
    );

    const rolled = await listRolledOverDailyTasks(db, '2026-06-13');
    expect(rolled).toHaveLength(1);
    expect(rolled[0]?.title).toBe('Yesterday');
  });

  it('selects latest long-term task by createdAt desc (AC-03)', async () => {
    await saveLongTermTask(
      db,
      buildLongTermTask({ title: 'Older', createdAt: '2026-06-10T10:00:00.000Z' }),
    );
    await saveLongTermTask(
      db,
      buildLongTermTask({ title: 'Latest', createdAt: '2026-06-11T10:00:00.000Z' }),
    );

    const latest = await getLatestLongTermTask(db);
    expect(latest?.title).toBe('Latest');
  });

  it('orders long-term tasks oldest-first (AC-17)', async () => {
    await saveLongTermTask(
      db,
      buildLongTermTask({ title: 'B', createdAt: '2026-06-11T10:00:00.000Z' }),
    );
    await saveLongTermTask(
      db,
      buildLongTermTask({ title: 'A', createdAt: '2026-06-10T10:00:00.000Z' }),
    );

    expect((await listLongTermTasks(db)).map((t) => t.title)).toEqual(['A', 'B']);
  });

  it('cascade-deletes steps when long-term task removed (AC-12g)', async () => {
    const goal = buildLongTermTask({ title: 'Goal' });
    await saveLongTermTask(db, goal);
    await saveStep(db, buildStep({ longTermTaskId: goal.id, title: 'Step 1' }));

    await deleteStepsForGoal(db, goal.id);
    await deleteLongTermTask(db, goal.id);

    expect(await listStepsForGoal(db, goal.id)).toEqual([]);
  });

  it('reads and writes app_meta lastSeenCalendarDay', async () => {
    await setLastSeenCalendarDay(db, '2026-06-12');
    expect(await getLastSeenCalendarDay(db)).toBe('2026-06-12');
  });
});
