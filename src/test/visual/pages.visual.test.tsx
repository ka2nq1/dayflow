import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LongTermPage } from '@/pages/long-term/LongTermPage';
import { renderWithPlanner, seedPlannerDatabase } from '@/test/render-planner';
import { saveDailyTask } from '@/shared/storage/repositories/daily-task-repository';
import { saveLongTermTask } from '@/shared/storage/repositories/long-term-task-repository';
import { saveStep } from '@/shared/storage/repositories/step-repository';
import { buildDailyTask, buildLongTermTask, buildStep } from '@/test/fixtures';
import { todayLocalDate } from '@/shared/lib/date';

describe('visual regression snapshots', () => {
  beforeEach(async () => {
    const today = todayLocalDate();
    await seedPlannerDatabase(async (db) => {
      await saveDailyTask(
        db,
        buildDailyTask({ title: 'Buy milk', activeDate: today, createdAt: '2026-06-13T09:00:00.000Z' }),
      );
      await saveDailyTask(
        db,
        buildDailyTask({
          title: 'Call dentist',
          activeDate: '2026-06-12',
          completed: false,
          createdAt: '2026-06-12T09:00:00.000Z',
        }),
      );
      const goal = buildLongTermTask({ title: 'Launch side project' });
      await saveLongTermTask(db, goal);
      await saveStep(db, buildStep({ longTermTaskId: goal.id, title: 'Register domain' }));
    });
  });

  it('dashboard populated state', async () => {
    const { container } = renderWithPlanner(<DashboardPage />);
    await screen.findByRole('heading', { name: 'Today' });
    expect(container).toMatchSnapshot();
  });

  it('long-term populated state', async () => {
    const { container } = renderWithPlanner(<LongTermPage />, '/long-term');
    await screen.findByText('0 of 1 steps');
    expect(container).toMatchSnapshot();
  });
});
