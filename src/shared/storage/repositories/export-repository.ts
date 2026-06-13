import type { DailyTask, LongTermTask, Step } from '@/entities/planner/types';
import { getAllDailyTasks } from '@/shared/storage/repositories/daily-task-repository';
import { getAllLongTermTasks } from '@/shared/storage/repositories/long-term-task-repository';
import { getAllSteps } from '@/shared/storage/repositories/step-repository';

export type ExportSnapshot = {
  dailyTasks: DailyTask[];
  longTermTasks: LongTermTask[];
  steps: Step[];
};

export async function getAllForExport(db: IDBDatabase): Promise<ExportSnapshot> {
  const [dailyTasks, longTermTasks, steps] = await Promise.all([
    getAllDailyTasks(db),
    getAllLongTermTasks(db),
    getAllSteps(db),
  ]);
  return { dailyTasks, longTermTasks, steps };
}
