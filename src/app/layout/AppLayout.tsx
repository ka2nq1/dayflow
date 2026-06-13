import { NavLink, Outlet } from 'react-router-dom';
import { EmptyStateBanner } from '@/app/components/EmptyStateBanner';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <span className={styles.logo}>DayFlow</span>
        <nav className={styles.nav} aria-label="Main">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
            end
          >
            Today
          </NavLink>
          <NavLink
            to="/long-term"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Long-term
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            Settings
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <EmptyStateBanner />
        <Outlet />
      </main>
    </div>
  );
}
