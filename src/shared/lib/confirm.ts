export type ConfirmFn = () => Promise<boolean>;

export async function withConfirm(
  confirm: ConfirmFn,
  action: () => Promise<void>,
): Promise<boolean> {
  const confirmed = await confirm();
  if (!confirmed) {
    return false;
  }
  await action();
  return true;
}
