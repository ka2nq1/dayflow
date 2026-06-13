export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

export async function getAllFromStore<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const result = await promisifyRequest(store.getAll());
  await waitForTransaction(tx);
  return result;
}

export async function putInStore<T>(db: IDBDatabase, storeName: string, value: T): Promise<void> {
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(value);
  await waitForTransaction(tx);
}

export async function deleteFromStore(db: IDBDatabase, storeName: string, key: string): Promise<void> {
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).delete(key);
  await waitForTransaction(tx);
}

export async function clearStore(db: IDBDatabase, storeName: string): Promise<void> {
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).clear();
  await waitForTransaction(tx);
}

export async function getByKey<T>(
  db: IDBDatabase,
  storeName: string,
  key: string,
): Promise<T | undefined> {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const result = await promisifyRequest(store.get(key));
  await waitForTransaction(tx);
  return result ?? undefined;
}
