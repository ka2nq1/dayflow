import { describe, expect, it } from 'vitest';
import {
  assertCanAddStep,
  assertUniqueStepTitle,
  parseQuickAddEntry,
  validateTitle,
} from '@/shared/lib/quick-add';
import { DomainErrors } from '@/shared/lib/domain-error';

describe('parseQuickAddEntry', () => {
  it('creates daily task from plain text (AC-01, AC-16)', () => {
    expect(parseQuickAddEntry('Buy milk')).toEqual({ kind: 'daily', title: 'Buy milk' });
  });

  it('strips whitespace after prefix (AC-16)', () => {
    expect(parseQuickAddEntry('!  Launch side project')).toEqual({
      kind: 'longTerm',
      title: 'Launch side project',
    });
    expect(parseQuickAddEntry('+  Register domain')).toEqual({
      kind: 'step',
      title: 'Register domain',
    });
  });

  it('creates long-term task from exclamation prefix (AC-02)', () => {
    expect(parseQuickAddEntry('!Launch side project')).toEqual({
      kind: 'longTerm',
      title: 'Launch side project',
    });
  });

  it('creates step from plus prefix (AC-03)', () => {
    expect(parseQuickAddEntry('+Register domain')).toEqual({
      kind: 'step',
      title: 'Register domain',
    });
  });

  it('treats unrecognized prefix as daily task (AC-16)', () => {
    expect(parseQuickAddEntry('?Launch side project')).toEqual({
      kind: 'daily',
      title: '?Launch side project',
    });
  });
});

describe('validateTitle', () => {
  it('blocks empty quick-add (AC-05)', () => {
    expect(() => validateTitle('')).toThrow(DomainErrors.titleRequired());
    expect(() => validateTitle('   ')).toThrow(DomainErrors.titleRequired());
  });

  it('blocks blank edit save (AC-14)', () => {
    expect(() => validateTitle('\n\t')).toThrow(DomainErrors.titleRequired());
  });
});

describe('assertCanAddStep', () => {
  it('blocks step when no long-term task exists (AC-06)', () => {
    expect(() => assertCanAddStep(false)).toThrow(DomainErrors.noLongTermTaskForStep());
  });
});

describe('assertUniqueStepTitle', () => {
  it('blocks duplicate step title within goal (AC-08)', () => {
    expect(() => assertUniqueStepTitle(['Register domain'], 'Register domain')).toThrow(
      DomainErrors.duplicateStepTitle(),
    );
  });
});

describe('duplicate daily titles allowed (AC-20)', () => {
  it('does not deduplicate daily titles at domain layer', () => {
    const first = parseQuickAddEntry('Buy milk');
    const second = parseQuickAddEntry('Buy milk');
    expect(first).toEqual(second);
    expect(() => validateTitle(first.title)).not.toThrow();
    expect(() => validateTitle(second.title)).not.toThrow();
  });
});
