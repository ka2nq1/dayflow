import type { DailyTask } from '@/entities/planner/types';
import { compareByCreatedAtAsc } from '@/shared/lib/date';
import {
  deleteFromStore,
  getAllFromStore,
  promisifyRequest,
  putInStore,
  waitForTransaction,
} from '@/shared/storage/idb';

const STORE = 'daily_tasks';

export async function saveDailyTask(db: IDBDatabase, task: DailyTask): Promise<void> {
  await putInStore(db, STORE, task);
}

export async function getDailyTask(db: IDBDatabase, id: string): Promise<DailyTask | undefined> {
  const tx = db.transaction(STORE, 'readonly');
  const result = await promisifyRequest(tx.objectStore(STORE).get(id));
  await waitForTransaction(tx);
  return result ?? undefined;
}

export async function deleteDailyTask(db: IDBDatabase, id: string): Promise<void> {
  await deleteFromStore(db, STORE, id);
}

export async function listDailyTasksForDate(
  db: IDBDatabase,
  activeDate: string,
): Promise<DailyTask[]> {
  const tx = db.transaction(STORE, 'readonly');
  const index = tx.objectStore(STORE).index('by_activeDate_createdAt');
  const range = IDBKeyRange.bound([activeDate, ''], [activeDate, '\uffff']);
  const tasks = await promisifyRequest(index.getAll(range));
  await waitForTransaction(tx);
  return tasks.sort(compareByCreatedAtAsc);
}

export async function listRolledOverDailyTasks(
  db: IDBDatabase,
  today: string,
): Promise<DailyTask[]> {
  const all = await getAllFromStore<DailyTask>(db, STORE);
  return all
    .filter((task) => !task.completed && task.activeDate < today)
    .sort(compareByCreatedAtAsc);
}

export async function getAllDailyTasks(db: IDBDatabase): Promise<DailyTask[]> {
  const tasks = await getAllFromStore<DailyTask>(db, STORE);
  return tasks.sort(compareByCreatedAtAsc);
}
