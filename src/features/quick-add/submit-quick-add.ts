import type { DailyTask, LongTermTask, Step } from '@/entities/planner/types';
import { generateId } from '@/shared/lib/date';
import {
  assertCanAddStep,
  assertUniqueStepTitle,
  isDomainError,
  parseQuickAddEntry,
  validateTitle,
} from '@/shared/lib/quick-add';
import { DOMAIN_ERROR_MESSAGES } from '@/shared/ui/error-messages';
import {
  saveDailyTask,
  listDailyTasksForDate,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  getLatestLongTermTask,
  hasLongTermTasks,
  listLongTermTasks,
  saveLongTermTask,
} from '@/shared/storage/repositories/long-term-task-repository';
import {
  listStepsForGoal,
  saveStep,
} from '@/shared/storage/repositories/step-repository';

export type QuickAddResult = {
  kind: 'daily' | 'longTerm' | 'step';
  id: string;
};

export type QuickAddError = {
  code: string;
  message: string;
};

export function mapQuickAddError(error: unknown): QuickAddError | null {
  if (isDomainError(error)) {
    return {
      code: error.code,
      message: DOMAIN_ERROR_MESSAGES[error.code],
    };
  }
  return null;
}

export async function submitQuickAdd(
  db: IDBDatabase,
  raw: string,
  today: string,
): Promise<QuickAddResult> {
  const parsed = parseQuickAddEntry(raw);
  validateTitle(parsed.title);

  const now = new Date().toISOString();

  if (parsed.kind === 'daily') {
    const task: DailyTask = {
      id: generateId(),
      title: parsed.title,
      activeDate: today,
      completed: false,
      createdAt: now,
    };
    await saveDailyTask(db, task);
    return { kind: 'daily', id: task.id };
  }

  if (parsed.kind === 'longTerm') {
    const task: LongTermTask = {
      id: generateId(),
      title: parsed.title,
      createdAt: now,
    };
    await saveLongTermTask(db, task);
    return { kind: 'longTerm', id: task.id };
  }

  const hasGoals = await hasLongTermTasks(db);
  assertCanAddStep(hasGoals);

  const goal = await getLatestLongTermTask(db);
  if (!goal) {
    assertCanAddStep(false);
  }

  const existingSteps = await listStepsForGoal(db, goal!.id);
  assertUniqueStepTitle(
    existingSteps.map((step) => step.title),
    parsed.title,
  );

  const step: Step = {
    id: generateId(),
    longTermTaskId: goal!.id,
    title: parsed.title,
    completed: false,
    createdAt: now,
  };
  await saveStep(db, step);
  return { kind: 'step', id: step.id };
}

export async function countDailyTasksForDate(
  db: IDBDatabase,
  today: string,
): Promise<number> {
  return (await listDailyTasksForDate(db, today)).length;
}

export async function countLongTermTasks(db: IDBDatabase): Promise<number> {
  return (await listLongTermTasks(db)).length;
}

export async function countStepsForLatestGoal(db: IDBDatabase): Promise<number> {
  const goal = await getLatestLongTermTask(db);
  if (!goal) return 0;
  return (await listStepsForGoal(db, goal.id)).length;
}
