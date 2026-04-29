-- ════════════════════════════════════════════════════════
-- Row Level Security — cada usuario solo ve y modifica lo suyo
-- ════════════════════════════════════════════════════════

alter table profiles          enable row level security;
alter table lesson_progress   enable row level security;
alter table exercise_attempts enable row level security;
alter table quiz_attempts     enable row level security;
alter table xp_events         enable row level security;
alter table user_badges       enable row level security;

-- profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- lesson_progress
create policy "Users can view own progress"
  on lesson_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on lesson_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on lesson_progress for update using (auth.uid() = user_id);

-- exercise_attempts
create policy "Users can view own exercise attempts"
  on exercise_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own exercise attempts"
  on exercise_attempts for insert with check (auth.uid() = user_id);

-- quiz_attempts
create policy "Users can view own quiz attempts"
  on quiz_attempts for select using (auth.uid() = user_id);
create policy "Users can insert own quiz attempts"
  on quiz_attempts for insert with check (auth.uid() = user_id);

-- xp_events
create policy "Users can view own XP events"
  on xp_events for select using (auth.uid() = user_id);
create policy "Users can insert own XP events"
  on xp_events for insert with check (auth.uid() = user_id);

-- user_badges
create policy "Users can view own badges"
  on user_badges for select using (auth.uid() = user_id);
create policy "Users can insert own badges"
  on user_badges for insert with check (auth.uid() = user_id);
