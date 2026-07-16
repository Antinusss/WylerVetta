import type { HourPurchase, Task } from './types';

export function purchasedHours(purchases: HourPurchase[]): number {
  return purchases.reduce((sum, p) => sum + p.hours, 0);
}

export function usedHours(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === 'completato' && t.owner !== 'Amina')
    .reduce((sum, t) => sum + t.hours, 0);
}

export function remainingHours(purchased: number, used: number): number {
  return purchased - used;
}

export interface UsageSummary {
  percent: number;
  overBudget: boolean;
}

export function usagePercent(used: number, purchased: number): UsageSummary {
  if (purchased <= 0) {
    return { percent: used > 0 ? 100 : 0, overBudget: used > 0 };
  }
  const raw = (used / purchased) * 100;
  return {
    percent: Math.min(100, Math.max(0, raw)),
    overBudget: used > purchased,
  };
}

export interface Economics {
  purchasedValue: number;
  usedValue: number;
  remainingValue: number;
}

export function economics(rate: number, purchased: number, used: number, remaining: number): Economics {
  return {
    purchasedValue: purchased * rate,
    usedValue: used * rate,
    remainingValue: remaining * rate,
  };
}

export function completionPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completato').length;
  return (completed / tasks.length) * 100;
}

const LEVEL_SCORE: Record<'bassa' | 'media' | 'alta', number> = {
  bassa: 1,
  media: 2,
  alta: 3,
};

export function priorityScore(task: Task): number {
  return LEVEL_SCORE[task.impact] * 2 + LEVEL_SCORE[task.urgency] * 2;
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const groupRank = (t: Task): number => {
    if (t.status === 'completato') return 2;
    if (t.status === 'on_hold') return 1;
    return 0;
  };

  return [...tasks].sort((a, b) => {
    const groupDiff = groupRank(a) - groupRank(b);
    if (groupDiff !== 0) return groupDiff;

    const scoreDiff = priorityScore(b) - priorityScore(a);
    if (scoreDiff !== 0) return scoreDiff;

    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}
