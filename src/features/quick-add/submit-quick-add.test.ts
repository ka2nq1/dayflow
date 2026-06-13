import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import {
  submitQuickAdd,
  mapQuickAddError,
  countDailyTasksForDate,
  countLongTermTasks,
  countStepsForLatestGoal,
} from '@/features/quick-add/submit-quick-add';
import { listDailyTasksForDate } from '@/shared/storage/repositories/daily-task-repository';
import { getLatestLongTermTask } from '@/shared/storage/repositories/long-term-task-repository';
import { listStepsForGoal } from '@/shared/storage/repositories/step-repository';
import { saveLongTermTask } from '@/shared/storage/repositories/long-term-task-repository';
import { buildLongTermTask } from '@/test/fixtures';
import { DomainErrors } from '@/shared/lib/domain-error';

describe('submitQuickAdd', () => {
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

  it('creates daily task from plain text (AC-01)', async () => {
    await submitQuickAdd(db, 'Buy milk', today);

    const tasks = await listDailyTasksForDate(db, today);
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe('Buy milk');
    expect(tasks[0]?.activeDate).toBe(today);
  });

  it('creates long-term task from exclamation prefix (AC-02)', async () => {
    await submitQuickAdd(db, '!Launch side project', today);

    expect(await countLongTermTasks(db)).toBe(1);
    const goal = await getLatestLongTermTask(db);
    expect(goal?.title).toBe('Launch side project');
    expect(await listStepsForGoal(db, goal!.id)).toEqual([]);
  });

  it('appends step to latest long-term task (AC-03)', async () => {
    await saveLongTermTask(
      db,
      buildLongTermTask({ title: 'Older', createdAt: '2026-06-10T10:00:00.000Z' }),
    );
    const latest = buildLongTermTask({
      title: 'Launch side project',
      createdAt: '2026-06-11T10:00:00.000Z',
    });
    await saveLongTermTask(db, latest);

    await submitQuickAdd(db, '+Register domain', today);

    const steps = await listStepsForGoal(db, latest.id);
    expect(steps).toHaveLength(1);
    expect(steps[0]?.title).toBe('Register domain');
    expect(steps[0]?.completed).toBe(false);
  });

  it('blocks empty quick-add (AC-05)', async () => {
    await expect(submitQuickAdd(db, '', today)).rejects.toThrow(DomainErrors.titleRequired());
    expect(await countDailyTasksForDate(db, today)).toBe(0);
    expect(mapQuickAddError(DomainErrors.titleRequired())?.message).toMatch(/required/i);
  });

  it('blocks step when no long-term task exists (AC-06)', async () => {
    await expect(submitQuickAdd(db, '+First step', today)).rejects.toThrow(
      DomainErrors.noLongTermTaskForStep(),
    );
    expect(await countStepsForLatestGoal(db)).toBe(0);
  });

  it('blocks duplicate step title within goal (AC-08)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    await submitQuickAdd(db, '+Register domain', today);

    await expect(submitQuickAdd(db, '+Register domain', today)).rejects.toThrow(
      DomainErrors.duplicateStepTitle(),
    );
    expect((await listStepsForGoal(db, goal.id)).filter((s) => s.title === 'Register domain')).toHaveLength(1);
  });

  it('strips whitespace after prefix (AC-16)', async () => {
    await submitQuickAdd(db, '!  Launch side project', today);
    const goal = await getLatestLongTermTask(db);
    expect(goal?.title).toBe('Launch side project');

    await submitQuickAdd(db, '+  Register domain', today);
    const steps = await listStepsForGoal(db, goal!.id);
    expect(steps[0]?.title).toBe('Register domain');
  });

  it('allows duplicate daily titles on same day (AC-20)', async () => {
    await submitQuickAdd(db, 'Buy milk', today);
    await submitQuickAdd(db, 'Buy milk', today);

    const tasks = await listDailyTasksForDate(db, today);
    expect(tasks).toHaveLength(2);
    expect(tasks.every((task) => task.title === 'Buy milk')).toBe(true);
  });
});
