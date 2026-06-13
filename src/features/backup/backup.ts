import type { DailyTask, LongTermTask, Step } from '@/entities/planner/types';
import { clearStore, putInStore } from '@/shared/storage/idb';
import { getAllForExport } from '@/shared/storage/repositories/export-repository';
import {
  getAllDailyTasks,
} from '@/shared/storage/repositories/daily-task-repository';
import {
  getAllLongTermTasks,
} from '@/shared/storage/repositories/long-term-task-repository';
import {
  getAllSteps,
} from '@/shared/storage/repositories/step-repository';
import { IMPORT_BLOCKED_MESSAGE } from '@/shared/ui/error-messages';

export const DAYFLOW_BACKUP_VERSION = 1;

export type DayflowBackup = {
  dayflowBackupVersion: number;
  exportedAt: string;
  dailyTasks: DailyTask[];
  longTermTasks: LongTermTask[];
  steps: Step[];
};

export type ImportMode = 'replace' | 'merge';

export class ImportBlockedError extends Error {
  constructor(message = IMPORT_BLOCKED_MESSAGE) {
    super(message);
    this.name = 'ImportBlockedError';
  }
}

export class InvalidBackupError extends Error {
  constructor(message = 'The backup file is invalid. Choose a valid DayFlow backup file.') {
    super(message);
    this.name = 'InvalidBackupError';
  }
}

const ENTITY_STORES = ['daily_tasks', 'long_term_tasks', 'steps'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function validateBackup(data: unknown): data is DayflowBackup {
  if (!isRecord(data)) return false;
  if (data.dayflowBackupVersion !== DAYFLOW_BACKUP_VERSION) return false;
  if (typeof data.exportedAt !== 'string') return false;
  if (!Array.isArray(data.dailyTasks)) return false;
  if (!Array.isArray(data.longTermTasks)) return false;
  if (!Array.isArray(data.steps)) return false;
  return true;
}

export function parseBackupFile(content: string): DayflowBackup | null {
  try {
    const parsed: unknown = JSON.parse(content);
    return validateBackup(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function exportBackup(db: IDBDatabase): Promise<DayflowBackup> {
  const snapshot = await getAllForExport(db);
  return {
    dayflowBackupVersion: DAYFLOW_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    dailyTasks: snapshot.dailyTasks,
    longTermTasks: snapshot.longTermTasks,
    steps: snapshot.steps,
  };
}

async function clearEntityStores(db: IDBDatabase): Promise<void> {
  await Promise.all(ENTITY_STORES.map((store) => clearStore(db, store)));
}

async function bulkWriteBackup(db: IDBDatabase, backup: DayflowBackup): Promise<void> {
  for (const task of backup.dailyTasks) {
    await putInStore(db, 'daily_tasks', task);
  }
  for (const task of backup.longTermTasks) {
    await putInStore(db, 'long_term_tasks', task);
  }
  for (const step of backup.steps) {
    await putInStore(db, 'steps', step);
  }
}

function assertImportAllowed(mode: ImportMode | null | undefined, confirmed: boolean): void {
  if (!mode || !confirmed) {
    throw new ImportBlockedError();
  }
}

export async function importReplace(
  db: IDBDatabase,
  backup: DayflowBackup,
  options: { mode: ImportMode | null | undefined; confirmed: boolean },
): Promise<void> {
  if (!validateBackup(backup)) {
    throw new InvalidBackupError();
  }
  assertImportAllowed(options.mode, options.confirmed);
  if (options.mode !== 'replace') {
    throw new ImportBlockedError();
  }

  await clearEntityStores(db);
  await bulkWriteBackup(db, backup);
}

export type MergeSummary = {
  added: number;
  skipped: number;
};

export async function importMerge(
  db: IDBDatabase,
  backup: DayflowBackup,
  options: { mode: ImportMode | null | undefined; confirmed: boolean },
): Promise<MergeSummary> {
  if (!validateBackup(backup)) {
    throw new InvalidBackupError();
  }
  assertImportAllowed(options.mode, options.confirmed);
  if (options.mode !== 'merge') {
    throw new ImportBlockedError();
  }

  const [existingDailies, existingGoals, existingSteps] = await Promise.all([
    getAllDailyTasks(db),
    getAllLongTermTasks(db),
    getAllSteps(db),
  ]);

  const existingIds = new Set<string>([
    ...existingDailies.map((task) => task.id),
    ...existingGoals.map((task) => task.id),
    ...existingSteps.map((step) => step.id),
  ]);

  let added = 0;
  let skipped = 0;

  for (const task of backup.dailyTasks) {
    if (existingIds.has(task.id)) {
      skipped += 1;
      continue;
    }
    await putInStore(db, 'daily_tasks', task);
    existingIds.add(task.id);
    added += 1;
  }

  for (const task of backup.longTermTasks) {
    if (existingIds.has(task.id)) {
      skipped += 1;
      continue;
    }
    await putInStore(db, 'long_term_tasks', task);
    existingIds.add(task.id);
    added += 1;
  }

  for (const step of backup.steps) {
    if (existingIds.has(step.id)) {
      skipped += 1;
      continue;
    }
    await putInStore(db, 'steps', step);
    existingIds.add(step.id);
    added += 1;
  }

  return { added, skipped };
}
