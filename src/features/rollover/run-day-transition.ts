import type { DailyTask } from '@/entities/planner/types';
import { listRolledOverDailyTasks } from '@/shared/storage/repositories/daily-task-repository';
import {
  getLastSeenCalendarDay,
  setLastSeenCalendarDay,
} from '@/shared/storage/repositories/app-meta-repository';

export type DayTransitionResult = {
  rolledOverTasks: DailyTask[];
  didTransition: boolean;
};

export async function runDayTransition(
  db: IDBDatabase,
  today: string,
): Promise<DayTransitionResult> {
  const lastSeen = await getLastSeenCalendarDay(db);
  const rolledOverTasks = await listRolledOverDailyTasks(db, today);

  if (lastSeen === today) {
    return { rolledOverTasks, didTransition: false };
  }

  await setLastSeenCalendarDay(db, today);
  return { rolledOverTasks, didTransition: true };
}
