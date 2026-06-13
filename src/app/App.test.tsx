import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlannerProvider } from '@/app/providers/PlannerProvider';
import { AppRoutes } from '@/app/routes';

function renderAt(path: string) {
  return render(
    <PlannerProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </PlannerProvider>,
  );
}

describe('App shell', () => {
  it('renders dashboard placeholder route', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
  });

  it('renders long-term placeholder route', () => {
    renderAt('/long-term');
    expect(screen.getByRole('heading', { name: 'Long-term' })).toBeInTheDocument();
  });
});
