# Learn-with-kayv

A private-school management platform. One place for students to track grades and
timetables, teachers to manage their classes, and admins to run the school.

## Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-nova style)
- **Supabase** — Postgres + Auth via `@supabase/ssr`
- **lucide-react** — icons

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Create a Supabase project, then copy `.env.local.example` to `.env.local` and
fill in your project URL + anon key:

```bash
cp .env.local.example .env.local
```

### 3. Run the SQL migration

In the Supabase dashboard, open **SQL Editor** and paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This
creates:

- `profiles` table (RBAC source of truth)
- `courses` and `grades` tables
- A trigger that auto-creates a profile on every signup and seeds the first
  admin by email whitelist (default: `khaingwutyiwin1712@gmail.com` — edit the SQL if
  you use a different email)
- Row-level security policies for all three roles

### 4. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Routes

URL                   | Who sees it           | Notes
---                   | ---                   | ---
`/`                   | Public                | Landing (Hero + About + News)
`/login` `/signup`    | Signed-out only       | Signed-in users are redirected to their role home
`/admin/*`            | Admin only            | Users list, course creation
`/teacher/*`          | Teacher only          | Assigned courses, Add Grade
`/student/*`          | Student only          | Grades, Timetable

Role enforcement is done in [`middleware.ts`](middleware.ts), which reads the
user's role from `profiles` and redirects mismatched paths to their own home.

## Folder layout

```
src/
├── app/
│   ├── (marketing)/          # Public site (header + footer)
│   ├── (auth)/               # login, signup, verify-email, server actions
│   ├── (dashboard)/          # Sidebar + RBAC shell
│   │   ├── admin/
│   │   ├── teacher/
│   │   └── student/
│   ├── auth/callback/        # Supabase OAuth redirect handler
│   ├── layout.tsx            # Root (fonts + TooltipProvider)
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   └── dashboard/            # app-sidebar, user-menu, nav-config
├── lib/
│   ├── supabase/             # browser, server, middleware clients
│   └── utils.ts              # cn()
└── types/
    └── db.ts                 # Role, Profile, ROLE_HOME
middleware.ts                 # RBAC bouncer
supabase/migrations/          # SQL schema
```

## Making yourself admin

If you signed up with an email other than `khaingwutyiwin1712@gmail.com`, update your
profile after signup:

```sql
update public.profiles set role = 'admin' where email = 'you@school.edu';
```
