-- Tabla para sincronizar el progreso de cada usuario (un blob JSON por usuario).
-- Correr en Supabase → SQL Editor.

create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Seguridad: cada usuario solo puede leer/escribir su propia fila
alter table public.user_progress enable row level security;

drop policy if exists "Users manage own progress" on public.user_progress;
create policy "Users manage own progress"
  on public.user_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
