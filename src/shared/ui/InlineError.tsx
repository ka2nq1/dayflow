import type { ReactNode } from 'react';
import styles from './InlineError.module.css';

type InlineErrorProps = {
  children: ReactNode;
};

export function InlineError({ children }: InlineErrorProps) {
  return (
    <div className={styles.banner} role="alert">
      {children}
    </div>
  );
}
