-- Agrega columnas faltantes a quiz_attempts
alter table quiz_attempts
  add column if not exists course_id text,
  add column if not exists total     int not null default 4,
  add column if not exists passed    boolean not null default false;
