import { validateTitle } from '@/shared/lib/quick-add';
import {
  deleteStep,
  getStep,
  saveStep,
} from '@/shared/storage/repositories/step-repository';
import { withConfirm, type ConfirmFn } from './confirm';

export async function completeStep(db: IDBDatabase, id: string): Promise<void> {
  const step = await getStep(db, id);
  if (!step) return;
  await saveStep(db, { ...step, completed: true });
}

export async function editStepTitle(db: IDBDatabase, id: string, title: string): Promise<void> {
  validateTitle(title);
  const step = await getStep(db, id);
  if (!step) return;
  await saveStep(db, { ...step, title: title.trim() });
}

export async function deleteStepWithConfirm(
  db: IDBDatabase,
  id: string,
  confirm: ConfirmFn,
): Promise<boolean> {
  const step = await getStep(db, id);
  if (!step) return false;

  return withConfirm(confirm, async () => {
    await deleteStep(db, id);
  });
}
