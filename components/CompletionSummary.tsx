import type { Role, Task, TaskStatus } from '@/lib/types';
import { completionPercent } from '@/lib/calculations';
import TaskItem from './TaskItem';

interface CompletionSummaryProps {
  role: Role;
  tasks: Task[];
  onUpdateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours'>>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  non_iniziato: 'Non iniziato',
  in_corso: 'In corso',
  completato: 'Completato',
  on_hold: 'On hold',
};

export default function CompletionSummary({ role, tasks, onUpdateTask, onDeleteTask }: CompletionSummaryProps) {
  const completedTasks = tasks
    .filter((t) => t.status === 'completato')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const completed = completedTasks.length;
  const percent = completionPercent(tasks);

  const breakdown = (Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <section className="rounded-card bg-neutral-50 p-6 shadow-lg">
      <h2 className="mb-4 font-serif text-xl text-neutral-900">Task completate</h2>

      <p className="mb-2 font-mono text-lg text-neutral-900">
        {completed} / {tasks.length} ({percent.toFixed(0)}%)
      </p>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-sage transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>

      <ul className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
        {breakdown.map((b) => (
          <li key={b.status}>
            {b.label}: {b.count}
          </li>
        ))}
      </ul>

      {completedTasks.length > 0 && (
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <h3 className="mb-3 font-serif text-lg text-neutral-900">Elenco task completate</h3>
          <ul className="flex flex-col gap-3">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} role={role} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
