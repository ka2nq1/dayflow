import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/shared/ui';

type PendingConfirm = {
  title: string;
  message: string;
  resolve: (confirmed: boolean) => void;
};

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (title: string, message: string) =>
      new Promise<boolean>((resolve) => {
        setPending({ title, message, resolve });
      }),
    [],
  );

  const handleConfirm = () => {
    pending?.resolve(true);
    setPending(null);
  };

  const handleCancel = () => {
    pending?.resolve(false);
    setPending(null);
  };

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={pending?.title ?? ''}
      message={pending?.message ?? ''}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}
