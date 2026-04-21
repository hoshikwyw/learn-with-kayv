-- Learn-with-kayv — initial schema (V1 lean)
-- Profiles, courses, grades + RLS, plus a trigger that creates a profile on signup.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Role enum
-- ─────────────────────────────────────────────────────────────────────────────
create type public.user_role as enum ('admin', 'teacher', 'student');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. profiles — one row per auth user, source of truth for RBAC
-- ─────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  full_name    text,
  avatar_url   text,
  role         public.user_role not null default 'student',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Auto-update updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Auto-create a profile when a new auth user is inserted.
--    The first admin is seeded by email whitelist — change this to your own
--    email if you are not `tutustaymm@gmail.com`.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  assigned_role public.user_role;
begin
  if new.email = 'tutustaymm@gmail.com' then
    assigned_role := 'admin';
  else
    assigned_role := 'student';
  end if;

  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    assigned_role
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. courses
-- ─────────────────────────────────────────────────────────────────────────────
create table public.courses (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  title       text not null,
  description text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. grades
-- ─────────────────────────────────────────────────────────────────────────────
create table public.grades (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete set null,
  score      numeric(5,2) not null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now()
);

create index grades_student_idx on public.grades(student_id);
create index grades_course_idx  on public.grades(course_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.courses  enable row level security;
alter table public.grades   enable row level security;

-- Helper: current user's role (used in policies to avoid recursive profile reads)
create or replace function public.current_role_for(uid uuid)
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = uid;
$$;

-- profiles: anyone signed in can read any profile (needed by middleware/header).
--           Users can update their own. Admins can update anyone.
create policy "profiles select all authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles admin update all"
  on public.profiles for update
  using (public.current_role_for(auth.uid()) = 'admin');

-- courses: anyone signed in can read. Only admins write.
create policy "courses read all authenticated"
  on public.courses for select
  using (auth.role() = 'authenticated');

create policy "courses admin write"
  on public.courses for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

-- grades:
--   SELECT: students see their own, teachers see grades they entered, admins see all
--   INSERT/UPDATE: teachers + admins
create policy "grades select by owner or staff"
  on public.grades for select
  using (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or public.current_role_for(auth.uid()) = 'admin'
  );

create policy "grades staff write"
  on public.grades for insert
  with check (public.current_role_for(auth.uid()) in ('teacher', 'admin'));

create policy "grades staff update"
  on public.grades for update
  using (
    teacher_id = auth.uid()
    or public.current_role_for(auth.uid()) = 'admin'
  );
