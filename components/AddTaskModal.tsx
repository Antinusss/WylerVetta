'use client';

import { useState } from 'react';
import type { Impact, Urgency, TaskOwner } from '@/lib/types';

interface AddTaskModalProps {
  onCancel: () => void;
  onConfirm: (title: string, impact: Impact, urgency: Urgency, owner: TaskOwner) => Promise<void>;
}

export default function AddTaskModal({ onCancel, onConfirm }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [impact, setImpact] = useState<Impact>('media');
  const [urgency, setUrgency] = useState<Urgency>('media');
  const [owner, setOwner] = useState<TaskOwner>('Leonardo');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm(title.trim(), impact, urgency, owner);
      onCancel();
    } catch {
      setError('Errore nel salvataggio della task. Riprova.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 px-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-card bg-neutral-50 p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-serif text-2xl text-neutral-900">Nuova task</h2>

        <label className="mb-1 block text-xs text-neutral-500">Titolo</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900"
        />

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Impatto</label>
            <select
              value={impact}
              onChange={(e) => setImpact(e.target.value as Impact)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-2 text-neutral-900"
            >
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Urgenza</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as Urgency)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-2 text-neutral-900"
            >
              <option value="bassa">Bassa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-500">Owner</label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value as TaskOwner)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-2 text-neutral-900"
            >
              <option value="Leonardo">Leonardo</option>
              <option value="Amina">Amina</option>
            </select>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-rose">{error}</p>}

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:underline">
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Salvataggio…' : 'Conferma'}
          </button>
        </div>
      </div>
    </div>
  );
}
