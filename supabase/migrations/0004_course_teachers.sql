-- Multi-teacher assignment per course (one main, zero-or-more assistants).
-- Idempotent: safe to re-run.

-- 1. Enum (Postgres has no `create type if not exists`, so we guard with a DO block)
do $$
begin
  if not exists (select 1 from pg_type where typname = 'course_teacher_role') then
    create type public.course_teacher_role as enum ('main', 'assistant');
  end if;
end $$;

-- 2. Table
create table if not exists public.course_teachers (
  course_id   uuid not null references public.courses(id) on delete cascade,
  teacher_id  uuid not null references public.profiles(id) on delete cascade,
  role        public.course_teacher_role not null default 'assistant',
  assigned_at timestamptz not null default now(),
  primary key (course_id, teacher_id)
);

-- 3. Indexes
create index if not exists course_teachers_teacher_idx
  on public.course_teachers(teacher_id);

create unique index if not exists course_one_main_teacher
  on public.course_teachers(course_id)
  where role = 'main';

-- 4. RLS
alter table public.course_teachers enable row level security;

drop policy if exists "course_teachers read all" on public.course_teachers;
create policy "course_teachers read all"
  on public.course_teachers for select using (true);

drop policy if exists "course_teachers admin write" on public.course_teachers;
create policy "course_teachers admin write"
  on public.course_teachers for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

-- 5. Tighten grades INSERT: teachers can only enter grades for courses they are assigned to.
drop policy if exists "grades staff write" on public.grades;
drop policy if exists "grades insert by assigned teacher or admin" on public.grades;

create policy "grades insert by assigned teacher or admin"
  on public.grades for insert
  with check (
    public.current_role_for(auth.uid()) = 'admin'
    or (
      public.current_role_for(auth.uid()) = 'teacher'
      and exists (
        select 1 from public.course_teachers ct
        where ct.course_id = grades.course_id
          and ct.teacher_id = auth.uid()
      )
    )
  );
