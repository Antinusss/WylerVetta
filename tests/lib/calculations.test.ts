import { describe, it, expect } from 'vitest';
import {
  purchasedHours,
  usedHours,
  remainingHours,
  usagePercent,
  economics,
  completionPercent,
  priorityScore,
  sortTasksByPriority,
} from '@/lib/calculations';
import type { HourPurchase, Task } from '@/lib/types';

function makePurchase(hours: number): HourPurchase {
  return { id: crypto.randomUUID(), hours, purchased_on: '', note: '', created_at: new Date().toISOString() };
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Task',
    hours: 0,
    impact: 'media',
    urgency: 'media',
    status: 'non_iniziato',
    owner: 'Leonardo',
    completed_on: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('purchasedHours', () => {
  it('sums all purchases', () => {
    expect(purchasedHours([makePurchase(10), makePurchase(5.5)])).toBe(15.5);
  });

  it('returns 0 for empty list', () => {
    expect(purchasedHours([])).toBe(0);
  });
});

describe('usedHours', () => {
  it('sums hours only for completato tasks', () => {
    const tasks = [
      makeTask({ hours: 3, status: 'completato' }),
      makeTask({ hours: 2, status: 'in_corso' }),
      makeTask({ hours: 4, status: 'completato' }),
    ];
    expect(usedHours(tasks)).toBe(7);
  });
});

describe('remainingHours', () => {
  it('subtracts used from purchased', () => {
    expect(remainingHours(20, 8)).toBe(12);
  });
});

describe('usagePercent', () => {
  it('computes percent within bounds', () => {
    expect(usagePercent(5, 20)).toEqual({ percent: 25, overBudget: false });
  });

  it('clamps at 100 and flags overBudget when used exceeds purchased', () => {
    expect(usagePercent(25, 20)).toEqual({ percent: 100, overBudget: true });
  });

  it('handles zero purchased hours without dividing by zero', () => {
    expect(usagePercent(0, 0)).toEqual({ percent: 0, overBudget: false });
    expect(usagePercent(3, 0)).toEqual({ percent: 100, overBudget: true });
  });
});

describe('economics', () => {
  it('multiplies hours by rate', () => {
    expect(economics(25, 20, 8, 12)).toEqual({
      purchasedValue: 500,
      usedValue: 200,
      remainingValue: 300,
    });
  });
});

describe('completionPercent', () => {
  it('computes ratio of completato tasks', () => {
    const tasks = [
      makeTask({ status: 'completato' }),
      makeTask({ status: 'completato' }),
      makeTask({ status: 'in_corso' }),
      makeTask({ status: 'non_iniziato' }),
    ];
    expect(completionPercent(tasks)).toBe(50);
  });

  it('returns 0 for empty task list', () => {
    expect(completionPercent([])).toBe(0);
  });
});

describe('priorityScore', () => {
  it('scores alta/alta as 12', () => {
    expect(priorityScore(makeTask({ impact: 'alta', urgency: 'alta' }))).toBe(12);
  });

  it('scores bassa/bassa as 4', () => {
    expect(priorityScore(makeTask({ impact: 'bassa', urgency: 'bassa' }))).toBe(4);
  });
});

describe('sortTasksByPriority', () => {
  it('puts completato tasks last regardless of score', () => {
    const low = makeTask({ impact: 'bassa', urgency: 'bassa', status: 'non_iniziato', created_at: '2026-01-01T00:00:00Z' });
    const doneHigh = makeTask({ impact: 'alta', urgency: 'alta', status: 'completato', created_at: '2026-01-02T00:00:00Z' });
    const sorted = sortTasksByPriority([doneHigh, low]);
    expect(sorted.map((t) => t.id)).toEqual([low.id, doneHigh.id]);
  });

  it('puts on_hold below active tasks of equal score', () => {
    const active = makeTask({ impact: 'media', urgency: 'media', status: 'in_corso', created_at: '2026-01-01T00:00:00Z' });
    const onHold = makeTask({ impact: 'media', urgency: 'media', status: 'on_hold', created_at: '2026-01-02T00:00:00Z' });
    const sorted = sortTasksByPriority([onHold, active]);
    expect(sorted.map((t) => t.id)).toEqual([active.id, onHold.id]);
  });

  it('orders active tasks by descending priority score', () => {
    const highPriority = makeTask({ impact: 'alta', urgency: 'alta', status: 'in_corso', created_at: '2026-01-01T00:00:00Z' });
    const lowPriority = makeTask({ impact: 'bassa', urgency: 'bassa', status: 'in_corso', created_at: '2026-01-02T00:00:00Z' });
    const sorted = sortTasksByPriority([lowPriority, highPriority]);
    expect(sorted.map((t) => t.id)).toEqual([highPriority.id, lowPriority.id]);
  });

  it('breaks ties by creation date ascending', () => {
    const earlier = makeTask({ impact: 'media', urgency: 'media', status: 'in_corso', created_at: '2026-01-01T00:00:00Z' });
    const later = makeTask({ impact: 'media', urgency: 'media', status: 'in_corso', created_at: '2026-01-02T00:00:00Z' });
    const sorted = sortTasksByPriority([later, earlier]);
    expect(sorted.map((t) => t.id)).toEqual([earlier.id, later.id]);
  });
});
