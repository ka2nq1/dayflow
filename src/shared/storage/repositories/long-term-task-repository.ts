import type { LongTermTask } from '@/entities/planner/types';
import { compareByCreatedAtAsc } from '@/shared/lib/date';
import {
  deleteFromStore,
  getAllFromStore,
  promisifyRequest,
  putInStore,
  waitForTransaction,
} from '@/shared/storage/idb';

const STORE = 'long_term_tasks';

export async function saveLongTermTask(db: IDBDatabase, task: LongTermTask): Promise<void> {
  await putInStore(db, STORE, task);
}

export async function getLongTermTask(
  db: IDBDatabase,
  id: string,
): Promise<LongTermTask | undefined> {
  const tx = db.transaction(STORE, 'readonly');
  const result = await promisifyRequest(tx.objectStore(STORE).get(id));
  await waitForTransaction(tx);
  return result ?? undefined;
}

export async function deleteLongTermTask(db: IDBDatabase, id: string): Promise<void> {
  await deleteFromStore(db, STORE, id);
}

export async function listLongTermTasks(db: IDBDatabase): Promise<LongTermTask[]> {
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.objectStore(STORE).index('by_createdAt');
  const tasks = await promisifyRequest(index.getAll());
  await waitForTransaction(tx);
  return tasks.sort(compareByCreatedAtAsc);
}

export async function getLatestLongTermTask(db: IDBDatabase): Promise<LongTermTask | undefined> {
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.objectStore(STORE).index('by_createdAt');
  const cursor = await promisifyRequest(index.openCursor(null, 'prev'));
  await waitForTransaction(tx);
  return cursor?.value as LongTermTask | undefined;
}

export async function hasLongTermTasks(db: IDBDatabase): Promise<boolean> {
  const tasks = await getAllFromStore<LongTermTask>(db, STORE);
  return tasks.length > 0;
}

export async function getAllLongTermTasks(db: IDBDatabase): Promise<LongTermTask[]> {
  return listLongTermTasks(db);
}
