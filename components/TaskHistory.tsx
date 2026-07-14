import type { Role, Task } from '@/lib/types';
import TaskItem from './TaskItem';

interface TaskHistoryProps {
  role: Role;
  tasks: Task[];
  onUpdateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours'>>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TaskHistory({ role, tasks, onUpdateTask, onDeleteTask }: TaskHistoryProps) {
  const completed = tasks
    .filter((task) => task.status === 'completato')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (completed.length === 0) {
    return null;
  }

  return (
    <section className="rounded-card bg-neutral-50 p-6 shadow-lg">
      <h2 className="mb-4 font-serif text-xl text-neutral-900">Storico task completate ({completed.length})</h2>

      <ul className="flex flex-col gap-3">
        {completed.map((task) => (
          <TaskItem key={task.id} task={task} role={role} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
        ))}
      </ul>
    </section>
  );
}
