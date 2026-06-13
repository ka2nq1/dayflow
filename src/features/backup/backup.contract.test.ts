import { describe, expect, it } from 'vitest';
import { validateBackup } from '@/features/backup/backup';
import { buildBackupFile, buildDailyTask, buildLongTermTask, buildStep } from '@/test/fixtures';

describe('backup contract v1', () => {
  it('accepts a complete valid v1 backup fixture (AC-10)', () => {
    const goal = buildLongTermTask({ id: 'goal-1', title: 'Example goal' });
    const backup = buildBackupFile({
      dailyTasks: [
        buildDailyTask({
          id: 'daily-1',
          title: 'Test task',
          activeDate: '2026-06-13',
          completed: false,
          createdAt: '2026-06-13T09:00:00.000Z',
        }),
      ],
      longTermTasks: [goal],
      steps: [
        buildStep({
          id: 'step-1',
          longTermTaskId: goal.id,
          title: 'Example step',
          completed: false,
          createdAt: '2026-06-13T10:00:00.000Z',
        }),
      ],
    });

    expect(validateBackup(backup)).toBe(true);
    expect(backup).toMatchObject({
      dayflowBackupVersion: 1,
      exportedAt: expect.any(String),
      dailyTasks: [
        expect.objectContaining({
          id: 'daily-1',
          title: 'Test task',
          activeDate: '2026-06-13',
          completed: false,
          createdAt: expect.any(String),
        }),
      ],
      longTermTasks: [expect.objectContaining({ id: 'goal-1', title: 'Example goal' })],
      steps: [
        expect.objectContaining({
          id: 'step-1',
          longTermTaskId: 'goal-1',
          title: 'Example step',
          completed: false,
        }),
      ],
    });
  });

  it('rejects backups with malformed entity records (AC-19)', () => {
    const invalidDaily = buildBackupFile({
      dailyTasks: [{ id: 'x', title: '', activeDate: '2026-06-13', completed: false, createdAt: 'x' }],
    });
    expect(validateBackup(invalidDaily)).toBe(false);

    const invalidStep = buildBackupFile({
      steps: [
        {
          id: 'step-1',
          longTermTaskId: 'goal-1',
          title: '   ',
          completed: false,
          createdAt: '2026-06-13T10:00:00.000Z',
        },
      ],
    });
    expect(validateBackup(invalidStep)).toBe(false);
  });
});
