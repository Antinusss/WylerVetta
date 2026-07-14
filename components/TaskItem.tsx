'use client';

import type { Role, Task, Impact, Urgency, TaskOwner, TaskStatus } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  rank?: number;
  role: Role;
  onUpdateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours'>>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  non_iniziato: 'bg-neutral-300 text-neutral-800',
  in_corso: 'bg-amber text-neutral-950',
  completato: 'bg-sage text-neutral-950',
  on_hold: 'bg-violet text-neutral-50',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  non_iniziato: 'Non iniziato',
  in_corso: 'In corso',
  completato: 'Completato',
  on_hold: 'On hold',
};

const LEVEL_STYLES: Record<Impact | Urgency, string> = {
  bassa: 'text-skyblue',
  media: 'text-amber',
  alta: 'text-rose',
};

const OWNER_STYLES: Record<TaskOwner, string> = {
  Leonardo: 'bg-gold/20 text-gold',
  Amina: 'bg-violet/20 text-violet',
};

export default function TaskItem({ task, rank, role, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const isOwnerRole = role === 'owner';

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-baseline gap-3">
        {rank !== undefined && <span className="font-mono text-sm text-neutral-400">#{rank}</span>}
        <span className="font-medium text-neutral-900">{task.title}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          value={task.impact}
          onChange={(e) => onUpdateTask(task.id, { impact: e.target.value as Impact }).catch(() => {})}
          className={`rounded border border-neutral-300 bg-transparent px-1 ${LEVEL_STYLES[task.impact]}`}
        >
          <option value="bassa">Impatto: Bassa</option>
          <option value="media">Impatto: Media</option>
          <option value="alta">Impatto: Alta</option>
        </select>

        <select
          value={task.urgency}
          onChange={(e) => onUpdateTask(task.id, { urgency: e.target.value as Urgency }).catch(() => {})}
          className={`rounded border border-neutral-300 bg-transparent px-1 ${LEVEL_STYLES[task.urgency]}`}
        >
          <option value="bassa">Urgenza: Bassa</option>
          <option value="media">Urgenza: Media</option>
          <option value="alta">Urgenza: Alta</option>
        </select>

        <select
          value={task.owner}
          onChange={(e) => onUpdateTask(task.id, { owner: e.target.value as TaskOwner }).catch(() => {})}
          className={`rounded px-2 py-0.5 ${OWNER_STYLES[task.owner]}`}
        >
          <option value="Leonardo">Owner: Leonardo</option>
          <option value="Amina">Owner: Amina</option>
        </select>

        {isOwnerRole ? (
          <select
            value={task.status}
            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as TaskStatus }).catch(() => {})}
            className={`rounded px-2 py-0.5 ${STATUS_STYLES[task.status]}`}
          >
            <option value="non_iniziato">Stato: Non iniziato</option>
            <option value="in_corso">Stato: In corso</option>
            <option value="completato">Stato: Completato</option>
            <option value="on_hold">Stato: On hold</option>
          </select>
        ) : (
          <span className={`rounded px-2 py-0.5 ${STATUS_STYLES[task.status]}`}>Stato: {STATUS_LABELS[task.status]}</span>
        )}

        {isOwnerRole ? (
          <label className="flex items-center gap-1 text-neutral-500">
            Ore:
            <input
              type="number"
              step="0.5"
              min="0"
              value={task.hours}
              onChange={(e) => onUpdateTask(task.id, { hours: parseFloat(e.target.value) || 0 }).catch(() => {})}
              className="w-16 rounded border border-neutral-300 px-1 font-mono text-neutral-900"
            />
          </label>
        ) : (
          <span className="font-mono text-neutral-500">Ore: {task.hours}h</span>
        )}

        {isOwnerRole && (
          <button onClick={() => onDeleteTask(task.id).catch(() => {})} className="text-rose hover:underline">
            Elimina
          </button>
        )}
      </div>
    </li>
  );
}
