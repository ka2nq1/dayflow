import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LongTermPage } from './LongTermPage';
import { renderWithPlanner, seedPlannerDatabase } from '@/test/render-planner';
import { saveLongTermTask } from '@/shared/storage/repositories/long-term-task-repository';
import { saveStep } from '@/shared/storage/repositories/step-repository';
import { buildLongTermTask, buildStep } from '@/test/fixtures';

describe('LongTermPage', () => {
  beforeEach(async () => {
    await seedPlannerDatabase(async (db) => {
      const goal = buildLongTermTask({ id: 'goal-1', title: 'Launch side project' });
      await saveLongTermTask(db, goal);
      await saveStep(
        db,
        buildStep({
          id: 'step-1',
          longTermTaskId: goal.id,
          title: 'Register domain',
          completed: true,
          createdAt: '2026-06-13T09:00:00.000Z',
        }),
      );
      await saveStep(
        db,
        buildStep({
          id: 'step-2',
          longTermTaskId: goal.id,
          title: 'Build landing page',
          completed: false,
          createdAt: '2026-06-13T10:00:00.000Z',
        }),
      );
    });
  });

  it('shows progress and expandable step checklist (AC-12)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<LongTermPage />, '/long-term');

    expect(await screen.findByText('1 of 2 steps')).toBeInTheDocument();

    const expand = screen.getByRole('button', { name: 'Launch side project' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    await user.click(expand);

    expect(expand).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByLabelText('Register domain')).toBeInTheDocument();
    expect(screen.getByLabelText('Build landing page')).toBeInTheDocument();
  });

  it('blocks blank step title edit (AC-14 pattern)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<LongTermPage />, '/long-term');

    await user.click(await screen.findByRole('button', { name: 'Launch side project' }));
    const stepRow = (await screen.findByLabelText('Build landing page')).closest('li');
    expect(stepRow).not.toBeNull();

    await user.click(within(stepRow!).getByRole('button', { name: 'Edit' }));
    const input = within(stepRow!).getByRole('textbox');
    await user.clear(input);
    await user.click(within(stepRow!).getByRole('button', { name: 'Save' }));

    expect(await within(stepRow!).findByRole('alert')).toHaveTextContent(
      'A task title is required.',
    );
  });
});
