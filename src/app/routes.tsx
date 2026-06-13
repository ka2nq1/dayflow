import { Route, Routes } from 'react-router-dom';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>Dashboard placeholder</h1>} />
      <Route path="/long-term" element={<h1>Long-term placeholder</h1>} />
    </Routes>
  );
}
