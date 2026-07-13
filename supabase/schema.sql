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

-- REALTIME: abilita postgres_changes sulle tabelle usate dal portale
alter publication supabase_realtime add table settings;
alter publication supabase_realtime add table hour_purchases;
alter publication supabase_realtime add table tasks;
