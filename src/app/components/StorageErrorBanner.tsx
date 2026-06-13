import { Link } from 'react-router-dom';
import { usePlanner } from '@/app/providers/PlannerProvider';
import styles from './StorageErrorBanner.module.css';

export function StorageErrorBanner() {
  const { storageError } = usePlanner();
  if (!storageError) return null;

  return (
    <aside className={styles.banner} role="alert">
      <p>
        {storageError}{' '}
        <Link to="/settings">Import a backup</Link> if you have one from another device.
      </p>
    </aside>
  );
}
