import { beforeEach, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from './SettingsPage';
import { renderWithPlanner, seedPlannerDatabase } from '@/test/render-planner';

describe('SettingsPage', () => {
  beforeEach(async () => {
    await seedPlannerDatabase(async () => undefined);
  });

  it('renders export and import controls (AC-10)', async () => {
    renderWithPlanner(<SettingsPage />, '/settings');
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download backup' })).toBeInTheDocument();
  });

  it('blocks import until file is selected (AC-07)', async () => {
    renderWithPlanner(<SettingsPage />, '/settings');
    await screen.findByRole('heading', { name: 'Settings' });

    expect(screen.getByRole('button', { name: 'Replace' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Merge' })).toBeDisabled();
  });

  it('shows invalid backup error without changing data (AC-15)', async () => {
    const user = userEvent.setup();
    renderWithPlanner(<SettingsPage />, '/settings');
    await screen.findByRole('heading', { name: 'Settings' });

    const fileInput = screen.getByLabelText('Select backup file');
    const file = new File(['not json'], 'bad.json', { type: 'application/json' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: 'Merge' }));
    await user.click(await screen.findByRole('button', { name: 'Confirm' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/invalid/i);
    expect(screen.queryByText(/merge complete/i)).not.toBeInTheDocument();
  });
});
