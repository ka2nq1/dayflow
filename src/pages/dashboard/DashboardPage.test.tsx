import { beforeEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from './DashboardPage';
import { DailyTaskList } from './DailyTaskList';
import { renderWithPlanner, seedPlannerDatabase } from '@/test/render-planner';
import { saveDailyTask } from '@/shared/storage/repositories/daily-task-repository';
import { buildDailyTask } from '@/test/fixtures';
import { todayLocalDate } from '@/shared/lib/date';

describe('DashboardPage', () => {
  beforeEach(async () => {
    await seedPlannerDatabase(async () => undefined);
  });

  it('shows quick-add field and today heading', async () => {
    renderWithPlanner(<DashboardPage />);
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByLabelText('Quick add task')).toBeInTheDocument();
  });

  it('shows inline error on empty quick-add submit (AC-05)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<DashboardPage />);
    const input = await screen.findByLabelText('Quick add task');
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('A task title is required.');
  });

  it('blocks step quick-add when no long-term task exists (AC-06)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<DashboardPage />);
    const input = await screen.findByLabelText('Quick add task');
    await user.type(input, '+First step{enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Create a long-term task first using the ! prefix.',
    );
  });

  it('keeps focus in quick-add after successful submit (AC-01)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<DashboardPage />);
    const input = await screen.findByLabelText('Quick add task');
    await user.type(input, 'Buy milk{enter}');

    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
    expect(await screen.findByLabelText('Mark Buy milk complete')).toBeInTheDocument();
  });
});

describe('DailyTaskList', () => {
  const today = todayLocalDate();

  beforeEach(async () => {
    await seedPlannerDatabase(async (db) => {
      await saveDailyTask(
        db,
        buildDailyTask({ id: 'daily-1', title: 'Buy milk', activeDate: today }),
      );
    });
  });

  it('completes, edits, and deletes daily tasks (AC-04, AC-04b, AC-04c)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<DailyTaskList variant="today" title="Today" />);

    const checkbox = await screen.findByLabelText('Mark Buy milk complete');
    await user.click(checkbox);
    await waitFor(() => {
      expect(screen.getByLabelText('Mark Buy milk complete')).toBeChecked();
    });

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    const input = screen.getByLabelText('Edit task title');
    await user.clear(input);
    await user.type(input, 'Buy oat milk');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByLabelText('Mark Buy oat milk complete')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => {
      expect(screen.queryByLabelText('Mark Buy oat milk complete')).not.toBeInTheDocument();
    });
  });

  it('withholds delete until confirmed (AC-07b)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<DailyTaskList variant="today" title="Today" />);

    await screen.findByLabelText('Mark Buy milk complete');
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByLabelText('Mark Buy milk complete')).toBeInTheDocument();
  });
});

describe('Rolled-over block', () => {
  it('shows prior-day tasks and moves them to today (AC-09)', async () => {
    const user = userEvent.setup();
    const yesterday = todayLocalDate(new Date(Date.now() - 86_400_000));

    await seedPlannerDatabase(async (db) => {
      await saveDailyTask(
        db,
        buildDailyTask({ id: 'rolled-1', title: 'Call dentist', activeDate: yesterday }),
      );
    });

    renderWithPlanner(<DashboardPage />);

    expect(await screen.findByLabelText('Mark Call dentist complete')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Move to today' }));

    await waitFor(async () => {
      const todayTasks = screen.getAllByLabelText('Mark Call dentist complete');
      expect(todayTasks.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.queryByRole('heading', { name: 'Rolled over' })).not.toBeInTheDocument();
  });
});
