'use client';

import { useState } from 'react';

interface CompleteTaskModalProps {
  taskTitle: string;
  onCancel: () => void;
  onConfirm: (hours: number) => void;
}

export default function CompleteTaskModal({ taskTitle, onCancel, onConfirm }: CompleteTaskModalProps) {
  const [hours, setHours] = useState('');

  function handleConfirm() {
    const parsed = parseFloat(hours.replace(',', '.'));
    if (!parsed || parsed <= 0) return;
    onConfirm(parsed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 px-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-card bg-neutral-50 p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gold">Task completata</p>
        <h2 className="mb-4 font-serif text-2xl text-neutral-900">Quanto tempo ci hai messo?</h2>
        <p className="mb-4 text-sm text-neutral-600">
          Inserisci le ore lavorate per <span className="font-medium">{taskTitle}</span>. Verranno riportate nel
          timesheet.
        </p>

        <div className="mb-6 flex items-center gap-2">
          <input
            autoFocus
            type="number"
            step="0.5"
            min="0"
            placeholder="es. 1,5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            className="w-full rounded-lg border border-gold px-3 py-2 text-neutral-900"
          />
          <span className="text-sm text-neutral-500">ore</span>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm text-neutral-600 hover:underline">
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90"
          >
            Conferma e aggiungi
          </button>
        </div>
      </div>
    </div>
  );
}
