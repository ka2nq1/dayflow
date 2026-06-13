import { DB_NAME, DB_VERSION, upgrade } from './migrations/01_create_planner_schema.up';

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      upgrade(db);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function closeDatabase(db: IDBDatabase): Promise<void> {
  db.close();
}
