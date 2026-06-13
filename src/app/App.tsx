import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/app/routes';
import { PlannerProvider } from '@/app/providers/PlannerProvider';

export function App() {
  return (
    <PlannerProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </PlannerProvider>
  );
}
