'use client';

import type { Role, HourPurchase } from '@/lib/types';
import { purchasedHours } from '@/lib/calculations';

interface HourPurchasesListProps {
  role: Role;
  purchases: HourPurchase[];
  onUpdatePurchase: (id: string, patch: Partial<Pick<HourPurchase, 'hours' | 'purchased_on' | 'note'>>) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
}

export default function HourPurchasesList({ role, purchases, onUpdatePurchase, onDeletePurchase }: HourPurchasesListProps) {
  const isOwnerRole = role === 'owner';

  if (purchases.length === 0) {
    return null;
  }

  const sorted = [...purchases].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const total = purchasedHours(purchases);

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gold/10 text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-left font-medium">Nota</th>
            <th className="px-4 py-3 text-right font-medium">Ore</th>
            {isOwnerRole && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {sorted.map((purchase) => (
            <tr key={purchase.id} className="border-t border-neutral-200">
              <td className="px-4 py-3">
                {isOwnerRole ? (
                  <input
                    type="text"
                    value={purchase.purchased_on}
                    placeholder="gg/mm/aaaa"
                    onChange={(e) => onUpdatePurchase(purchase.id, { purchased_on: e.target.value }).catch(() => {})}
                    className="w-28 rounded border border-neutral-300 px-1 py-0.5 text-neutral-900"
                  />
                ) : (
                  <span className="text-neutral-700">{purchase.purchased_on || '—'}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {isOwnerRole ? (
                  <input
                    type="text"
                    value={purchase.note}
                    onChange={(e) => onUpdatePurchase(purchase.id, { note: e.target.value }).catch(() => {})}
                    className="w-full rounded border border-neutral-300 px-1 py-0.5 text-neutral-900"
                  />
                ) : (
                  <span className="text-neutral-700">{purchase.note || '—'}</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {isOwnerRole ? (
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={purchase.hours}
                    onChange={(e) => onUpdatePurchase(purchase.id, { hours: parseFloat(e.target.value) || 0 }).catch(() => {})}
                    className="w-20 rounded border border-neutral-300 px-1 py-0.5 text-right font-mono text-neutral-900"
                  />
                ) : (
                  <span className="font-mono text-neutral-900">{purchase.hours}</span>
                )}
              </td>
              {isOwnerRole && (
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDeletePurchase(purchase.id).catch(() => {})}
                    className="text-xs text-rose hover:underline"
                  >
                    Elimina
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-neutral-200 bg-gold/10">
            <td className="px-4 py-3 font-serif font-bold text-neutral-900" colSpan={2}>
              Totale
            </td>
            <td className="px-4 py-3 text-right font-mono font-bold text-neutral-900">{total}</td>
            {isOwnerRole && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
