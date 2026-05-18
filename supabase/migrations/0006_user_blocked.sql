-- Track whether an admin has suspended a user account.
alter table public.profiles
  add column if not exists blocked boolean not null default false;
