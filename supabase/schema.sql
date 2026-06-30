-- Tempo // OS — Supabase schema for the shared progress leaderboard.
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

-- One row per user: their latest progress snapshot.
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  name       text not null default 'Anon',
  avatar     text not null default '',
  score      integer not null default 0,
  tasks_done integer not null default 0,
  habit_pct  integer not null default 0,
  pnl        integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

-- Everyone signed in can read the whole board (that's the point — see friends).
drop policy if exists "progress readable by authenticated" on public.progress;
create policy "progress readable by authenticated"
  on public.progress for select
  to authenticated
  using (true);

-- You can insert/update only your own row.
drop policy if exists "users upsert own progress" on public.progress;
create policy "users upsert own progress"
  on public.progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users update own progress" on public.progress;
create policy "users update own progress"
  on public.progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
