import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { LongTermPage } from '@/pages/long-term/LongTermPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { AppLayout } from '@/app/layout/AppLayout';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/long-term" element={<LongTermPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
