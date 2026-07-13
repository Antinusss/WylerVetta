# Portale Monte-Ore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js + Supabase web portal where a client and a supplier (owner) track a purchased hour budget consumed by completed tasks, in realtime, with role-based permissions.

**Architecture:** Next.js App Router with Server Components fetching initial data via a Supabase server client (cookie-based auth via `@supabase/ssr`), handed to a single client component (`PortalClient`) that subscribes to Supabase Realtime (`postgres_changes`) on three tables and re-renders on any change from either session. All mutations go through the Supabase JS client directly from the browser; RLS + a Postgres trigger enforce permissions server-side regardless of what the UI allows.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS 3, `@supabase/supabase-js` 2, `@supabase/ssr` 0.5, Vitest 2.

## Global Constraints

- All UI copy in Italian.
- No `localStorage` as source of truth — Supabase is the only state store.
- RLS enabled on every table; permissions enforced server-side, not just hidden in UI.
- Default hourly rate: 25 (numeric, editable in `settings.hourly_rate`), shown only when `role === 'owner'`.
- Colors: gold `#c89456`, sage `#5d7d57`, skyblue `#4a6c8f`, rose `#b0584c`, amber `#c8902f`, violet `#7a5c8f`. Card radius ~18px.
- Fonts: Fraunces (serif, titles/numbers), Inter Tight (sans, body), Spline Sans Mono (mono, numbers).
- Respect `prefers-reduced-motion`.
- Task statuses: `non_iniziato` (grey), `in_corso` (amber), `completato` (sage), `on_hold` (violet).
- Impact/Urgency levels: `bassa` (skyblue), `media` (amber), `alta` (rose).
- Task owners: fixed two-value enum `Leonardo` / `Amina`.
- Priority score = impact_score*2 + urgency_score*2 where bassa=1, media=2, alta=3. Completed tasks sort last; on_hold sorts just above completed but below active; ties break by `created_at` ascending.
- Repo already has `git init` done and one commit (design doc). Continue committing after every task.

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `.eslintrc.json`
- Create: `.gitignore`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/(portal)/page.tsx`

**Interfaces:**
- Produces: working Next.js build pipeline, Tailwind content paths (`./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`), path alias `@/*` → project root.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portale-monte-ore",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "@supabase/ssr": "0.5.1",
    "@supabase/supabase-js": "2.45.4",
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.15",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5",
    "postcss": "8.4.41",
    "tailwindcss": "3.4.10",
    "typescript": "5.5.4",
    "vitest": "2.0.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 4: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 7: Create `.eslintrc.json`**

```json
{
  "extends": "next/core-web-vitals"
}
```

- [ ] **Step 8: Create `.gitignore`**

```
node_modules
.next
.env.local
```

- [ ] **Step 9: Create `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 10: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portale Monte-Ore',
  description: 'Portale di rendicontazione ore a monte-ore',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 11: Create `app/(portal)/page.tsx` (placeholder, replaced in Task 12)**

```tsx
export default function PortalPage() {
  return <main>Portale Monte-Ore</main>;
}
```

- [ ] **Step 12: Install dependencies**

Run: `npm install`
Expected: install completes with no error, `node_modules/` and `package-lock.json` created.

- [ ] **Step 13: Verify build**

Run: `npm run build`
Expected: output ends with `✓ Compiled successfully` and lists routes `/` (from the `(portal)` group).

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json tsconfig.json next-env.d.ts next.config.mjs postcss.config.mjs tailwind.config.ts .eslintrc.json .gitignore app/globals.css app/layout.tsx "app/(portal)/page.tsx"
git commit -m "chore: scaffold Next.js + Tailwind project"
```

---

### Task 2: Domain types

**Files:**
- Create: `lib/types.ts`

**Interfaces:**
- Produces: `Role`, `Impact`, `Urgency`, `TaskStatus`, `TaskOwner`, `Profile`, `Settings`, `HourPurchase`, `Task` — used by every later task.

- [ ] **Step 1: Create `lib/types.ts`**

```ts
export type Role = 'owner' | 'client';
export type Impact = 'bassa' | 'media' | 'alta';
export type Urgency = 'bassa' | 'media' | 'alta';
export type TaskStatus = 'non_iniziato' | 'in_corso' | 'completato' | 'on_hold';
export type TaskOwner = 'Leonardo' | 'Amina';

export interface Profile {
  id: string;
  role: Role;
  created_at: string;
}

export interface Settings {
  id: number;
  project_name: string;
  hourly_rate: number;
  client_logo_url: string | null;
  supplier_logo_url: string | null;
  updated_at: string;
}

export interface HourPurchase {
  id: string;
  hours: number;
  purchased_on: string;
  note: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  hours: number;
  impact: Impact;
  urgency: Urgency;
  status: TaskStatus;
  owner: TaskOwner;
  created_at: string;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add domain types"
```

---

### Task 3: Calculations logic (TDD)

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/lib/calculations.test.ts`
- Create: `lib/calculations.ts`

**Interfaces:**
- Consumes: `HourPurchase`, `Task`, `Impact`, `Urgency` from `lib/types.ts` (Task 2).
- Produces: `purchasedHours`, `usedHours`, `remainingHours`, `usagePercent`, `economics`, `completionPercent`, `priorityScore`, `sortTasksByPriority` — consumed by `HoursSummary`, `CompletionSummary`, `TaskList` (Tasks 9-11).

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

- [ ] **Step 2: Write failing tests — `tests/lib/calculations.test.ts`**

```ts
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
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `npx vitest run tests/lib/calculations.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/calculations"` (file doesn't exist yet).

- [ ] **Step 4: Implement `lib/calculations.ts`**

```ts
import type { HourPurchase, Task } from './types';

export function purchasedHours(purchases: HourPurchase[]): number {
  return purchases.reduce((sum, p) => sum + p.hours, 0);
}

export function usedHours(tasks: Task[]): number {
  return tasks
    .filter((t) => t.status === 'completato')
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
```

- [ ] **Step 5: Run tests, verify they pass**

Run: `npx vitest run tests/lib/calculations.test.ts`
Expected: PASS — all suites green.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/lib/calculations.test.ts lib/calculations.ts
git commit -m "feat: add hour/priority calculation logic with tests"
```

---

### Task 4: Supabase database schema

**Files:**
- Create: `supabase/schema.sql`

**Interfaces:**
- Produces: tables `profiles`, `settings`, `hour_purchases`, `tasks`; view `v_hours_summary`; function `is_owner()`; trigger blocking client edits to `tasks.status`/`tasks.hours`; RLS policies; storage bucket `logos` + policies. Consumed manually by the user against their live Supabase project (Task 13/14, README).

- [ ] **Step 1: Create `supabase/schema.sql`**

```sql
-- PROFILI E RUOLI
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','client')),
  created_at timestamptz default now()
);

-- IMPOSTAZIONI PROGETTO (riga singola)
create table settings (
  id int primary key default 1 check (id = 1),
  project_name text default 'Progetto Monte-Ore',
  hourly_rate numeric default 25,
  client_logo_url text,
  supplier_logo_url text,
  updated_at timestamptz default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ACQUISTI DI ORE
create table hour_purchases (
  id uuid primary key default gen_random_uuid(),
  hours numeric not null default 0,
  purchased_on text default '',
  note text default '',
  created_at timestamptz default now()
);

-- TASK
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  hours numeric not null default 0,
  impact text not null default 'media' check (impact in ('bassa','media','alta')),
  urgency text not null default 'media' check (urgency in ('bassa','media','alta')),
  status text not null default 'non_iniziato'
    check (status in ('non_iniziato','in_corso','completato','on_hold')),
  owner text not null default 'Leonardo' check (owner in ('Leonardo','Amina')),
  created_at timestamptz default now()
);

-- VIEW DI RIEPILOGO
create view v_hours_summary as
  select
    coalesce((select sum(hours) from hour_purchases),0) as purchased,
    coalesce((select sum(hours) from tasks where status='completato'),0) as used;

-- HELPER RUOLO
create or replace function is_owner() returns boolean language sql stable as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'owner');
$$;

-- TRIGGER: il cliente non puo modificare status/hours delle task
create or replace function prevent_client_task_status_hours_change() returns trigger
language plpgsql as $$
begin
  if not is_owner() then
    if new.status is distinct from old.status or new.hours is distinct from old.hours then
      raise exception 'Solo il fornitore puo modificare stato o ore della task';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_client_task_status_hours_change
  before update on tasks
  for each row
  execute function prevent_client_task_status_hours_change();

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table settings enable row level security;
alter table hour_purchases enable row level security;
alter table tasks enable row level security;

create policy profiles_select on profiles for select using (auth.uid() is not null);
create policy profiles_owner_all on profiles for all using (is_owner()) with check (is_owner());

create policy settings_select on settings for select using (auth.uid() is not null);
create policy settings_owner_update on settings for update using (is_owner()) with check (is_owner());
create policy settings_owner_insert on settings for insert with check (is_owner());

create policy hour_purchases_select on hour_purchases for select using (auth.uid() is not null);
create policy hour_purchases_insert on hour_purchases for insert with check (auth.uid() is not null);
create policy hour_purchases_owner_update on hour_purchases for update using (is_owner()) with check (is_owner());
create policy hour_purchases_owner_delete on hour_purchases for delete using (is_owner());

create policy tasks_select on tasks for select using (auth.uid() is not null);
create policy tasks_insert on tasks for insert
  with check (is_owner() or (status = 'non_iniziato' and hours = 0));
create policy tasks_update on tasks for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy tasks_owner_delete on tasks for delete using (is_owner());

-- STORAGE: bucket loghi, lettura pubblica, scrittura solo owner
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict (id) do nothing;

create policy "Public read logos" on storage.objects for select using (bucket_id = 'logos');
create policy "Owner write logos" on storage.objects for insert with check (bucket_id = 'logos' and is_owner());
create policy "Owner update logos" on storage.objects for update using (bucket_id = 'logos' and is_owner());
create policy "Owner delete logos" on storage.objects for delete using (bucket_id = 'logos' and is_owner());
```

- [ ] **Step 2: Review the file for syntax correctness**

Read the file back and check: every `create table`/`create policy`/`create trigger` statement ends with `;`, no unmatched `$$`, policy names are unique per table. This file is executed by the user against a live Supabase project during deploy (Task 14 / README) — there is no local Postgres in this environment to run it against now.

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema, RLS policies, and trigger"
```

---

### Task 5: Supabase client helpers and route protection

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `.env.local.example`
- Create: `.env.local`

**Interfaces:**
- Produces: `createClient()` (browser, from `lib/supabase/client.ts`) and `createClient()` (server, async, from `lib/supabase/server.ts`) — consumed by every component/page that talks to Supabase from Task 7 onward.

- [ ] **Step 1: Create `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component that can't set cookies; middleware refreshes the session instead
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create `lib/supabase/middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}
```

- [ ] **Step 4: Create root `middleware.ts`**

```ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 5: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 6: Create `.env.local` with placeholder values (for local build only, replaced with real project values in Task 14/README)**

```
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key
```

- [ ] **Step 7: Verify build and types**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors, build compiles successfully.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase/client.ts lib/supabase/server.ts lib/supabase/middleware.ts middleware.ts .env.local.example
git commit -m "feat: add Supabase client helpers and auth middleware"
```

Note: `.env.local` is gitignored and will not be committed — that's expected.

---

### Task 6: Root layout with fonts and Tailwind theme

**Files:**
- Modify: `app/layout.tsx` (created in Task 1)
- Modify: `tailwind.config.ts` (created in Task 1)
- Modify: `app/globals.css` (created in Task 1)

**Interfaces:**
- Produces: Tailwind theme colors (`gold`, `sage`, `skyblue`, `rose`, `amber`, `violet`), `rounded-card` radius utility, font families `font-serif` (Fraunces), `font-sans` (Inter Tight), `font-mono` (Spline Sans Mono) — used by every component from Task 7 onward.

- [ ] **Step 1: Update `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#c89456',
        sage: '#5d7d57',
        skyblue: '#4a6c8f',
        rose: '#b0584c',
        amber: '#c8902f',
        violet: '#7a5c8f',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter-tight)', 'sans-serif'],
        mono: ['var(--font-spline-mono)', 'monospace'],
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Update `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-neutral-950 text-neutral-100 font-sans;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { Fraunces, Inter_Tight, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight' });
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-spline-mono' });

export const metadata: Metadata = {
  title: 'Portale Monte-Ore',
  description: 'Portale di rendicontazione ore a monte-ore',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fraunces.variable} ${interTight.variable} ${splineMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx tailwind.config.ts app/globals.css
git commit -m "feat: apply Fraunces/Inter Tight/Spline Mono fonts and accent color theme"
```

---

### Task 7: Login page

**Files:**
- Create: `app/login/page.tsx`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/client.ts` (Task 5).

- [ ] **Step 1: Create `app/login/page.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Email o password non corretti.');
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card bg-neutral-50 p-8 shadow-xl"
      >
        <h1 className="mb-6 font-serif text-2xl text-neutral-900">Accedi al portale</h1>

        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900"
        />

        <label className="mb-1 block text-sm font-medium text-neutral-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900"
        />

        {error && <p className="mb-4 text-sm text-rose">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold px-4 py-2 font-medium text-neutral-950 transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Accesso in corso…' : 'Accedi'}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, route `/login` listed.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add login page"
```

---

### Task 8: Header, Footer, LogoUploader

**Files:**
- Create: `components/LogoUploader.tsx`
- Create: `components/Header.tsx`
- Create: `components/Footer.tsx`

**Interfaces:**
- Consumes: `Role`, `Settings` from `lib/types.ts` (Task 2); `createClient()` from `lib/supabase/client.ts` (Task 5).
- Produces: `Header` props `{ role, projectName, clientLogoUrl, onUpdateSettings }`; `Footer` props `{ role, supplierLogoUrl, onUpdateSettings }` — both `onUpdateSettings: (patch: Partial<Pick<Settings,'project_name'|'client_logo_url'|'supplier_logo_url'>>) => Promise<void>`. Consumed by `PortalClient` (Task 12).

- [ ] **Step 1: Create `components/LogoUploader.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LogoUploaderProps {
  kind: 'client' | 'supplier';
  onUploaded: (publicUrl: string) => Promise<void>;
}

export default function LogoUploader({ kind, onUploaded }: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createClient();
    const path = `${kind}-${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      await onUploaded(data.publicUrl);
    }

    setUploading(false);
  }

  return (
    <label className="cursor-pointer text-xs text-gold hover:underline">
      {uploading ? 'Caricamento…' : 'Carica logo'}
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
    </label>
  );
}
```

- [ ] **Step 2: Create `components/Header.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { Role, Settings } from '@/lib/types';
import LogoUploader from './LogoUploader';

interface HeaderProps {
  role: Role;
  projectName: string;
  clientLogoUrl: string | null;
  onUpdateSettings: (patch: Partial<Pick<Settings, 'project_name' | 'client_logo_url' | 'supplier_logo_url'>>) => Promise<void>;
}

export default function Header({ role, projectName, clientLogoUrl, onUpdateSettings }: HeaderProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(projectName);

  async function saveName() {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft !== projectName) {
      await onUpdateSettings({ project_name: nameDraft.trim() });
    }
  }

  return (
    <header className="flex flex-col items-center gap-3 border-b border-neutral-800 bg-neutral-950 px-4 py-6">
      {role === 'client' && (
        <div className="w-full rounded-lg bg-skyblue/20 px-4 py-2 text-center text-sm text-skyblue">
          Stai visualizzando il portale come cliente
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {clientLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={clientLogoUrl} alt="Logo cliente" className="h-16 w-auto object-contain" />
        ) : (
          <span className="font-serif text-xl text-neutral-100">Logo cliente</span>
        )}

        {role === 'owner' && <LogoUploader kind="client" onUploaded={(url) => onUpdateSettings({ client_logo_url: url })} />}
      </div>

      {editingName && role === 'owner' ? (
        <input
          autoFocus
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => e.key === 'Enter' && saveName()}
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1 text-center font-serif text-lg text-neutral-100"
        />
      ) : (
        <h1
          className={`font-serif text-lg text-neutral-100 ${role === 'owner' ? 'cursor-pointer hover:underline' : ''}`}
          onClick={() => role === 'owner' && setEditingName(true)}
        >
          {projectName}
        </h1>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Create `components/Footer.tsx`**

```tsx
'use client';

import type { Role, Settings } from '@/lib/types';
import LogoUploader from './LogoUploader';

interface FooterProps {
  role: Role;
  supplierLogoUrl: string | null;
  onUpdateSettings: (patch: Partial<Pick<Settings, 'project_name' | 'client_logo_url' | 'supplier_logo_url'>>) => Promise<void>;
}

export default function Footer({ role, supplierLogoUrl, onUpdateSettings }: FooterProps) {
  return (
    <footer className="flex flex-col items-center gap-2 border-t border-neutral-800 px-4 py-4">
      {supplierLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={supplierLogoUrl} alt="Logo fornitore" className="h-8 w-auto object-contain opacity-80" />
      ) : (
        <span className="text-xs text-neutral-500">Logo fornitore</span>
      )}

      {role === 'owner' && <LogoUploader kind="supplier" onUploaded={(url) => onUpdateSettings({ supplier_logo_url: url })} />}
    </footer>
  );
}
```

- [ ] **Step 4: Verify types and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors (the `eslint-disable-next-line` comments suppress the expected `no-img-element` warnings).

- [ ] **Step 5: Commit**

```bash
git add components/LogoUploader.tsx components/Header.tsx components/Footer.tsx
git commit -m "feat: add Header, Footer, and LogoUploader components"
```

---

### Task 9: HoursSummary and AddHoursControl

**Files:**
- Create: `components/HoursSummary.tsx`
- Create: `components/AddHoursControl.tsx`

**Interfaces:**
- Consumes: `Role`, `Settings`, `HourPurchase`, `Task` from `lib/types.ts`; `purchasedHours`, `usedHours`, `remainingHours`, `usagePercent`, `economics` from `lib/calculations.ts` (Task 3).
- Produces: `HoursSummary` props `{ role, settings, purchases, tasks }`; `AddHoursControl` props `{ onAddHours: (hours: number, purchasedOn: string, note: string) => Promise<void> }`. Consumed by `PortalClient` (Task 12).

- [ ] **Step 1: Create `components/HoursSummary.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `components/AddHoursControl.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/HoursSummary.tsx components/AddHoursControl.tsx
git commit -m "feat: add HoursSummary and AddHoursControl components"
```

---

### Task 10: TaskList and TaskItem

**Files:**
- Create: `components/TaskList.tsx`
- Create: `components/TaskItem.tsx`

**Interfaces:**
- Consumes: `Role`, `Task`, `Impact`, `Urgency`, `TaskOwner`, `TaskStatus` from `lib/types.ts`; `sortTasksByPriority` from `lib/calculations.ts` (Task 3).
- Produces: `TaskList` props `{ role, tasks, onAddTask, onUpdateTask, onDeleteTask }`; `TaskItem` props `{ task, rank, role, onUpdateTask, onDeleteTask }` where `onUpdateTask: (id: string, patch: Partial<Pick<Task,'title'|'impact'|'urgency'|'owner'|'status'|'hours'>>) => Promise<void>` and `onDeleteTask: (id: string) => Promise<void>`. Consumed by `PortalClient` (Task 12).

- [ ] **Step 1: Create `components/TaskItem.tsx`**

```tsx
'use client';

import type { Role, Task, Impact, Urgency, TaskOwner, TaskStatus } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  rank: number;
  role: Role;
  onUpdateTask: (id: string, patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours'>>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const STATUS_STYLES: Record<TaskStatus, string> = {
  non_iniziato: 'bg-neutral-300 text-neutral-800',
  in_corso: 'bg-amber text-neutral-950',
  completato: 'bg-sage text-neutral-950',
  on_hold: 'bg-violet text-neutral-50',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  non_iniziato: 'Non iniziato',
  in_corso: 'In corso',
  completato: 'Completato',
  on_hold: 'On hold',
};

const LEVEL_STYLES: Record<Impact | Urgency, string> = {
  bassa: 'text-skyblue',
  media: 'text-amber',
  alta: 'text-rose',
};

const OWNER_STYLES: Record<TaskOwner, string> = {
  Leonardo: 'bg-gold/20 text-gold',
  Amina: 'bg-violet/20 text-violet',
};

export default function TaskItem({ task, rank, role, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const isOwnerRole = role === 'owner';

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-neutral-400">#{rank}</span>
        <span className="font-medium text-neutral-900">{task.title}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <select
          value={task.impact}
          onChange={(e) => onUpdateTask(task.id, { impact: e.target.value as Impact })}
          className={`rounded border border-neutral-300 bg-transparent px-1 ${LEVEL_STYLES[task.impact]}`}
        >
          <option value="bassa">Impatto: Bassa</option>
          <option value="media">Impatto: Media</option>
          <option value="alta">Impatto: Alta</option>
        </select>

        <select
          value={task.urgency}
          onChange={(e) => onUpdateTask(task.id, { urgency: e.target.value as Urgency })}
          className={`rounded border border-neutral-300 bg-transparent px-1 ${LEVEL_STYLES[task.urgency]}`}
        >
          <option value="bassa">Urgenza: Bassa</option>
          <option value="media">Urgenza: Media</option>
          <option value="alta">Urgenza: Alta</option>
        </select>

        <select
          value={task.owner}
          onChange={(e) => onUpdateTask(task.id, { owner: e.target.value as TaskOwner })}
          className={`rounded px-2 py-0.5 ${OWNER_STYLES[task.owner]}`}
        >
          <option value="Leonardo">Leonardo</option>
          <option value="Amina">Amina</option>
        </select>

        {isOwnerRole ? (
          <select
            value={task.status}
            onChange={(e) => onUpdateTask(task.id, { status: e.target.value as TaskStatus })}
            className={`rounded px-2 py-0.5 ${STATUS_STYLES[task.status]}`}
          >
            <option value="non_iniziato">Non iniziato</option>
            <option value="in_corso">In corso</option>
            <option value="completato">Completato</option>
            <option value="on_hold">On hold</option>
          </select>
        ) : (
          <span className={`rounded px-2 py-0.5 ${STATUS_STYLES[task.status]}`}>{STATUS_LABELS[task.status]}</span>
        )}

        {isOwnerRole ? (
          <input
            type="number"
            step="0.5"
            min="0"
            value={task.hours}
            onChange={(e) => onUpdateTask(task.id, { hours: parseFloat(e.target.value) || 0 })}
            className="w-16 rounded border border-neutral-300 px-1 font-mono text-neutral-900"
          />
        ) : (
          <span className="font-mono text-neutral-500">{task.hours}h</span>
        )}

        {isOwnerRole && (
          <button onClick={() => onDeleteTask(task.id)} className="text-rose hover:underline">
            Elimina
          </button>
        )}
      </div>
    </li>
  );
}
```

- [ ] **Step 2: Create `components/TaskList.tsx`**

```tsx
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
    await onAddTask(title.trim(), impact, urgency, owner);
    setTitle('');
    setImpact('media');
    setUrgency('media');
    setOwner('Leonardo');
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
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/TaskItem.tsx components/TaskList.tsx
git commit -m "feat: add TaskList and TaskItem components with priority ranking"
```

---

### Task 11: CompletionSummary

**Files:**
- Create: `components/CompletionSummary.tsx`

**Interfaces:**
- Consumes: `Task`, `TaskStatus` from `lib/types.ts`; `completionPercent` from `lib/calculations.ts` (Task 3).
- Produces: `CompletionSummary` props `{ tasks: Task[] }`. Consumed by `PortalClient` (Task 12).

- [ ] **Step 1: Create `components/CompletionSummary.tsx`**

```tsx
import type { Task, TaskStatus } from '@/lib/types';
import { completionPercent } from '@/lib/calculations';

interface CompletionSummaryProps {
  tasks: Task[];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  non_iniziato: 'Non iniziato',
  in_corso: 'In corso',
  completato: 'Completato',
  on_hold: 'On hold',
};

export default function CompletionSummary({ tasks }: CompletionSummaryProps) {
  const completed = tasks.filter((t) => t.status === 'completato').length;
  const percent = completionPercent(tasks);

  const breakdown = (Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: tasks.filter((t) => t.status === status).length,
  }));

  return (
    <section className="rounded-card bg-neutral-50 p-6 shadow-lg">
      <h2 className="mb-4 font-serif text-xl text-neutral-900">Task completate</h2>

      <p className="mb-2 font-mono text-lg text-neutral-900">
        {completed} / {tasks.length} ({percent.toFixed(0)}%)
      </p>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-sage transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>

      <ul className="grid grid-cols-2 gap-2 text-sm text-neutral-600">
        {breakdown.map((b) => (
          <li key={b.status}>
            {b.label}: {b.count}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/CompletionSummary.tsx
git commit -m "feat: add CompletionSummary component"
```

---

### Task 12: PortalClient realtime wiring and portal page

**Files:**
- Create: `components/PortalClient.tsx`
- Modify: `app/(portal)/page.tsx` (placeholder from Task 1)

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/client.ts` and `lib/supabase/server.ts` (Task 5); `Settings`, `HourPurchase`, `Task`, `Role`, `Impact`, `Urgency`, `TaskOwner` (Task 2); `Header`, `Footer` (Task 8); `HoursSummary`, `AddHoursControl` (Task 9); `TaskList` (Task 10); `CompletionSummary` (Task 11).
- Produces: fully wired portal page mounted at `/`.

- [ ] **Step 1: Create `components/PortalClient.tsx`**

```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Settings, HourPurchase, Task, Role, Impact, Urgency, TaskOwner } from '@/lib/types';
import Header from './Header';
import Footer from './Footer';
import HoursSummary from './HoursSummary';
import AddHoursControl from './AddHoursControl';
import TaskList from './TaskList';
import CompletionSummary from './CompletionSummary';

interface PortalClientProps {
  role: Role;
  initialSettings: Settings;
  initialPurchases: HourPurchase[];
  initialTasks: Task[];
}

export default function PortalClient({ role, initialSettings, initialPurchases, initialTasks }: PortalClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [purchases, setPurchases] = useState(initialPurchases);
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('portal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setSettings(payload.new as Settings);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hour_purchases' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPurchases((prev) => [...prev, payload.new as HourPurchase]);
        } else if (payload.eventType === 'UPDATE') {
          setPurchases((prev) => prev.map((p) => (p.id === (payload.new as HourPurchase).id ? (payload.new as HourPurchase) : p)));
        } else if (payload.eventType === 'DELETE') {
          setPurchases((prev) => prev.filter((p) => p.id !== (payload.old as HourPurchase).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => [...prev, payload.new as Task]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((t) => (t.id === (payload.new as Task).id ? (payload.new as Task) : t)));
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== (payload.old as Task).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddHours = useCallback(async (hours: number, purchasedOn: string, note: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('hour_purchases').insert({ hours, purchased_on: purchasedOn, note });
    if (error) throw error;
  }, []);

  const handleAddTask = useCallback(async (title: string, impact: Impact, urgency: Urgency, owner: TaskOwner) => {
    const supabase = createClient();
    const { error } = await supabase.from('tasks').insert({ title, impact, urgency, owner });
    if (error) throw error;
  }, []);

  const handleUpdateTask = useCallback(
    async (id: string, patch: Partial<Pick<Task, 'title' | 'impact' | 'urgency' | 'owner' | 'status' | 'hours'>>) => {
      const supabase = createClient();
      const { error } = await supabase.from('tasks').update(patch).eq('id', id);
      if (error) throw error;
    },
    []
  );

  const handleDeleteTask = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }, []);

  const handleUpdateSettings = useCallback(
    async (patch: Partial<Pick<Settings, 'project_name' | 'client_logo_url' | 'supplier_logo_url'>>) => {
      const supabase = createClient();
      const { error } = await supabase.from('settings').update(patch).eq('id', 1);
      if (error) throw error;
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <Header
        role={role}
        projectName={settings.project_name}
        clientLogoUrl={settings.client_logo_url}
        onUpdateSettings={handleUpdateSettings}
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        <HoursSummary role={role} settings={settings} purchases={purchases} tasks={tasks} />
        <AddHoursControl onAddHours={handleAddHours} />
        <CompletionSummary tasks={tasks} />
        <TaskList
          role={role}
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      </main>

      <Footer role={role} supplierLogoUrl={settings.supplier_logo_url} onUpdateSettings={handleUpdateSettings} />
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/(portal)/page.tsx` placeholder**

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PortalClient from '@/components/PortalClient';

export default async function PortalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: settings, error: settingsError }, { data: purchases }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('settings').select('*').eq('id', 1).single(),
    supabase.from('hour_purchases').select('*').order('created_at', { ascending: true }),
    supabase.from('tasks').select('*').order('created_at', { ascending: true }),
  ]);

  if (!profile) {
    redirect('/login');
  }

  if (settingsError || !settings) {
    redirect('/login');
  }

  return (
    <PortalClient
      role={profile.role}
      initialSettings={settings}
      initialPurchases={purchases ?? []}
      initialTasks={tasks ?? []}
    />
  );
}
```

- [ ] **Step 3: Verify build and types**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors; build compiles (the `/` route becomes dynamic because it reads cookies — that's expected, not an error).

- [ ] **Step 4: Commit**

```bash
git add components/PortalClient.tsx "app/(portal)/page.tsx"
git commit -m "feat: wire portal page with realtime sync and role-based rendering"
```

---

### Task 13: README with deploy instructions

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Portale Monte-Ore

Portale web a monte-ore: il cliente acquista un pacchetto di ore, le task lo consumano al completamento. Fornitore e cliente vedono lo stesso dato in tempo reale.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, backend/auth/realtime su Supabase, deploy su Vercel.

## Setup Supabase

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Apri l'SQL Editor ed esegui tutto il contenuto di `supabase/schema.sql`.
3. Vai su **Database → Replication** e abilita Realtime sulle tabelle `settings`, `hour_purchases`, `tasks` (lo schema le crea già come tabelle normali; l'abilitazione della pubblicazione realtime va confermata da dashboard se non gia inclusa di default).
4. Vai su **Storage** e verifica che il bucket `logos` esista (creato dallo schema) con accesso pubblico in lettura.
5. Vai su **Authentication → Providers** e disabilita "Allow new users to sign up".
6. Vai su **Authentication → Users** e crea manualmente 2 utenti: uno per il fornitore, uno per il cliente (email + password).
7. Nell'SQL Editor, inserisci le righe profilo (sostituisci gli UUID con quelli reali degli utenti creati al passo 6, visibili nella tabella Authentication → Users):

   ```sql
   insert into profiles (id, role) values ('UUID-FORNITORE', 'owner');
   insert into profiles (id, role) values ('UUID-CLIENTE', 'client');
   ```

## Decisioni di implementazione

- **Tariffa oraria**: `settings.hourly_rate` resta leggibile da tutti via RLS; il calcolo economico (ore × tariffa) viene fatto solo nel componente `HoursSummary`, condizionato a `role === 'owner'`. Non esiste una tabella `owner_settings` separata (semplicità, nessun beneficio reale aggiuntivo).
- **Blocco modifica status/ore da parte del cliente**: oltre alle policy RLS, un trigger Postgres (`prevent_client_task_status_hours_change`) rifiuta con eccezione qualsiasi update che cambi `status` o `hours` se il chiamante non è owner. Vedi `supabase/schema.sql`.

Dettagli completi in `docs/superpowers/specs/2026-07-13-portale-monte-ore-design.md`.

## Sviluppo locale

1. Copia `.env.local.example` in `.env.local` e inserisci `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` del tuo progetto Supabase.
2. `npm install`
3. `npm run dev`
4. Apri `http://localhost:3000`, verrai reindirizzato a `/login`.

## Test

```bash
npm run test
```

Copre la logica di calcolo in `lib/calculations.ts` (ore acquistate/utilizzate/residue, percentuali, priorità).

## Deploy

1. `git push` su un repository GitHub.
2. Importa il repository su [Vercel](https://vercel.com).
3. Nelle Environment Variables del progetto Vercel, aggiungi `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (stessi valori di `.env.local`).
4. Deploy.

## Verifica realtime

Apri il portale in due browser diversi (o una finestra normale + una in incognito), login come fornitore in uno e come cliente nell'altro. Aggiungi ore o una task in una sessione: l'altra si aggiorna entro pochi istanti senza reload.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with Supabase setup and deploy instructions"
```

---

### Task 14: Final integration verification

**Files:** none created/modified — verification only.

- [ ] **Step 1: Full type check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors (warnings on `no-img-element` are suppressed by the inline eslint-disable comments already in place).

- [ ] **Step 3: Unit tests**

Run: `npm run test`
Expected: all `lib/calculations.ts` tests pass.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, routes `/`, `/login` listed, `/` marked dynamic (ƒ).

- [ ] **Step 5: Manual dev smoke test**

Run: `npm run dev`, open `http://localhost:3000` in a browser.
Expected: redirected to `/login` (no real Supabase project connected yet, so login won't succeed against placeholder credentials — this only confirms the page renders and middleware redirect works). Note in the session that full role-based and realtime verification requires a live Supabase project per the README steps, to be done by the user after deploy.

- [ ] **Step 6: Cross-check against spec completion checklist (§11)**

Go through each item in the original spec's checklist and confirm which are satisfied by the code (login/RLS/permissions/loghi/resoconto ore/valore economico/task/stati/prioritizzazione/completamento) versus which require the user's live Supabase + Vercel setup to verify end-to-end (realtime sync between two sessions, deploy). Report the split explicitly rather than claiming full completion — the code is done, live verification is pending user's Supabase project creation.

- [ ] **Step 7: Final commit**

```bash
git status
```

If anything is uncommitted, add and commit it with a descriptive message. Otherwise, this task requires no commit.

---

## Addendum: gap found during Task 14 verification

The design doc (line 19) requires "logout in header," but no task above ever implemented it — an omission in this plan, not in any implementer's work. During Task 14 final verification this was caught by grepping the codebase for `signOut`. Fixed by adding a small "Esci" button to `components/Header.tsx` that calls `supabase.auth.signOut()` (browser client) then `router.push('/login')` + `router.refresh()`, placed in its own flex row (not absolutely positioned, to avoid overlapping the client-role banner). See commits `12342d6` and `f604063`.
