'use client';

import { useState } from 'react';
import type { Role, Task, Impact, Urgency, TaskOwner } from '@/lib/types';
import { sortTasksByPriority } from '@/lib/calculations';
import TaskItem from './TaskItem';
import AddTaskModal from './AddTaskModal';

interface TaskListProps {
  role: Role;
  tasks: Task[];
  onAddTask: (title: string, impact: Impact, urgency: Urgency, owner: TaskOwner) => Promise<void>;
  onUpdateTask: (
    id: string,
    patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours' | 'completed_on'>>
  ) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

export default function TaskList({ role, tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  const active = sortTasksByPriority(tasks).filter((task) => task.status !== 'completato');

  return (
    <section className="rounded-card bg-neutral-50 p-6 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-serif text-xl text-neutral-900">Task</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90"
        >
          + Aggiungi task
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose" /> Da fare
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber" /> In corso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sage" /> Completato
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet" /> On hold
        </span>
      </div>

      <ul className="flex flex-col">
        {active.map((task, index) => (
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

      {showAddModal && <AddTaskModal onCancel={() => setShowAddModal(false)} onConfirm={onAddTask} />}
    </section>
  );
}
