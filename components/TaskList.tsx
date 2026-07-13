'use client';

import { useState } from 'react';
import type { Role, Task, Impact, Urgency, TaskOwner } from '@/lib/types';
import { sortTasksByPriority } from '@/lib/calculations';
import TaskItem from './TaskItem';

interface TaskListProps {
  role: Role;
  tasks: Task[];
  onAddTask: (title: string, impact: Impact, urgency: Urgency, owner: TaskOwner) => Promise<void>;
  onUpdateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours'>>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TaskList({ role, tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState<Impact>('media');
  const [urgency, setUrgency] = useState<Urgency>('media');
  const [owner, setOwner] = useState<TaskOwner>('Leonardo');

  const sorted = sortTasksByPriority(tasks);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await onAddTask(title.trim(), impact, urgency, owner);
      setTitle('');
      setImpact('media');
      setUrgency('media');
      setOwner('Leonardo');
    } catch {
      // failed to add task; keep the form filled so the user can retry
    }
  }

  return (
    <section className="rounded-card bg-neutral-50 p-6 shadow-lg">
      <h2 className="mb-4 font-serif text-xl text-neutral-900">Task</h2>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-neutral-500">Titolo</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Impatto</label>
          <select value={impact} onChange={(e) => setImpact(e.target.value as Impact)} className="rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900">
            <option value="bassa">Bassa</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Urgenza</label>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)} className="rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900">
            <option value="bassa">Bassa</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Owner</label>
          <select value={owner} onChange={(e) => setOwner(e.target.value as TaskOwner)} className="rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900">
            <option value="Leonardo">Leonardo</option>
            <option value="Amina">Amina</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90">
          + Aggiungi task
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {sorted.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            rank={index + 1}
            role={role}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </ul>
    </section>
  );
}
