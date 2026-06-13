import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { todayLocalDate } from '@/shared/lib/date';
import { openDatabase } from '@/shared/storage/db';
import { getAllDailyTasks } from '@/shared/storage/repositories/daily-task-repository';
import { getAllLongTermTasks } from '@/shared/storage/repositories/long-term-task-repository';
import { getAllSteps } from '@/shared/storage/repositories/step-repository';

type PlannerContextValue = {
  db: IDBDatabase | null;
  today: string;
  ready: boolean;
  isEmpty: boolean;
  storageError: string | null;
  refresh: () => Promise<void>;
  refreshKey: number;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const today = useMemo(() => todayLocalDate(), []);

  const refresh = useCallback(async () => {
    if (!db) return;
    const [dailies, goals, steps] = await Promise.all([
      getAllDailyTasks(db),
      getAllLongTermTasks(db),
      getAllSteps(db),
    ]);
    setIsEmpty(dailies.length === 0 && goals.length === 0 && steps.length === 0);
    setRefreshKey((k) => k + 1);
  }, [db]);

  useEffect(() => {
    let cancelled = false;
    let database: IDBDatabase | null = null;

    openDatabase()
      .then(async (opened) => {
        database = opened;
        if (cancelled) {
          opened.close();
          return;
        }
        setDb(opened);
        setReady(true);
        const [dailies, goals, steps] = await Promise.all([
          getAllDailyTasks(opened),
          getAllLongTermTasks(opened),
          getAllSteps(opened),
        ]);
        setIsEmpty(dailies.length === 0 && goals.length === 0 && steps.length === 0);
      })
      .catch(() => {
        if (!cancelled) {
          setStorageError(
            'Local storage is unavailable. Your tasks cannot be saved on this device right now.',
          );
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
      database?.close();
    };
  }, []);

  const value = useMemo(
    () => ({ db, today, ready, isEmpty, storageError, refresh, refreshKey }),
    [db, today, ready, isEmpty, storageError, refresh, refreshKey],
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner(): PlannerContextValue {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}
