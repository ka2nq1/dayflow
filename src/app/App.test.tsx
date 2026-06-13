import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { AppRoutes } from '@/app/routes';
import { renderWithPlanner, seedPlannerDatabase } from '@/test/render-planner';
import { saveLongTermTask } from '@/shared/storage/repositories/long-term-task-repository';
import { saveStep } from '@/shared/storage/repositories/step-repository';
import { buildLongTermTask, buildStep } from '@/test/fixtures';

describe('App shell', () => {
  beforeEach(async () => {
    await seedPlannerDatabase(async (db) => {
      const goal = buildLongTermTask({ id: 'goal-1', title: 'Launch side project' });
      await saveLongTermTask(db, goal);
      await saveStep(
        db,
        buildStep({
          longTermTaskId: goal.id,
          title: 'Register domain',
          completed: true,
        }),
      );
      await saveStep(
        db,
        buildStep({
          longTermTaskId: goal.id,
          title: 'Build landing page',
          completed: false,
        }),
      );
    });
  });

  it('renders dashboard route', () => {
    renderWithPlanner(<AppRoutes />, '/');
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
  });

  it('navigates to long-term and shows goals with progress (AC-18)', async () => {
    renderWithPlanner(<AppRoutes />, '/long-term');
    expect(await screen.findByRole('heading', { name: 'Long-term' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Launch side project' })).toBeInTheDocument();
    expect(screen.getByText('1 of 2 steps')).toBeInTheDocument();
  });
});
