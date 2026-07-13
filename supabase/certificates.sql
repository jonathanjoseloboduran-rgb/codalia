-- Registro público de certificados emitidos (para la página de verificación).
-- Correr en Supabase → SQL Editor.

create table if not exists public.certificates (
  code       text primary key,          -- ej: CDL-A1B2C3
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,             -- nombre grabado en el certificado
  path_id    text not null,
  path_title text not null,
  level      text,
  issued_at  timestamptz not null
);

alter table public.certificates enable row level security;

-- Cualquiera puede VERIFICAR (leer) un certificado por su código
drop policy if exists "Public verify" on public.certificates;
create policy "Public verify"
  on public.certificates for select
  using (true);

-- Solo el dueño autenticado puede registrar/actualizar los suyos
drop policy if exists "Owner insert" on public.certificates;
create policy "Owner insert"
  on public.certificates for insert
  with check (auth.uid() = user_id);

drop policy if exists "Owner update" on public.certificates;
create policy "Owner update"
  on public.certificates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
