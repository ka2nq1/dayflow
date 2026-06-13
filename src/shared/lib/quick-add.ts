import { DomainError, DomainErrors } from '@/shared/lib/domain-error';

export type QuickAddKind = 'daily' | 'longTerm' | 'step';

export type ParsedQuickAdd = {
  kind: QuickAddKind;
  title: string;
};

export function parseQuickAddEntry(raw: string): ParsedQuickAdd {
  const trimmed = raw.trim();

  if (trimmed.startsWith('!')) {
    const title = trimmed.slice(1).trim();
    return { kind: 'longTerm', title };
  }

  if (trimmed.startsWith('+')) {
    const title = trimmed.slice(1).trim();
    return { kind: 'step', title };
  }

  return { kind: 'daily', title: trimmed };
}

export function validateTitle(title: string): void {
  if (title.trim().length === 0) {
    throw DomainErrors.titleRequired();
  }
}

export function assertCanAddStep(hasLongTermTask: boolean): void {
  if (!hasLongTermTask) {
    throw DomainErrors.noLongTermTaskForStep();
  }
}

export function assertUniqueStepTitle(
  existingTitles: string[],
  candidateTitle: string,
): void {
  if (existingTitles.includes(candidateTitle)) {
    throw DomainErrors.duplicateStepTitle();
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
