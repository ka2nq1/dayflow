import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { openDatabase, closeDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';
import { submitQuickAdd } from '@/features/quick-add/submit-quick-add';
import { listDailyTasksForDate } from '@/shared/storage/repositories/daily-task-repository';
import { todayLocalDate } from '@/shared/lib/date';

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1);
  return sorted[index] ?? 0;
}

describe('load NFRs', () => {
  let db: IDBDatabase;
  const today = todayLocalDate();

  beforeEach(async () => {
    await downgrade().catch(() => undefined);
    db = await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase(db);
    await downgrade().catch(() => undefined);
  });

  it('quick-add p95 stays within 500 ms after warm start', async () => {
    await submitQuickAdd(db, 'Warm up', today);
    const durations: number[] = [];

    for (let i = 0; i < 50; i += 1) {
      const start = performance.now();
      await submitQuickAdd(db, `Task ${i}`, today);
      durations.push(performance.now() - start);
    }

    expect(percentile(durations, 0.95)).toBeLessThanOrEqual(500);
  });

  it('dashboard query p95 stays within 1000 ms after warm start', async () => {
    for (let i = 0; i < 20; i += 1) {
      await submitQuickAdd(db, `Seed ${i}`, today);
    }

    const durations: number[] = [];
    for (let i = 0; i < 20; i += 1) {
      const start = performance.now();
      await listDailyTasksForDate(db, today);
      durations.push(performance.now() - start);
    }

    expect(percentile(durations, 0.95)).toBeLessThanOrEqual(1000);
  });
});
