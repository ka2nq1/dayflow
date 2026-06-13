import { Link } from 'react-router-dom';
import { usePlanner } from '@/app/providers/PlannerProvider';
import styles from './EmptyStateBanner.module.css';

export function EmptyStateBanner() {
  const { isEmpty, ready } = usePlanner();
  if (!ready || !isEmpty) return null;

  return (
    <aside className={styles.banner} role="status">
      <p>
        Your planner is empty. Start capturing tasks above, or{' '}
        <Link to="/settings">import a backup</Link> to recover data from another device.
      </p>
    </aside>
  );
}
