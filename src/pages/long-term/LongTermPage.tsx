import { useEffect, useState } from 'react';
import type { LongTermTask, Step } from '@/entities/planner/types';
import {
  completeStep,
  deleteLongTermTaskWithConfirm,
  deleteStepWithConfirm,
  editLongTermTaskTitle,
  editStepTitle,
} from '@/features/task-crud';
import { useConfirmDialog } from '@/app/hooks/useConfirmDialog';
import { usePlanner } from '@/app/providers/PlannerProvider';
import { listLongTermTasks } from '@/shared/storage/repositories/long-term-task-repository';
import {
  countCompletedSteps,
  listStepsForGoal,
} from '@/shared/storage/repositories/step-repository';
import { Button, Checkbox, Input, InlineError } from '@/shared/ui';
import { isDomainError } from '@/shared/lib/quick-add';
import styles from './LongTermPage.module.css';

type GoalWithProgress = LongTermTask & { completed: number; total: number };

export function LongTermPage() {
  const { db, refresh, refreshKey } = usePlanner();
  const { confirm, dialog } = useConfirmDialog();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalTitle, setEditGoalTitle] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [stepsByGoal, setStepsByGoal] = useState<Record<string, Step[]>>({});

  useEffect(() => {
    if (!db) return;
    listLongTermTasks(db).then(async (items) => {
      const withProgress = await Promise.all(
        items.map(async (goal) => {
          const { completed, total } = await countCompletedSteps(db, goal.id);
          return { ...goal, completed, total };
        }),
      );
      setGoals(withProgress);
    });
  }, [db, refreshKey]);

  const loadSteps = async (goalId: string) => {
    if (!db) return;
    const steps = await listStepsForGoal(db, goalId);
    setStepsByGoal((prev) => ({ ...prev, [goalId]: steps }));
  };

  const toggleExpand = async (goalId: string) => {
    const next = !expanded[goalId];
    setExpanded((prev) => ({ ...prev, [goalId]: next }));
    if (next) await loadSteps(goalId);
  };

  const handleCompleteStep = async (stepId: string, goalId: string) => {
    if (!db) return;
    await completeStep(db, stepId);
    await loadSteps(goalId);
    await refresh();
  };

  const handleDeleteGoal = async (goal: LongTermTask) => {
    if (!db) return;
    const deleted = await deleteLongTermTaskWithConfirm(db, goal.id, () =>
      confirm('Delete goal?', `Remove "${goal.title}" and all its steps?`),
    );
    if (deleted) await refresh();
  };

  const handleSaveGoalEdit = async (goalId: string) => {
    if (!db) return;
    setEditError(null);
    try {
      await editLongTermTaskTitle(db, goalId, editGoalTitle);
      setEditingGoalId(null);
      await refresh();
    } catch (caught) {
      if (isDomainError(caught)) setEditError(caught.message);
      else throw caught;
    }
  };

  return (
    <section className={styles.page} aria-labelledby="long-term-heading">
      <h1 id="long-term-heading">Long-term</h1>
      {goals.length === 0 ? (
        <p className={styles.empty}>No long-term goals yet. Use ! prefix in quick-add.</p>
      ) : (
        <ul className={styles.list}>
          {goals.map((goal) => (
            <li key={goal.id} className={styles.goal}>
              <div className={styles.goalHeader}>
                <button
                  type="button"
                  className={styles.expand}
                  onClick={() => toggleExpand(goal.id)}
                  aria-expanded={expanded[goal.id] ?? false}
                >
                  {goal.title}
                </button>
                <span className={styles.progress}>
                  {goal.completed} of {goal.total} steps
                </span>
              </div>
              <div className={styles.goalActions}>
                {editingGoalId === goal.id ? (
                  <>
                    <Input
                      value={editGoalTitle}
                      onChange={(e) => setEditGoalTitle(e.target.value)}
                      aria-label="Edit goal title"
                    />
                    <Button onClick={() => handleSaveGoalEdit(goal.id)}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingGoalId(null)}>
                      Cancel
                    </Button>
                    {editError && <InlineError>{editError}</InlineError>}
                  </>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingGoalId(goal.id);
                        setEditGoalTitle(goal.title);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteGoal(goal)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
              {expanded[goal.id] && (
                <StepList
                  steps={stepsByGoal[goal.id] ?? []}
                  onComplete={(stepId) => handleCompleteStep(stepId, goal.id)}
                  onRefresh={async () => {
                    await loadSteps(goal.id);
                    await refresh();
                  }}
                  confirm={confirm}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {dialog}
    </section>
  );
}

function StepList({
  steps,
  onComplete,
  onRefresh,
  confirm,
}: {
  steps: Step[];
  onComplete: (stepId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  confirm: (title: string, message: string) => Promise<boolean>;
}) {
  const { db } = usePlanner();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleDelete = async (step: Step) => {
    if (!db) return;
    const deleted = await deleteStepWithConfirm(db, step.id, () =>
      confirm('Delete step?', `Remove "${step.title}"?`),
    );
    if (deleted) await onRefresh();
  };

  const handleSave = async (stepId: string) => {
    if (!db) return;
    await editStepTitle(db, stepId, editTitle);
    setEditingId(null);
    await onRefresh();
  };

  return (
    <ul className={styles.steps}>
      {steps.map((step) => (
        <li key={step.id} className={styles.step}>
          <Checkbox
            checked={step.completed}
            onChange={() => onComplete(step.id)}
            label={step.title}
          />
          {editingId === step.id ? (
            <>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              <Button onClick={() => handleSave(step.id)}>Save</Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingId(step.id);
                  setEditTitle(step.title);
                }}
              >
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(step)}>
                Delete
              </Button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
