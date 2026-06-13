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

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDailyTask(value: unknown): value is DailyTask {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    isNonEmptyString(value.title) &&
    typeof value.activeDate === 'string' &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'string'
  );
}

function isValidLongTermTask(value: unknown): value is LongTermTask {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    isNonEmptyString(value.title) &&
    typeof value.createdAt === 'string'
  );
}

function isValidStep(value: unknown): value is Step {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.longTermTaskId === 'string' &&
    isNonEmptyString(value.title) &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'string'
  );
}

export function validateBackup(data: unknown): data is DayflowBackup {
  if (!isRecord(data)) return false;
  if (data.dayflowBackupVersion !== DAYFLOW_BACKUP_VERSION) return false;
  if (typeof data.exportedAt !== 'string') return false;
  if (!Array.isArray(data.dailyTasks)) return false;
  if (!Array.isArray(data.longTermTasks)) return false;
  if (!Array.isArray(data.steps)) return false;
  if (!data.dailyTasks.every(isValidDailyTask)) return false;
  if (!data.longTermTasks.every(isValidLongTermTask)) return false;
  if (!data.steps.every(isValidStep)) return false;
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

  const existingDailyIds = new Set(existingDailies.map((task) => task.id));
  const existingGoalIds = new Set(existingGoals.map((task) => task.id));
  const existingStepIds = new Set(existingSteps.map((step) => step.id));

  let added = 0;
  let skipped = 0;

  for (const task of backup.dailyTasks) {
    if (existingDailyIds.has(task.id)) {
      skipped += 1;
      continue;
    }
    await putInStore(db, 'daily_tasks', task);
    existingDailyIds.add(task.id);
    added += 1;
  }

  for (const task of backup.longTermTasks) {
    if (existingGoalIds.has(task.id)) {
      skipped += 1;
      continue;
    }
    await putInStore(db, 'long_term_tasks', task);
    existingGoalIds.add(task.id);
    added += 1;
  }

  for (const step of backup.steps) {
    if (existingStepIds.has(step.id)) {
      skipped += 1;
      continue;
    }
    await putInStore(db, 'steps', step);
    existingStepIds.add(step.id);
    added += 1;
  }

  return { added, skipped };
}
