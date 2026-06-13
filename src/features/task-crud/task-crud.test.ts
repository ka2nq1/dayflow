import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import {
  completeDailyTask,
  editDailyTaskTitle,
  deleteDailyTaskWithConfirm,
} from '@/features/task-crud/daily';
import {
  editLongTermTaskTitle,
  deleteLongTermTaskWithConfirm,
} from '@/features/task-crud/long-term';
import {
  completeStep,
  editStepTitle,
  deleteStepWithConfirm,
} from '@/features/task-crud/step';
import {
  getDailyTask,
  listDailyTasksForDate,
  saveDailyTask,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  getLongTermTask,
  saveLongTermTask,
} from '@/shared/storage/repositories/long-term-task-repository';
import {
  countCompletedSteps,
  listStepsForGoal,
  saveStep,
} from '@/shared/storage/repositories/step-repository';
import { buildDailyTask, buildLongTermTask, buildStep } from '@/test/fixtures';
import { DomainErrors } from '@/shared/lib/domain-error';

describe('task-crud daily', () => {
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

  it('completes daily task and keeps it visible (AC-04)', async () => {
    const task = buildDailyTask({ title: 'Buy milk', activeDate: today });
    await saveDailyTask(db, task);

    await completeDailyTask(db, task.id);

    const updated = await getDailyTask(db, task.id);
    expect(updated?.completed).toBe(true);
    expect((await listDailyTasksForDate(db, today)).some((t) => t.id === task.id)).toBe(true);
  });

  it('edits daily title (AC-04b)', async () => {
    const task = buildDailyTask({ title: 'Buy milk', activeDate: today });
    await saveDailyTask(db, task);

    await editDailyTaskTitle(db, task.id, 'Buy oat milk');

    expect((await getDailyTask(db, task.id))?.title).toBe('Buy oat milk');
  });

  it('deletes daily after confirm (AC-04c)', async () => {
    const task = buildDailyTask({ title: 'Buy milk', activeDate: today });
    await saveDailyTask(db, task);
    const confirm = vi.fn().mockResolvedValue(true);

    const deleted = await deleteDailyTaskWithConfirm(db, task.id, confirm);

    expect(deleted).toBe(true);
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(await getDailyTask(db, task.id)).toBeUndefined();
  });

  it('withholds daily delete until confirmed (AC-07b)', async () => {
    const task = buildDailyTask({ title: 'Buy milk', activeDate: today });
    await saveDailyTask(db, task);
    const confirm = vi.fn().mockResolvedValue(false);

    const deleted = await deleteDailyTaskWithConfirm(db, task.id, confirm);

    expect(deleted).toBe(false);
    expect(await getDailyTask(db, task.id)).toBeDefined();
  });

  it('blocks blank daily title edit (AC-14)', async () => {
    const task = buildDailyTask({ title: 'Buy milk', activeDate: today });
    await saveDailyTask(db, task);

    await expect(editDailyTaskTitle(db, task.id, '   ')).rejects.toThrow(
      DomainErrors.titleRequired(),
    );
    expect((await getDailyTask(db, task.id))?.title).toBe('Buy milk');
  });
});

describe('task-crud long-term', () => {
  let db: IDBDatabase;

  beforeEach(async () => {
    await downgrade().catch(() => undefined);
    db = await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase(db);
    await downgrade().catch(() => undefined);
  });

  it('completes step and updates progress count (AC-12b)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    const step = buildStep({ longTermTaskId: goal.id, title: 'Register domain' });
    await saveStep(db, step);

    await completeStep(db, step.id);

    expect((await countCompletedSteps(db, goal.id)).completed).toBe(1);
  });

  it('edits long-term title (AC-12c)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);

    await editLongTermTaskTitle(db, goal.id, 'Launch SaaS side project');

    expect((await getLongTermTask(db, goal.id))?.title).toBe('Launch SaaS side project');
  });

  it('withholds long-term delete until confirmed (AC-12d)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    const confirm = vi.fn().mockResolvedValue(false);

    const deleted = await deleteLongTermTaskWithConfirm(db, goal.id, confirm);

    expect(deleted).toBe(false);
    expect(await getLongTermTask(db, goal.id)).toBeDefined();
  });

  it('edits step title (AC-12e)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    const step = buildStep({ longTermTaskId: goal.id, title: 'Register domain' });
    await saveStep(db, step);

    await editStepTitle(db, step.id, 'Register .com domain');

    expect((await listStepsForGoal(db, goal.id))[0]?.title).toBe('Register .com domain');
  });

  it('withholds step delete until confirmed (AC-12f)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    const step = buildStep({ longTermTaskId: goal.id, title: 'Register domain' });
    await saveStep(db, step);
    const confirm = vi.fn().mockResolvedValue(false);

    const deleted = await deleteStepWithConfirm(db, step.id, confirm);

    expect(deleted).toBe(false);
    expect((await listStepsForGoal(db, goal.id))).toHaveLength(1);
  });

  it('deletes long-term task and cascades steps (AC-12g)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    await saveStep(db, buildStep({ longTermTaskId: goal.id, title: 'Register domain' }));
    const confirm = vi.fn().mockResolvedValue(true);

    const deleted = await deleteLongTermTaskWithConfirm(db, goal.id, confirm);

    expect(deleted).toBe(true);
    expect(await getLongTermTask(db, goal.id)).toBeUndefined();
    expect(await listStepsForGoal(db, goal.id)).toEqual([]);
  });

  it('deletes step and updates progress count (AC-12h)', async () => {
    const goal = buildLongTermTask({ title: 'Launch side project' });
    await saveLongTermTask(db, goal);
    const step = buildStep({ longTermTaskId: goal.id, title: 'Register domain' });
    await saveStep(db, step);
    const confirm = vi.fn().mockResolvedValue(true);

    const deleted = await deleteStepWithConfirm(db, step.id, confirm);

    expect(deleted).toBe(true);
    expect((await countCompletedSteps(db, goal.id)).total).toBe(0);
  });
});
