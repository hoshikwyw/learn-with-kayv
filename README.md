# Learn-with-kayv

A private-school management platform. One place for students to track grades and
timetables, teachers to manage their classes, and admins to run the school.

## Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-nova style)
- **Supabase** — Postgres + Auth via `@supabase/ssr` (Google OAuth only)
- **lucide-react** — icons

## Auth model

- **Google OAuth is the only sign-in method.** No email/password forms anywhere.
- **Student** — created automatically the first time someone signs in with Google whose email is not already pre-registered.
- **Teacher / Admin** — pre-created by an existing admin at `/admin/users`. The pre-created user must sign in with Google using the exact email the admin entered.

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

### 3. Configure Supabase Auth providers

In the Supabase dashboard → **Authentication → Providers**:

- **Google**: enable it. Paste your Google OAuth Client ID + Secret (Google Cloud Console → Credentials → OAuth 2.0 Client). Authorized redirect URI in Google Cloud: `https://<your-project>.supabase.co/auth/v1/callback`.
- **Email**: **disable** it. Otherwise email/password sign-in is still callable via the JS SDK even though the UI has no form for it.

In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` to the allowed redirect URLs.

### 4. Run the SQL migration

In the Supabase dashboard, open **SQL Editor** and paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates:

- `profiles` table (RBAC source of truth)
- `courses` and `grades` tables
- A trigger that auto-creates a profile on every new auth user with role `student`
- Row-level security policies for all three roles

### 5. Bootstrap the first admin

Since there's no admin yet, create the first one manually:

1. **Supabase dashboard → Authentication → Users → "Add user"** → enter the Google email you want to be admin (e.g. your @gmail.com address). Leave the password blank or set anything; check **"Auto Confirm User"**.
2. The signup trigger inserts a `profiles` row with role `student`. Promote it via **SQL Editor**:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-email@gmail.com';
   ```
3. Run `npm run dev`, go to `http://localhost:3000/login`, click **"Continue with Google"**, sign in with that exact Google account. You'll land on `/admin`.
4. From `/admin/users` you can now create teachers and additional admins.

### 6. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Routes

| URL | Who sees it | Notes |
| --- | --- | --- |
| `/` | Public | Landing (Hero + About + News) |
| `/login` | Signed-out only | Single "Continue with Google" button |
| `/profile` | Any signed-in user | Account info |
| `/admin/*` | Admin only | Users list + create form, course creation |
| `/teacher/*` | Teacher only | Assigned courses, Add Grade |
| `/student/*` | Student only | Grades, Timetable |

Role enforcement is in [`middleware.ts`](middleware.ts), which reads the user's
role from `profiles` and redirects mismatched paths to their own home.

## Folder layout

```
src/
├── app/
│   ├── (marketing)/          # Public site (header + footer)
│   ├── (auth)/               # login + server actions
│   ├── (dashboard)/          # Sidebar + RBAC shell
│   │   ├── admin/
│   │   ├── teacher/
│   │   ├── student/
│   │   └── profile/
│   ├── auth/callback/        # Supabase OAuth redirect handler
│   ├── layout.tsx            # Root (fonts + TooltipProvider)
│   └── globals.css
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── auth/                 # GoogleSignIn button
│   └── dashboard/            # app-sidebar, user-menu, nav-config
├── lib/
│   ├── supabase/             # browser, server, middleware, admin clients
│   └── utils.ts              # cn()
└── types/
    └── db.ts                 # Role, Profile, ROLE_HOME
middleware.ts                 # RBAC bouncer
supabase/migrations/          # SQL schema
```

## Adding teachers and admins

Sign in as an admin, go to **/admin/users**, and use the "Create user" form.
Enter the user's Google email + full name + role (teacher or admin). They sign
in at `/login` with that exact Google account; Supabase links the OAuth identity
to the pre-created user, and the role you assigned applies on first sign-in.

To change a role manually:

```sql
update public.profiles set role = 'teacher' where email = 'someone@school.edu';
```
