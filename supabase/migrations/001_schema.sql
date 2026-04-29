-- ════════════════════════════════════════════════════════
-- Codalia — Schema principal
-- ════════════════════════════════════════════════════════

-- Perfil de usuario (se crea automáticamente al registrarse)
create table if not exists profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  username            text unique,
  avatar_url          text,
  created_at          timestamptz default now(),
  total_xp            int default 0,
  current_level       int default 1,
  current_streak_days int default 0,
  longest_streak      int default 0,
  last_active_date    date,
  preferred_path      text default 'python-basico'
);

-- Progreso por lección
create table if not exists lesson_progress (
  user_id      uuid references profiles(id) on delete cascade,
  course_id    text not null,
  chapter_id   text not null,
  lesson_id    text not null,
  status       text not null check (status in ('in_progress','completed')),
  completed_at timestamptz,
  primary key (user_id, course_id, chapter_id, lesson_id)
);

-- Intentos de ejercicios de código
create table if not exists exercise_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  lesson_id    text not null,
  exercise_id  text not null,
  user_code    text,
  passed       boolean not null default false,
  attempted_at timestamptz default now()
);

-- Intentos de quiz
create table if not exists quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade,
  lesson_id    text not null,
  score        int not null,      -- 0-100
  perfect      boolean not null default false,
  attempted_at timestamptz default now()
);

-- Historial de XP (auditoría)
create table if not exists xp_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete cascade,
  event_type  text not null,
  xp_amount   int not null,
  context     jsonb,
  created_at  timestamptz default now()
);

-- Badges ganados
create table if not exists user_badges (
  user_id   uuid references profiles(id) on delete cascade,
  badge_id  text not null,
  earned_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- ── Trigger: crear perfil automáticamente al registrarse ─────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
