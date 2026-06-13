import { useEffect, useState } from 'react';
import type { DailyTask } from '@/entities/planner/types';
import {
  completeDailyTask,
  deleteDailyTaskWithConfirm,
  editDailyTaskTitle,
} from '@/features/task-crud';
import { useConfirmDialog } from '@/app/hooks/useConfirmDialog';
import { usePlanner } from '@/app/providers/PlannerProvider';
import {
  listDailyTasksForDate,
  listRolledOverDailyTasks,
} from '@/shared/storage/repositories/daily-task-repository';
import { Button, Checkbox, Input, InlineError } from '@/shared/ui';
import { isDomainError } from '@/shared/lib/quick-add';
import styles from './DailyTaskList.module.css';

type DailyTaskListProps = {
  variant: 'today' | 'rolledOver';
  title: string;
  showMoveToToday?: boolean;
  onMoveToToday?: (taskId: string) => Promise<void>;
};

export function DailyTaskList({
  variant,
  title,
  showMoveToToday = false,
  onMoveToToday,
}: DailyTaskListProps) {
  const { db, today, refresh, refreshKey } = usePlanner();
  const { confirm, dialog } = useConfirmDialog();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    const load =
      variant === 'today'
        ? listDailyTasksForDate(db, today)
        : listRolledOverDailyTasks(db, today);
    load.then(setTasks);
  }, [db, today, refreshKey, variant]);

  const handleComplete = async (taskId: string) => {
    if (!db) return;
    await completeDailyTask(db, taskId);
    await refresh();
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!db) return;
    setEditError(null);
    try {
      await editDailyTaskTitle(db, taskId, editTitle);
      setEditingId(null);
      await refresh();
    } catch (caught) {
      if (isDomainError(caught)) {
        setEditError(caught.message);
      } else {
        throw caught;
      }
    }
  };

  const handleDelete = async (task: DailyTask) => {
    if (!db) return;
    const deleted = await deleteDailyTaskWithConfirm(db, task.id, () =>
      confirm('Delete task?', `Remove "${task.title}" from your list?`),
    );
    if (deleted) await refresh();
  };

  if (tasks.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`} className={styles.heading}>
        {title}
      </h2>
      <ul className={styles.list}>
        {tasks.map((task) => (
          <li key={task.id} className={styles.item}>
            <Checkbox
              checked={task.completed}
              onChange={() => handleComplete(task.id)}
              label={task.title}
              aria-label={`Mark ${task.title} complete`}
            />
            {editingId === task.id ? (
              <div className={styles.editRow}>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label="Edit task title"
                />
                <Button onClick={() => handleSaveEdit(task.id)}>Save</Button>
                <Button variant="secondary" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
                {editError && <InlineError>{editError}</InlineError>}
              </div>
            ) : (
              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingId(task.id);
                    setEditTitle(task.title);
                    setEditError(null);
                  }}
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(task)}>
                  Delete
                </Button>
                {showMoveToToday && onMoveToToday && (
                  <Button variant="secondary" onClick={() => onMoveToToday(task.id)}>
                    Move to today
                  </Button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {dialog}
    </section>
  );
}
