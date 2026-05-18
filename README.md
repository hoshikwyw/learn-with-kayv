# Learn-with-kayv

A private-school management platform. One place for students to track grades and
timetables, teachers to manage their classes, and admins to run the school —
plus a public marketing site the school controls from the dashboard.

## Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **TypeScript**
- **Tailwind CSS v4** + **Base UI / shadcn** components
- **Supabase** — Postgres + Auth via `@supabase/ssr` (Google OAuth only)
- **lucide-react** — icons
- **next-themes** — light / dark mode

## Features

### Public marketing site
- **Hero** — configurable badge, heading, and subtitle
- **About** — repeating icon + text cards, admin-ordered
- **Courses** — featured course cards with cover image, code, and description
- **Teachers** — featured teacher cards with avatar, name, and bio
- **News** — featured news cards with optional cover image, date, title, and body

### Admin dashboard (`/admin`)
| Page | What it does |
|---|---|
| `/admin/users` | Tabbed list of Admins / Teachers / Students. Add teacher or admin via modal. View user details, block / unblock accounts. |
| `/admin/users/[id]` | Full user profile: avatar, role, status, join date, and every course assignment with position (main / assistant). |
| `/admin/courses` | Course list showing teacher name. Create course via modal. |
| `/admin/courses/[id]` | Edit title, description, cover image, assign teachers. |
| `/admin/news` | News item list with thumbnail column. Add item (with optional image) via modal. Inline edit and delete. |
| `/admin/content` | Marketing CMS — edit hero copy, about cards, and pick which courses / news / teachers appear on the landing page. |

### Teacher dashboard (`/teacher`)
- View assigned courses and navigate into each one
- Add and manage grades for students

### Student dashboard (`/student`)
- View personal grades per course
- View timetable

### Shared
- Profile page — edit full name and upload avatar (updates landing page teacher card automatically)
- Light / dark mode toggle

## Auth model

- **Google OAuth is the only sign-in method.** No email/password forms anywhere.
- **Student** — created automatically on first Google sign-in (self-enroll).
- **Teacher / Admin** — pre-created by an existing admin at `/admin/users`. The user must sign in with Google using the exact email the admin entered.
- **Block / Unblock** — admins can suspend any account (except their own). Blocking invalidates all existing tokens and prevents new sign-ins via Supabase's `ban_duration` mechanism.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a Supabase project, then copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role secret` — **server-only, bypasses RLS, never expose client-side** |

```bash
cp .env.local.example .env.local
```

### 3. Configure Supabase Auth

In the Supabase dashboard → **Authentication → Providers**:

- **Google** — enable it. Paste your Google OAuth Client ID + Secret (Google Cloud Console → Credentials → OAuth 2.0 Client). Add `https://<your-project>.supabase.co/auth/v1/callback` as an authorised redirect URI in Google Cloud.
- **Email** — **disable** it. Otherwise email/password sign-in remains callable via the JS SDK even though the UI has no form.

In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` to the allowed redirect URLs.

### 4. Run the SQL migrations

Open **SQL Editor** in the Supabase dashboard and run each file in order:

| File | What it creates |
|---|---|
| `0001_init.sql` | `profiles`, `courses`, `grades` tables; auto-profile trigger; RLS policies |
| `0002_marketing_cms.sql` | `site_settings`, `about_items`, `news_items`, `featured_teachers`; public-read RLS; seed data |
| `0003_images.sql` | `courses.image_url`; `avatars` and `course-images` storage buckets; storage RLS |
| `0004_course_teachers.sql` | `course_teachers` join table (main / assistant roles); unique constraints |
| `0005_lessons.sql` | `lessons` table; teacher-scoped write RLS |
| `0006_user_blocked.sql` | `profiles.blocked` boolean column |
| `0007_news_image.sql` | `news_items.image_url`; `news-images` storage bucket; storage RLS |

### 5. Bootstrap the first admin

No admin exists yet, so create one manually:

1. **Supabase dashboard → Authentication → Users → "Add user"** — enter the Google email you want to be admin. Check **"Auto Confirm User"**.
2. The signup trigger inserts a `profiles` row with `role = 'student'`. Promote it:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-email@gmail.com';
   ```
3. Run `npm run dev`, open `http://localhost:3000/login`, click **Continue with Google**, and sign in with that account. You'll land on `/admin`.
4. From `/admin/users` you can now create teachers and additional admins.

### 6. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Routes

| URL | Who sees it | Notes |
|---|---|---|
| `/` | Public | Marketing site — hero, about, courses, teachers, news |
| `/login` | Signed-out only | "Continue with Google" |
| `/profile` | Any signed-in user | Edit name and avatar |
| `/admin` | Admin only | Overview stats |
| `/admin/users` | Admin only | Tabbed user management + block/unblock |
| `/admin/users/[id]` | Admin only | User detail — profile info + course assignments |
| `/admin/courses` | Admin only | Course list with teacher names |
| `/admin/courses/[id]` | Admin only | Course detail — image, description, teacher assignment, lessons |
| `/admin/news` | Admin only | News management with image uploads |
| `/admin/content` | Admin only | Marketing CMS |
| `/teacher` | Teacher only | Assigned courses |
| `/teacher/grades` | Teacher only | Grade management |
| `/student` | Student only | Dashboard |
| `/student/grades` | Student only | Personal grades |
| `/student/timetable` | Student only | Timetable |

Role enforcement lives in `middleware.ts`, which reads the user's role from
`profiles` and redirects mismatched paths to their role's home page.

## Folder layout

```
src/
├── app/
│   ├── (marketing)/          # Public site (header + footer layout)
│   ├── (auth)/               # /login, /verify-email, server actions
│   ├── (dashboard)/          # Sidebar + RBAC shell
│   │   ├── admin/
│   │   │   ├── users/        # User management + [id] detail page
│   │   │   ├── courses/      # Course list + [id] detail
│   │   │   ├── news/         # News management
│   │   │   └── content/      # Marketing CMS tabs
│   │   ├── teacher/
│   │   ├── student/
│   │   └── profile/
│   ├── auth/callback/        # Supabase OAuth redirect handler
│   ├── layout.tsx            # Root (fonts, suppressHydrationWarning)
│   └── globals.css
├── components/
│   ├── ui/                   # Base UI / shadcn primitives
│   ├── auth/                 # GoogleSignIn button
│   ├── dashboard/            # AppSidebar, UserMenu, nav-config
│   ├── lessons/              # Lesson components and actions
│   └── theme/                # ThemeProvider, ThemeToggle
├── lib/
│   ├── supabase/             # browser, server, middleware, admin, storage, session
│   └── utils.ts              # cn()
└── types/
    └── db.ts                 # Role, Profile, ROLE_HOME
middleware.ts                 # Route guard + RBAC redirects
supabase/migrations/          # SQL schema (run in order, 0001 → 0007)
```

## Managing users

Sign in as admin and go to **/admin/users**. The page has three tabs — Admins,
Teachers, Students — each showing a count badge and a table of users in that role.

- **Add user** (modal) — available on the Admins and Teachers tabs. Enter the
  Google email, full name, and role. Students self-enroll on first sign-in.
- **View** — opens the user detail page with profile info and (for
  teachers/admins) every course they are assigned to and their position.
- **Block / Unblock** — suspends or reinstates the account. Blocking calls
  Supabase's auth ban, invalidating all existing tokens immediately.

To change a role manually via SQL:

```sql
update public.profiles set role = 'teacher' where email = 'someone@school.edu';
```

## Storage buckets

| Bucket | Max size | Used for |
|---|---|---|
| `avatars` | 2 MB | User profile photos (user-owned folder) |
| `course-images` | 5 MB | Course cover images (admin-only write) |
| `news-images` | 5 MB | News item cover images (admin-only write) |

## Notes

- **Teacher avatar on the landing page** — the `featured_teachers` table holds a
  snapshot of each teacher's avatar. When a teacher updates their profile photo,
  the snapshot is automatically updated. If a teacher was featured before setting
  their avatar, use the ↺ **Refresh** button in **Site content → Teachers** to
  pull the latest photo into the snapshot.
- **Hydration warning suppressed** — `suppressHydrationWarning` is set on both
  `<html>` and `<body>` to prevent false positives from browser extensions (e.g.
  ColorZilla) that inject attributes into the DOM before React hydrates.
