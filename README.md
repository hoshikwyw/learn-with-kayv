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
fill in:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API → `service_role secret`. Server-only; powers the admin "Create user" flow. **Bypasses RLS — never commit it or expose it client-side.**

```bash
cp .env.local.example .env.local
```

### 3. Run the SQL migration

In the Supabase dashboard, open **SQL Editor** and paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This
creates:

- `profiles` table (RBAC source of truth)
- `courses` and `grades` tables
- A trigger that auto-creates a profile on every signup with role `student`
- Row-level security policies for all three roles

### 4. Bootstrap the first admin

Roles work like this:

- **Student** — anyone who signs up via the public form. Default for everyone.
- **Teacher / Admin** — created by an existing admin from `/admin/users`.

Since there's no admin yet, create the first one manually:

1. **Supabase dashboard → Authentication → Users → "Add user"**: enter your email and a password, check "Auto Confirm User".
2. The signup trigger creates a profile with role `student`. Promote it via **SQL Editor**:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-email@example.com';
   ```
3. Sign in to the app. From `/admin/users` you can now create teachers and additional admins — those get role assigned directly, no SQL needed.

### 5. Start the dev server

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

## Adding teachers and admins

Sign in as an admin, go to **/admin/users**, and use the "Create user" form.
You set a temporary password; share it with the user securely (out-of-band).
After first sign-in they can change it from **/profile**.

If you ever need to demote or change a role manually, run SQL:

```sql
update public.profiles set role = 'teacher' where email = 'someone@school.edu';
```
