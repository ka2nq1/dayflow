import { useRef, useState } from 'react';
import {
  exportBackup,
  importMerge,
  importReplace,
  parseBackupFile,
  InvalidBackupError,
  ImportBlockedError,
  type ImportMode,
} from '@/features/backup';
import { useConfirmDialog } from '@/app/hooks/useConfirmDialog';
import { usePlanner } from '@/app/providers/PlannerProvider';
import { Button, InlineError } from '@/shared/ui';
import { BACKUP_INVALID_MESSAGE, IMPORT_BLOCKED_MESSAGE } from '@/shared/ui';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { db, refresh } = usePlanner();
  const { confirm, dialog } = useConfirmDialog();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleExport = async () => {
    if (!db) return;
    setError(null);
    const backup = await exportBackup(db);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dayflow-backup-${backup.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSuccess('Backup downloaded.');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    setPendingFile(event.target.files?.[0] ?? null);
  };

  const runImport = async (mode: ImportMode) => {
    if (!db || !pendingFile) return;
    setError(null);
    setSuccess(null);

    const confirmed = await confirm(
      mode === 'replace' ? 'Replace all data?' : 'Merge backup?',
      mode === 'replace'
        ? 'All on-device tasks will be replaced by the backup. This cannot be undone.'
        : 'Backup records will be merged with existing data. Duplicates by id are skipped.',
    );
    if (!confirmed) return;

    try {
      const text = await pendingFile.text();
      const backup = parseBackupFile(text);
      if (!backup) {
        setError(BACKUP_INVALID_MESSAGE);
        return;
      }
      if (mode === 'replace') {
        await importReplace(db, backup, { mode, confirmed: true });
        setSuccess('Backup replaced on-device data.');
      } else {
        const summary = await importMerge(db, backup, { mode, confirmed: true });
        setSuccess(`Merge complete. Added ${summary.added}; skipped ${summary.skipped} duplicates.`);
      }
      setPendingFile(null);
      if (fileRef.current) fileRef.current.value = '';
      await refresh();
    } catch (caught) {
      if (caught instanceof InvalidBackupError) {
        setError(BACKUP_INVALID_MESSAGE);
      } else if (caught instanceof ImportBlockedError) {
        setError(IMPORT_BLOCKED_MESSAGE);
      } else {
        throw caught;
      }
    }
  };

  return (
    <section className={styles.page} aria-labelledby="settings-heading">
      <h1 id="settings-heading">Settings</h1>

      <div className={styles.block}>
        <h2>Backup</h2>
        <p className={styles.hint}>Export your tasks to move them to another device.</p>
        <Button onClick={handleExport}>Download backup</Button>
      </div>

      <div className={styles.block}>
        <h2>Restore</h2>
        <p className={styles.hint}>Choose a DayFlow backup file, then pick replace or merge.</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelect}
          aria-label="Select backup file"
        />
        <div className={styles.actions}>
          <Button
            variant="danger"
            disabled={!pendingFile}
            onClick={() => runImport('replace')}
          >
            Replace
          </Button>
          <Button disabled={!pendingFile} onClick={() => runImport('merge')}>
            Merge
          </Button>
        </div>
      </div>

      {error && <InlineError>{error}</InlineError>}
      {success && <p className={styles.success}>{success}</p>}
      {dialog}
    </section>
  );
}
