export type DomainErrorCode =
  | 'TITLE_REQUIRED'
  | 'NO_LONG_TERM_TASK_FOR_STEP'
  | 'DUPLICATE_STEP_TITLE';

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export const DomainErrors = {
  titleRequired: () =>
    new DomainError('TITLE_REQUIRED', 'A task title is required.'),
  noLongTermTaskForStep: () =>
    new DomainError(
      'NO_LONG_TERM_TASK_FOR_STEP',
      'Create a long-term task first using the ! prefix.',
    ),
  duplicateStepTitle: () =>
    new DomainError(
      'DUPLICATE_STEP_TITLE',
      'Step titles must be unique within a long-term task.',
    ),
} as const;
