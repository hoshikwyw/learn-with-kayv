-- Lessons: text + optional YouTube link, ordered per course.

create table if not exists public.lessons (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  body          text not null default '',
  video_url     text,
  display_order int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists lessons_course_order_idx
  on public.lessons(course_id, display_order);

drop trigger if exists lessons_touch_updated_at on public.lessons;
create trigger lessons_touch_updated_at
  before update on public.lessons
  for each row execute function public.touch_updated_at();

alter table public.lessons enable row level security;

-- Anyone signed in can read lessons
drop policy if exists "lessons read all auth" on public.lessons;
create policy "lessons read all auth"
  on public.lessons for select
  using (auth.role() = 'authenticated');

-- Admins write any lesson
drop policy if exists "lessons admin write" on public.lessons;
create policy "lessons admin write"
  on public.lessons for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

-- Assigned teachers write lessons for their own courses
drop policy if exists "lessons assigned teacher write" on public.lessons;
create policy "lessons assigned teacher write"
  on public.lessons for all
  using (
    public.current_role_for(auth.uid()) = 'teacher'
    and exists (
      select 1 from public.course_teachers ct
      where ct.course_id = lessons.course_id
        and ct.teacher_id = auth.uid()
    )
  )
  with check (
    public.current_role_for(auth.uid()) = 'teacher'
    and exists (
      select 1 from public.course_teachers ct
      where ct.course_id = lessons.course_id
        and ct.teacher_id = auth.uid()
    )
  );
