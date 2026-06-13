import type { ReactElement } from 'react';
import { cleanup, render, type RenderResult } from '@testing-library/react';
import { afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { PlannerProvider } from '@/app/providers/PlannerProvider';
import { closeDatabase, openDatabase } from '@/shared/storage/db';
import { downgrade } from '@/shared/storage/migrations/01_create_planner_schema.down';

afterEach(() => {
  cleanup();
});

export async function resetPlannerDatabase(): Promise<void> {
  await downgrade().catch(() => undefined);
}

export async function seedPlannerDatabase(
  seed: (db: IDBDatabase) => Promise<void>,
): Promise<void> {
  await resetPlannerDatabase();
  const db = await openDatabase();
  try {
    await seed(db);
  } finally {
    await closeDatabase(db);
  }
}

export function renderWithPlanner(ui: ReactElement, path = '/'): RenderResult {
  return render(
    <PlannerProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </PlannerProvider>,
  );
}
