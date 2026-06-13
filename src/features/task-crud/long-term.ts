import { validateTitle } from '@/shared/lib/quick-add';
import {
  deleteLongTermTask,
  getLongTermTask,
  saveLongTermTask,
} from '@/shared/storage/repositories/long-term-task-repository';
import { deleteStepsForGoal } from '@/shared/storage/repositories/step-repository';
import { withConfirm, type ConfirmFn } from './confirm';

export async function editLongTermTaskTitle(
  db: IDBDatabase,
  id: string,
  title: string,
): Promise<void> {
  validateTitle(title);
  const task = await getLongTermTask(db, id);
  if (!task) return;
  await saveLongTermTask(db, { ...task, title: title.trim() });
}

export async function deleteLongTermTaskWithConfirm(
  db: IDBDatabase,
  id: string,
  confirm: ConfirmFn,
): Promise<boolean> {
  const task = await getLongTermTask(db, id);
  if (!task) return false;

  return withConfirm(confirm, async () => {
    await deleteStepsForGoal(db, id);
    await deleteLongTermTask(db, id);
  });
}
