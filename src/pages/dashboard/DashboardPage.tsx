import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRollover } from '@/features/rollover';
import { usePlanner } from '@/app/providers/PlannerProvider';
import { QuickAddForm } from './QuickAddForm';
import { DailyTaskList } from './DailyTaskList';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { db, today, refresh } = usePlanner();
  const rollover = useRollover(db, today);

  useEffect(() => {
    if (!db) return;
    void rollover.runDayTransition().then(() => refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per mount/day
  }, [db, today]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 id="dashboard-heading">Today</h1>
        <Link to="/long-term" className={styles.link}>
          Long-term goals →
        </Link>
      </header>
      <QuickAddForm />
      <DailyTaskList variant="today" title="Today" />
      <DailyTaskList
        variant="rolledOver"
        title="Rolled over"
        showMoveToToday
        onMoveToToday={async (id) => {
          await rollover.moveToToday(id);
          await refresh();
        }}
      />
    </div>
  );
}
