-- Add approval workflow to student_enrollments.
-- Students submit a pending request; admins approve or decline.
-- Idempotent: safe to re-run.

-- 1. Status enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'enrollment_status') then
    create type public.enrollment_status as enum ('pending', 'approved', 'declined');
  end if;
end $$;

-- 2. Add status column (existing rows become 'approved' to avoid breaking live data)
alter table public.student_enrollments
  add column if not exists status public.enrollment_status not null default 'pending';

-- 3. Admins can update the status (approve / decline)
drop policy if exists "enrollments admin update" on public.student_enrollments;
create policy "enrollments admin update"
  on public.student_enrollments for update
  using  (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

-- 4. Replace the staff-select policy: admins see everything, teachers see only approved
drop policy if exists "enrollments staff select" on public.student_enrollments;

create policy "enrollments admin select all"
  on public.student_enrollments for select
  using (public.current_role_for(auth.uid()) = 'admin');

create policy "enrollments teacher select approved"
  on public.student_enrollments for select
  using (
    public.current_role_for(auth.uid()) = 'teacher'
    and status = 'approved'
  );
