import type { InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function Checkbox({ label, id, className, ...props }: CheckboxProps) {
  const checkboxId = id ?? `checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <label className={[styles.label, className].filter(Boolean).join(' ')} htmlFor={checkboxId}>
      <input type="checkbox" id={checkboxId} className={styles.input} {...props} />
      <span className={styles.box} aria-hidden="true" />
      <span className={styles.text}>{label}</span>
    </label>
  );
}
