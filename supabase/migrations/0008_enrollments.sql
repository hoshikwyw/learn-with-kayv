-- Student course enrollments.
-- Idempotent: safe to re-run.

create table if not exists public.student_enrollments (
  student_id  uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (student_id, course_id)
);

create index if not exists student_enrollments_course_idx
  on public.student_enrollments(course_id);

alter table public.student_enrollments enable row level security;

-- Students can view and manage their own enrollments.
drop policy if exists "enrollments student select" on public.student_enrollments;
create policy "enrollments student select"
  on public.student_enrollments for select
  using (auth.uid() = student_id);

drop policy if exists "enrollments student insert" on public.student_enrollments;
create policy "enrollments student insert"
  on public.student_enrollments for insert
  with check (
    auth.uid() = student_id
    and public.current_role_for(auth.uid()) = 'student'
  );

drop policy if exists "enrollments student delete" on public.student_enrollments;
create policy "enrollments student delete"
  on public.student_enrollments for delete
  using (auth.uid() = student_id);

-- Admins and teachers can view all enrollments.
drop policy if exists "enrollments staff select" on public.student_enrollments;
create policy "enrollments staff select"
  on public.student_enrollments for select
  using (
    public.current_role_for(auth.uid()) in ('admin', 'teacher')
  );

-- Admins can manage all enrollments.
drop policy if exists "enrollments admin write" on public.student_enrollments;
create policy "enrollments admin write"
  on public.student_enrollments for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');
