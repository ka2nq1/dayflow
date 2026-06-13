import type { DailyTask, LongTermTask, Step } from '@/entities/planner/types';
import { generateId, todayLocalDate } from '@/shared/lib/date';

export type BackupFixture = {
  dayflowBackupVersion: number;
  exportedAt: string;
  dailyTasks: DailyTask[];
  longTermTasks: LongTermTask[];
  steps: Step[];
};

export function buildDailyTask(overrides: Partial<DailyTask> = {}): DailyTask {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: 'Test task',
    activeDate: todayLocalDate(),
    completed: false,
    createdAt: now,
    ...overrides,
  };
}

export function buildLongTermTask(overrides: Partial<LongTermTask> = {}): LongTermTask {
  return {
    id: generateId(),
    title: 'Example goal',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function buildStep(overrides: Partial<Step> & { longTermTaskId: string }): Step {
  return {
    id: generateId(),
    title: 'Example step',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function buildBackupFile(
  entities: Partial<Pick<BackupFixture, 'dailyTasks' | 'longTermTasks' | 'steps'>> = {},
): BackupFixture {
  return {
    dayflowBackupVersion: 1,
    exportedAt: '2026-06-13T12:00:00.000Z',
    dailyTasks: entities.dailyTasks ?? [],
    longTermTasks: entities.longTermTasks ?? [],
    steps: entities.steps ?? [],
  };
}
