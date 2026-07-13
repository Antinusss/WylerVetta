'use client';

import { useState } from 'react';

interface AddHoursControlProps {
  onAddHours: (hours: number, purchasedOn: string, note: string) => Promise<void>;
}

export default function AddHoursControl({ onAddHours }: AddHoursControlProps) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [purchasedOn, setPurchasedOn] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(hours);
    if (!parsed || parsed <= 0) return;

    setSaving(true);
    setError(null);
    try {
      await onAddHours(parsed, purchasedOn, note);
      setHours('');
      setPurchasedOn('');
      setNote('');
      setOpen(false);
    } catch {
      setError('Errore nel salvataggio delle ore. Riprova.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="self-start rounded-lg bg-gold px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90"
      >
        + Aggiungi ore
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-card bg-neutral-50 p-4">
      <div>
        <label className="mb-1 block text-xs text-neutral-500">Ore</label>
        <input
          type="number"
          step="0.5"
          min="0"
          required
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-500">Data</label>
        <input
          type="text"
          placeholder="gg/mm/aaaa"
          value={purchasedOn}
          onChange={(e) => setPurchasedOn(e.target.value)}
          className="w-32 rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900"
        />
      </div>
      <div className="flex-1">
        <label className="mb-1 block text-xs text-neutral-500">Nota (facoltativa)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-neutral-900"
        />
      </div>
      {error && <p className="text-sm text-rose">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-sage px-4 py-2 text-sm font-medium text-neutral-950 disabled:opacity-50"
      >
        Salva
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 hover:underline">
        Annulla
      </button>
    </form>
  );
}
