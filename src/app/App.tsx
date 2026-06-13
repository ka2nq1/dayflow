import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { PlannerProvider } from '@/app/providers/PlannerProvider';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

export function App() {
  return (
    <PlannerProvider>
      <BrowserRouter basename={routerBasename || undefined}>
        <AppRoutes />
      </BrowserRouter>
    </PlannerProvider>
  );
}
