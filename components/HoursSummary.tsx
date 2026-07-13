import type { Role, Settings, HourPurchase, Task } from '@/lib/types';
import { purchasedHours, usedHours, remainingHours, usagePercent, economics } from '@/lib/calculations';

interface HoursSummaryProps {
  role: Role;
  settings: Settings;
  purchases: HourPurchase[];
  tasks: Task[];
}

export default function HoursSummary({ role, settings, purchases, tasks }: HoursSummaryProps) {
  const purchased = purchasedHours(purchases);
  const used = usedHours(tasks);
  const remaining = remainingHours(purchased, used);
  const { percent, overBudget } = usagePercent(used, purchased);
  const econ = role === 'owner' ? economics(settings.hourly_rate, purchased, used, remaining) : null;

  return (
    <section className="rounded-card bg-neutral-50 p-6 shadow-lg">
      <h2 className="mb-4 font-serif text-xl text-neutral-900">Resoconto ore</h2>

      <div className="mb-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="font-mono text-2xl text-neutral-900">{purchased.toFixed(1)}</p>
          <p className="text-sm text-neutral-500">Acquistate</p>
          {econ && <p className="text-xs text-sage">{econ.purchasedValue.toFixed(2)} €</p>}
        </div>
        <div>
          <p className="font-mono text-2xl text-neutral-900">{used.toFixed(1)}</p>
          <p className="text-sm text-neutral-500">Utilizzate</p>
          {econ && <p className="text-xs text-amber">{econ.usedValue.toFixed(2)} €</p>}
        </div>
        <div>
          <p className={`font-mono text-2xl ${overBudget ? 'text-rose' : 'text-neutral-900'}`}>{remaining.toFixed(1)}</p>
          <p className="text-sm text-neutral-500">Residue</p>
          {econ && <p className="text-xs text-skyblue">{econ.remainingValue.toFixed(2)} €</p>}
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full transition-all duration-500 ${overBudget ? 'bg-rose' : 'bg-sage'}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {overBudget && <p className="mt-2 text-sm font-medium text-rose">Monte esaurito — da ricaricare</p>}
    </section>
  );
}
