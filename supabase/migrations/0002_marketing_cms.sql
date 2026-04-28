-- Marketing CMS: hero copy, about items, news, featured courses + teachers.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. site_settings — singletons (hero JSON, ordered ID arrays for featuring)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. about_items — repeating cards (only exist for marketing)
-- ─────────────────────────────────────────────────────────────────────────────
create table public.about_items (
  id            uuid primary key default gen_random_uuid(),
  icon          text not null,           -- lucide icon name, e.g. 'BookOpen'
  title         text not null,
  body          text not null,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

create index about_items_order_idx on public.about_items(display_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. news_items — full inventory; admin features 5 via site_settings
-- ─────────────────────────────────────────────────────────────────────────────
create table public.news_items (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  published_on date not null,
  created_at   timestamptz not null default now()
);

create index news_items_published_idx on public.news_items(published_on desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. featured_teachers — denormalized snapshot for marketing display.
--    Avoids exposing profiles.email to anonymous visitors.
-- ─────────────────────────────────────────────────────────────────────────────
create table public.featured_teachers (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null unique references public.profiles(id) on delete cascade,
  display_order int not null,
  full_name     text not null,
  avatar_url    text,
  bio           text not null default '',
  created_at    timestamptz not null default now()
);

create index featured_teachers_order_idx on public.featured_teachers(display_order);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS — public reads everywhere marketing needs, admin-only writes
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.site_settings      enable row level security;
alter table public.about_items        enable row level security;
alter table public.news_items         enable row level security;
alter table public.featured_teachers  enable row level security;

create policy "site_settings public read"
  on public.site_settings for select using (true);

create policy "site_settings admin write"
  on public.site_settings for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

create policy "about_items public read"
  on public.about_items for select using (true);

create policy "about_items admin write"
  on public.about_items for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

create policy "news_items public read"
  on public.news_items for select using (true);

create policy "news_items admin write"
  on public.news_items for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

create policy "featured_teachers public read"
  on public.featured_teachers for select using (true);

create policy "featured_teachers admin write"
  on public.featured_teachers for all
  using (public.current_role_for(auth.uid()) = 'admin')
  with check (public.current_role_for(auth.uid()) = 'admin');

-- 6. Make courses readable to anonymous visitors so the marketing page can show them
drop policy if exists "courses read all authenticated" on public.courses;
create policy "courses public read"
  on public.courses for select using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Seeds so the marketing page isn't empty after migration
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('hero', jsonb_build_object(
    'badge',    'Private school · Est. 2026',
    'title',    'A calm, modern home for learning at Learn-with-kayv.',
    'subtitle', 'One place for students to track grades and timetables, teachers to manage their classes, and admins to run the school.'
  )),
  ('featured_news_ids',   '[]'::jsonb),
  ('featured_course_ids', '[]'::jsonb);

insert into public.about_items (icon, title, body, display_order) values
  ('BookOpen',  'Coursera-style courses',  'Modules, lessons, quizzes and assignments — structured the way students already learn online.', 0),
  ('Users',     'Three roles, one system', 'Admins manage users and courses. Teachers grade work. Students track progress. Each gets a focused dashboard.', 1),
  ('Newspaper', 'A tidy school newsroom',  'Share announcements, term plans and milestones — all linked from the public landing page.', 2);
