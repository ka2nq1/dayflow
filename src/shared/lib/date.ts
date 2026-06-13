export function generateId(): string {
  return crypto.randomUUID();
}

export function todayLocalDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toCalendarDay(date: Date): string {
  return todayLocalDate(date);
}

export function compareByCreatedAtAsc<T extends { createdAt: string }>(a: T, b: T): number {
  return a.createdAt.localeCompare(b.createdAt);
}
