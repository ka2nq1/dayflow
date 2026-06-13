import { getByKey, putInStore } from '@/shared/storage/idb';

const STORE = 'app_meta';

export async function getMetaValue(db: IDBDatabase, key: string): Promise<string | undefined> {
  const record = await getByKey<{ key: string; value: string }>(db, STORE, key);
  return record?.value;
}

export async function setMetaValue(db: IDBDatabase, key: string, value: string): Promise<void> {
  await putInStore(db, STORE, { key, value });
}

export async function getLastSeenCalendarDay(db: IDBDatabase): Promise<string | undefined> {
  return getMetaValue(db, 'lastSeenCalendarDay');
}

export async function setLastSeenCalendarDay(db: IDBDatabase, date: string): Promise<void> {
  await setMetaValue(db, 'lastSeenCalendarDay', date);
}
