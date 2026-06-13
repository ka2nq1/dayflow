import {
  getDailyTask,
  listRolledOverDailyTasks,
  saveDailyTask,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  completeDailyTask,
  deleteDailyTaskWithConfirm,
  editDailyTaskTitle,
} from '@/entities/daily-task';
import type { ConfirmFn } from '@/shared/lib/confirm';
import { runDayTransition } from './run-day-transition';

export async function moveToToday(
  db: IDBDatabase,
  taskId: string,
  today: string,
): Promise<void> {
  const task = await getDailyTask(db, taskId);
  if (!task) return;
  await saveDailyTask(db, { ...task, activeDate: today });
}

export async function completeRolledOverTask(db: IDBDatabase, taskId: string): Promise<void> {
  await completeDailyTask(db, taskId);
}

export async function editRolledOverTask(
  db: IDBDatabase,
  taskId: string,
  title: string,
): Promise<void> {
  await editDailyTaskTitle(db, taskId, title);
}

export async function deleteRolledOverTask(
  db: IDBDatabase,
  taskId: string,
  confirm: ConfirmFn,
): Promise<boolean> {
  return deleteDailyTaskWithConfirm(db, taskId, confirm);
}

export async function getRolledOverTasks(db: IDBDatabase, today: string) {
  return listRolledOverDailyTasks(db, today);
}

export function useRollover(db: IDBDatabase | null, today: string) {
  return {
    runDayTransition: async () => {
      if (!db) return { rolledOverTasks: [], didTransition: false };
      return runDayTransition(db, today);
    },
    moveToToday: async (taskId: string) => {
      if (!db) return;
      await moveToToday(db, taskId, today);
    },
    completeRolledOverTask: async (taskId: string) => {
      if (!db) return;
      await completeRolledOverTask(db, taskId);
    },
    editRolledOverTask: async (taskId: string, title: string) => {
      if (!db) return;
      await editRolledOverTask(db, taskId, title);
    },
    deleteRolledOverTask: async (taskId: string, confirm: ConfirmFn) => {
      if (!db) return false;
      return deleteRolledOverTask(db, taskId, confirm);
    },
    getRolledOverTasks: async () => {
      if (!db) return [];
      return getRolledOverTasks(db, today);
    },
  };
}
