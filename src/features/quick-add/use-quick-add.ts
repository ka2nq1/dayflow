import { useCallback, useState } from 'react';
import { mapQuickAddError, submitQuickAdd, type QuickAddError } from './submit-quick-add';

export function useQuickAdd(db: IDBDatabase | null, today: string) {
  const [error, setError] = useState<QuickAddError | null>(null);

  const submit = useCallback(
    async (raw: string): Promise<boolean> => {
      if (!db) return false;
      setError(null);
      try {
        await submitQuickAdd(db, raw, today);
        return true;
      } catch (caught) {
        const mapped = mapQuickAddError(caught);
        if (mapped) {
          setError(mapped);
          return false;
        }
        throw caught;
      }
    },
    [db, today],
  );

  const clearError = useCallback(() => setError(null), []);

  return { submit, error, clearError };
}
