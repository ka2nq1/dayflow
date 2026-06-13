import { useEffect, useRef, useState } from 'react';
import { useQuickAdd } from '@/features/quick-add';
import { usePlanner } from '@/app/providers/PlannerProvider';
import type { DomainErrorCode } from '@/shared/lib/domain-error';
import { DOMAIN_ERROR_MESSAGES, Input, InlineError } from '@/shared/ui';
import styles from './QuickAddForm.module.css';

export function QuickAddForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const { db, today, refresh } = usePlanner();
  const { submit, error, clearError } = useQuickAdd(db, today);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    const ok = await submit(value);
    if (ok) {
      setValue('');
      await refresh();
      inputRef.current?.focus();
    }
  };

  const errorMessage = error
    ? DOMAIN_ERROR_MESSAGES[error.code as DomainErrorCode] ?? error.message
    : null;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          clearError();
          setValue(e.target.value);
        }}
        placeholder="Add task… (! goal, + step)"
        aria-label="Quick add task"
      />
      {errorMessage && <InlineError>{errorMessage}</InlineError>}
    </form>
  );
}
