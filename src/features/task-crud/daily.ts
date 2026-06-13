import { validateTitle } from '@/shared/lib/quick-add';
import {
  deleteDailyTask,
  getDailyTask,
  saveDailyTask,
} from '@/shared/storage/repositories/daily-task-repository';
import { withConfirm, type ConfirmFn } from './confirm';

export async function completeDailyTask(db: IDBDatabase, id: string): Promise<void> {
  const task = await getDailyTask(db, id);
  if (!task) return;
  await saveDailyTask(db, { ...task, completed: true });
}

export async function editDailyTaskTitle(
  db: IDBDatabase,
  id: string,
  title: string,
): Promise<void> {
  validateTitle(title);
  const task = await getDailyTask(db, id);
  if (!task) return;
  await saveDailyTask(db, { ...task, title: title.trim() });
}

export async function deleteDailyTaskWithConfirm(
  db: IDBDatabase,
  id: string,
  confirm: ConfirmFn,
): Promise<boolean> {
  const task = await getDailyTask(db, id);
  if (!task) return false;

  return withConfirm(confirm, async () => {
    await deleteDailyTask(db, id);
  });
}
