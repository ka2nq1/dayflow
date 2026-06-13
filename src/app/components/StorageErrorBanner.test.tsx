import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlannerProvider } from '@/app/providers/PlannerProvider';
import { AppLayout } from '@/app/layout/AppLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

vi.mock('@/shared/storage/db', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/storage/db')>();
  return {
    ...actual,
    openDatabase: vi.fn().mockRejectedValue(new Error('IndexedDB blocked')),
  };
});

describe('StorageErrorBanner', () => {
  it('shows storage error with backup import link when database open fails', async () => {
    render(
      <PlannerProvider>
        <MemoryRouter>
          <AppLayout />
        </MemoryRouter>
      </PlannerProvider>,
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/local storage is unavailable/i);
    expect(screen.getByRole('link', { name: /import a backup/i })).toHaveAttribute(
      'href',
      '/settings',
    );
  });
});

describe('PlannerProvider storage error', () => {
  it('renders dashboard without crashing when storage is unavailable', async () => {
    render(
      <PlannerProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </PlannerProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    });
  });
});
