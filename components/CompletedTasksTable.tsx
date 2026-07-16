import type { Role, Task } from '@/lib/types';

interface CompletedTasksTableProps {
  role: Role;
  tasks: Task[];
  onUpdateTask: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours' | 'completed_on'>>
  ) => Promise<void>;
}

function monthLabel(completedOn: string | null, fallback: string): string {
  const date = new Date(completedOn ?? fallback);
  return date.toLocaleDateString('it-IT', { month: 'long' });
}

export default function CompletedTasksTable({ role, tasks, onUpdateTask }: CompletedTasksTableProps) {
  const completed = tasks.filter((task) => task.status === 'completato');

  if (completed.length === 0) {
    return null;
  }

  const sorted = [...completed].sort((a, b) => {
    const aDate = a.completed_on ?? a.created_at;
    const bDate = b.completed_on ?? b.created_at;
    return new Date(aDate).getTime() - new Date(bDate).getTime();
  });

  const total = completed.reduce((sum, task) => sum + task.hours, 0);
  const isOwnerRole = role === 'owner';

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gold/10 text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-4 py-3 text-left font-medium">Attività svolte</th>
            <th className="px-4 py-3 text-center font-medium">Mese</th>
            <th className="px-4 py-3 text-right font-medium">Ore</th>
            {isOwnerRole && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => (
            <tr key={task.id} className="border-t border-neutral-200">
              <td className="px-4 py-3 text-neutral-900">{task.title}</td>
              <td className="px-4 py-3 text-center">
                <span className="rounded-full bg-skyblue/15 px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-skyblue">
                  {monthLabel(task.completed_on, task.created_at)}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-mono text-neutral-900">{task.hours}</td>
              {isOwnerRole && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onUpdateTask(task.id, { status: 'non_iniziato' }).catch(() => {})}
                    title="Riporta a Non iniziato"
                    className="text-sm text-neutral-400 hover:text-rose"
                  >
                    ↺
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-neutral-200 bg-gold/10">
            <td className="px-4 py-3 font-serif font-bold text-neutral-900">Totale</td>
            <td />
            <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">{total}</td>
            {isOwnerRole && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
