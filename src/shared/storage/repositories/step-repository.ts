import type { Step } from '@/entities/planner/types';
import { compareByCreatedAtAsc } from '@/shared/lib/date';
import {
  deleteFromStore,
  getAllFromStore,
  promisifyRequest,
  putInStore,
  waitForTransaction,
} from '@/shared/storage/idb';

const STORE = 'steps';

export async function saveStep(db: IDBDatabase, step: Step): Promise<void> {
  await putInStore(db, STORE, step);
}

export async function getStep(db: IDBDatabase, id: string): Promise<Step | undefined> {
  const tx = db.transaction(STORE, 'readonly');
  const result = await promisifyRequest(tx.objectStore(STORE).get(id));
  await waitForTransaction(tx);
  return result ?? undefined;
}

export async function deleteStep(db: IDBDatabase, id: string): Promise<void> {
  await deleteFromStore(db, STORE, id);
}

export async function listStepsForGoal(db: IDBDatabase, longTermTaskId: string): Promise<Step[]> {
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.objectStore(STORE).index('by_longTermTaskId_createdAt');
  const range = IDBKeyRange.bound([longTermTaskId, ''], [longTermTaskId, '\uffff']);
  const steps = await promisifyRequest(index.getAll(range));
  await waitForTransaction(tx);
  return steps.sort(compareByCreatedAtAsc);
}

export async function hasStepTitleForGoal(
  db: IDBDatabase,
  longTermTaskId: string,
  title: string,
): Promise<boolean> {
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.objectStore(STORE).index('by_longTermTaskId_title');
  const result = await promisifyRequest(index.get([longTermTaskId, title]));
  await waitForTransaction(tx);
  return result !== undefined;
}

export async function deleteStepsForGoal(db: IDBDatabase, longTermTaskId: string): Promise<void> {
  const steps = await listStepsForGoal(db, longTermTaskId);
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  for (const step of steps) {
    store.delete(step.id);
  }
  await waitForTransaction(tx);
}

export async function getAllSteps(db: IDBDatabase): Promise<Step[]> {
  const steps = await getAllFromStore<Step>(db, STORE);
  return steps.sort(compareByCreatedAtAsc);
}

export async function countCompletedSteps(
  db: IDBDatabase,
  longTermTaskId: string,
): Promise<{ completed: number; total: number }> {
  const steps = await listStepsForGoal(db, longTermTaskId);
  return {
    completed: steps.filter((s) => s.completed).length,
    total: steps.length,
  };
}
