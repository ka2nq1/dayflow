import type { DomainErrorCode } from '@/shared/lib/domain-error';

export const DOMAIN_ERROR_MESSAGES: Record<DomainErrorCode, string> = {
  TITLE_REQUIRED: 'A task title is required.',
  NO_LONG_TERM_TASK_FOR_STEP: 'Create a long-term task first using the ! prefix.',
  DUPLICATE_STEP_TITLE: 'Step titles must be unique within a long-term task.',
};

export const BACKUP_INVALID_MESSAGE =
  'The backup file is invalid. Choose a valid DayFlow backup file.';

export const IMPORT_BLOCKED_MESSAGE =
  'Choose replace or merge and confirm before importing.';
