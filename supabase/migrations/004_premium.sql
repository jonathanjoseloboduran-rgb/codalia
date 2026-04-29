-- Sistema premium / freemium
alter table profiles
  add column if not exists is_premium       boolean default false,
  add column if not exists premium_until    timestamptz,
  add column if not exists premium_provider text;
