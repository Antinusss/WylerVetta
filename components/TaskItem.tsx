'use client';

import { useState } from 'react';
import type { Role, Task, Impact, Urgency, TaskOwner, TaskStatus } from '@/lib/types';
import CompleteTaskModal from './CompleteTaskModal';

interface TaskItemProps {
  task: Task;
  rank?: number;
  role: Role;
  onUpdateTask: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours' | 'completed_on'>>
  ) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  non_iniziato: 'bg-rose/15 text-rose',
  in_corso: 'bg-amber/15 text-amber',
  completato: 'bg-sage/15 text-sage',
  on_hold: 'bg-violet/15 text-violet',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  non_iniziato: 'Da fare',
  in_corso: 'In corso',
  completato: 'Completato',
  on_hold: 'On hold',
};

const LEVEL_STYLES: Record<Impact | Urgency, string> = {
  bassa: 'bg-skyblue/15 text-skyblue',
  media: 'bg-amber/15 text-amber',
  alta: 'bg-rose/15 text-rose',
};

const OWNER_STYLES: Record<TaskOwner, string> = {
  Leonardo: 'bg-gold/20 text-gold',
  Amina: 'bg-violet/20 text-violet',
};

export default function TaskItem({ task, rank, role, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const isOwnerRole = role === 'owner';
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  function handleStatusChange(value: TaskStatus) {
    if (value === 'completato' && task.status !== 'completato') {
      setShowCompleteModal(true);
      return;
    }
    onUpdateTask(task.id, { status: value }).catch(() => {});
  }

  function handleCompleteConfirm(hours: number) {
    const today = new Date().toISOString().slice(0, 10);
    onUpdateTask(task.id, { status: 'completato', hours, completed_on: today }).catch(() => {});
    setShowCompleteModal(false);
  }

  return (
    <li className="flex items-start gap-4 border-b border-neutral-200 py-4 last:border-0">
      {rank !== undefined && (
        <span className="w-6 shrink-0 pt-1 text-center font-serif text-xl text-gold">{rank}</span>
      )}

      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-900">{task.title}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
          <span className="uppercase tracking-wide text-neutral-400">Imp.</span>
          <select
            value={task.impact}
            onChange={(e) => onUpdateTask(task.id, { impact: e.target.value as Impact }).catch(() => {})}
            className={`rounded-full border-none px-3 py-0.5 font-medium ${LEVEL_STYLES[task.impact]}`}
          >
            <option value="bassa">Bassa</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>

          <span className="uppercase tracking-wide text-neutral-400">Urg.</span>
          <select
            value={task.urgency}
            onChange={(e) => onUpdateTask(task.id, { urgency: e.target.value as Urgency }).catch(() => {})}
            className={`rounded-full border-none px-3 py-0.5 font-medium ${LEVEL_STYLES[task.urgency]}`}
          >
            <option value="bassa">Bassa</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>

          <span className="uppercase tracking-wide text-neutral-400">Owner</span>
          <select
            value={task.owner}
            onChange={(e) => onUpdateTask(task.id, { owner: e.target.value as TaskOwner }).catch(() => {})}
            className={`rounded-full border-none px-3 py-0.5 font-medium ${OWNER_STYLES[task.owner]}`}
          >
            <option value="Leonardo">Leonardo</option>
            <option value="Amina">Amina</option>
          </select>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {isOwnerRole ? (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className={`rounded-full border-none px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[task.status]}`}
          >
            <option value="non_iniziato">Da fare</option>
            <option value="in_corso">In corso</option>
            <option value="completato">Completato</option>
            <option value="on_hold">On hold</option>
          </select>
        ) : (
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[task.status]}`}>
            {STATUS_LABELS[task.status]}
          </span>
        )}

        {isOwnerRole && (
          <button onClick={() => onDeleteTask(task.id).catch(() => {})} className="text-xs text-rose hover:underline">
            Elimina
          </button>
        )}
      </div>

      {showCompleteModal && (
        <CompleteTaskModal
          taskTitle={task.title}
          onCancel={() => setShowCompleteModal(false)}
          onConfirm={handleCompleteConfirm}
        />
      )}
    </li>
  );
}
