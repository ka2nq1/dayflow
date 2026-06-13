import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PlannerProvider } from '@/app/providers/PlannerProvider';
import { DashboardPage } from './DashboardPage';

function renderDashboard() {
  return render(
    <PlannerProvider>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </PlannerProvider>,
  );
}

describe('DashboardPage', () => {
  it('shows quick-add field and today heading', async () => {
    renderDashboard();
    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByLabelText('Quick add task')).toBeInTheDocument();
  });

  it('shows inline error on empty quick-add submit (AC-05)', async () => {
    const user = userEvent.setup();
    renderDashboard();
    const input = await screen.findByLabelText('Quick add task');
    await user.click(input);
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('A task title is required.');
  });
});
