# Learn-with-Kayv — Project Documentation

A private school management platform built with **Next.js 15**, **Supabase**, and **React 19**. Three roles (admin, teacher, student) each get their own dashboard with RBAC enforced at every layer — middleware, RLS, and server actions.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Database Schema](#database-schema)
3. [Authentication & Authorization](#authentication--authorization)
4. [Routing Structure](#routing-structure)
5. [Role-Based Flows](#role-based-flows)
6. [Server Actions](#server-actions)
7. [Storage](#storage)
8. [Navigation](#navigation)
9. [Environment Variables](#environment-variables)
10. [Key Architecture Patterns](#key-architecture-patterns)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Database & Auth | Supabase (Postgres + RLS + Storage + OAuth) |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Theming | next-themes (dark / light) |
| Notifications | react-hot-toast |
| Language | TypeScript 5 |

---

## Database Schema

### Migrations overview

| File | What it adds |
|------|-------------|
| `0001_init.sql` | `profiles`, `courses`, `grades` + triggers + RBAC helpers |
| `0002_marketing_cms.sql` | `site_settings`, `about_items`, `news_items`, `featured_teachers` |
| `0003_images.sql` | `image_url` on courses + storage buckets |
| `0004_course_teachers.sql` | `course_teachers` junction table (main / assistant) |
| `0005_lessons.sql` | `lessons` per course |
| `0006_user_blocked.sql` | `blocked` flag on profiles |
| `0007_news_image.sql` | `image_url` on news_items + news-images bucket |
| `0008_enrollments.sql` | `student_enrollments` junction table |

---

### Tables

#### `profiles`
Source of truth for every user. Created automatically by trigger on `auth.users` insert.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Mirrors `auth.users.id` |
| `email` | text unique | |
| `full_name` | text | Nullable |
| `avatar_url` | text | Nullable |
| `role` | enum | `admin` / `teacher` / `student` (default: `student`) |
| `blocked` | boolean | Default false — admin can suspend |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |

**RLS:** Authenticated users read all. Users update own row. Admins update any row.

---

#### `courses`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `code` | text unique | Short identifier (e.g. `MATH101`) |
| `title` | text | |
| `description` | text | Nullable |
| `image_url` | text | Nullable, stored in `course-images` bucket |
| `created_at` | timestamptz | |

**RLS:** Authenticated users read all. Admins write.

---

#### `course_teachers`
Many-to-many between courses and teachers. One and only one `main` teacher per course enforced by a partial unique index.

| Column | Type | Notes |
|--------|------|-------|
| `course_id` | UUID FK → courses | Cascade delete |
| `teacher_id` | UUID FK → profiles | Cascade delete |
| `role` | enum | `main` / `assistant` |
| `assigned_at` | timestamptz | |

**Constraints:** `UNIQUE (course_id) WHERE role = 'main'`

**RLS:** Public read. Admin write.

---

#### `lessons`
Ordered content items belonging to a course.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `course_id` | UUID FK → courses | Cascade delete |
| `title` | text | |
| `body` | text | Markdown/plain text |
| `video_url` | text | Optional YouTube link |
| `display_order` | integer | Controls sequence |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated |

**RLS:** Authenticated users read all. Admins write any. Teachers write lessons for their assigned courses only.

---

#### `grades`

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `student_id` | UUID FK → profiles | |
| `course_id` | UUID FK → courses | |
| `teacher_id` | UUID FK → profiles | Who recorded it |
| `score` | numeric | Check: 0 ≤ score ≤ 100 |
| `created_at` | timestamptz | |

**RLS:** Students see own rows. Teachers see rows they entered. Admins see all. Insert: teacher must be assigned to the course.

---

#### `student_enrollments`

| Column | Type | Notes |
|--------|------|-------|
| `student_id` | UUID FK → profiles | Cascade delete |
| `course_id` | UUID FK → courses | Cascade delete |
| `enrolled_at` | timestamptz | |

**PK:** `(student_id, course_id)`

**RLS:** Students manage their own rows. Teachers/admins read all. Admins write all.

---

#### Marketing tables

| Table | Purpose |
|-------|---------|
| `site_settings` | Key/value JSON store (`hero`, `featured_news_ids`, `featured_course_ids`) |
| `about_items` | Cards on the landing page About section |
| `news_items` | School news posts (title, body, date, optional image) |
| `featured_teachers` | Denormalized teacher snapshots shown on landing page |

**RLS on all:** Public read. Admin write.

---

### Helper function

```sql
public.current_role_for(uid uuid) → text
```
Reads `profiles.role` without recursing through RLS. Used inside all policies to avoid infinite loops.

---

## Authentication & Authorization

### Sign-in flow

```
User clicks "Continue with Google"
  → signInWithGoogleAction() (server action)
      builds redirectTo: ${NEXT_PUBLIC_SITE_URL}/auth/callback
  → Google OAuth consent screen
  → GET /auth/callback?code=…
      supabase.auth.exchangeCodeForSession(code)
      fetch profiles.role
  → redirect to role home (/admin | /teacher | /student)
```

On first ever sign-in, the Postgres trigger `on_auth_user_created` fires and inserts a `profiles` row with `role = 'student'`. An admin must manually promote the user via `/admin/users/[id]`.

---

### RBAC enforcement — three layers

| Layer | Mechanism |
|-------|-----------|
| **Routing** | `src/lib/supabase/middleware.ts` — redirects users whose role doesn't match the URL prefix |
| **Data** | Supabase RLS policies on every table |
| **Actions** | Server actions call `getCurrentUserAndProfile()` and throw if role is wrong |

#### Middleware rules

- Unauthenticated on a protected path → `/login?redirect=…`
- Authenticated on `/login` → role home
- Authenticated on wrong role prefix (e.g., student hitting `/admin`) → their role home
- `/auth/callback` is always allowed through

---

## Routing Structure

```
/                          Public landing page
/login                     Google sign-in

/auth/callback             OAuth code exchange (GET route)

/admin                     Admin dashboard
/admin/users               User list (all roles)
/admin/users/[id]          User detail & course assignments
/admin/courses             Course catalog
/admin/courses/[id]        Course editor (image, description, teachers, lessons)
/admin/news                News management
/admin/content             Marketing CMS (hero, about, featured content)

/teacher                   Teacher's course list
/teacher/courses/[id]      Course viewer + lessons
/teacher/grades            Enter student grades

/student                   Student overview
/student/courses           Browse & enroll in courses
/student/grades            View own grade transcript
/student/timetable         Weekly schedule (v2 placeholder)

/profile                   Edit own name & avatar (all roles)
```

---

## Role-Based Flows

### New user onboarding

```
1. Sign in with Google
2. Trigger creates profile (role = student)
3. Admin goes to /admin/users, opens user detail
4. Promotes user to teacher or admin
5. User signs out and back in → routed to their new role home
```

---

### Student — enroll in a course

```
/student/courses
  Page fetches:
    - all courses (with main teacher name)
    - student's existing enrollments
  
  Enroll button (EnrollButton client component):
    → enrollAction(courseId)          "use server"
        INSERT student_enrollments
        revalidatePath("/student/courses")
    → button changes to "Unenroll"

  Unenroll:
    → unenrollAction(courseId)
        DELETE student_enrollments WHERE student_id = me AND course_id = ?
```

---

### Student — view grades

```
/student/grades
  SELECT grades JOIN courses WHERE student_id = me
  Displays: course title, code, score, date
  Sorted: newest first
```

---

### Admin — create a course

```
/admin/courses
  CreateCourseDialog → createCourseAction(title, code)
    INSERT courses (title, code)
    On duplicate code → user-friendly error message
  
  → /admin/courses/[id] opens automatically
```

---

### Admin — configure a course

```
/admin/courses/[id]
  Parallel data fetch:
    - course row
    - course_teachers (with profile names)
    - lessons (ordered by display_order)

  Sections:
  ┌─ Course image ──────────────────────────────────────────┐
  │  uploadCourseImageAction → uploads to course-images     │
  │  bucket, sets courses.image_url                         │
  └─────────────────────────────────────────────────────────┘
  ┌─ Description ───────────────────────────────────────────┐
  │  updateCourseDescriptionAction (max 2000 chars)          │
  └─────────────────────────────────────────────────────────┘
  ┌─ Teacher assignment ────────────────────────────────────┐
  │  assignTeacherAction(email, role)                        │
  │    - validates user exists and is teacher/admin         │
  │    - INSERT course_teachers                             │
  │    - partial unique index prevents two mains            │
  │  unassignTeacherAction(teacherId)                        │
  └─────────────────────────────────────────────────────────┘
  ┌─ Lessons ───────────────────────────────────────────────┐
  │  createLessonAction, updateLessonAction,                 │
  │  deleteLessonAction, moveLessonAction (swap order)       │
  └─────────────────────────────────────────────────────────┘
```

---

### Teacher — enter grades

```
/teacher/grades
  Form: student email + course code + score (0–100)
  
  Server action:
    1. Resolve student by email → profiles
    2. Resolve course by code → courses
    3. Verify teacher is in course_teachers for this course (RLS also enforces)
    4. INSERT grades (student_id, course_id, teacher_id, score)
```

---

### Admin — marketing CMS

```
/admin/content  (tabs)

  Hero tab:
    updateHeroAction → UPSERT site_settings WHERE key = 'hero'
    Fields: badge text, title, subtitle

  About items tab:
    createAboutItemAction → INSERT, auto-increments display_order
    updateAboutItemAction → UPDATE
    deleteAboutItemAction → DELETE
    moveAboutItemAction   → swap display_order with neighbor

  Featured News tab (max 5):
    Reads all news_items, user picks from list
    addFeaturedNewsAction    → append id to site_settings.featured_news_ids
    removeFeaturedNewsAction → remove from array
    moveFeaturedNewsAction   → swap positions

  Featured Courses tab (max 3):
    Same pattern as featured news

  Featured Teachers tab:
    Separate snapshot table (featured_teachers) — not a live join
    addFeaturedTeacherAction       → INSERT snapshot row from profiles
    updateFeaturedTeacherAction    → edit name/bio in snapshot
    removeFeaturedTeacherAction    → DELETE
    moveFeaturedTeacherAction      → swap display_order
    syncFeaturedTeacherFromProfileAction → refresh name/avatar from profiles
```

---

### Landing page — public

```
/  (marketing layout)
  Parallel fetch:
    - site_settings (hero, featured_news_ids, featured_course_ids)
    - about_items ORDER BY display_order
    - news_items WHERE id IN featured_news_ids (order preserved)
    - courses WHERE id IN featured_course_ids (order preserved)
    - featured_teachers ORDER BY display_order

  Renders only sections that have data (no empty states shown publicly)
```

---

## Server Actions

All mutations use Next.js `"use server"` functions — no separate API routes.

| File | Actions |
|------|---------|
| `(auth)/actions.ts` | `signInWithGoogleAction`, `signOutAction` |
| `admin/courses/[id]/actions.ts` | `createCourseAction`, `uploadCourseImageAction`, `updateCourseDescriptionAction`, `assignTeacherAction`, `unassignTeacherAction` |
| `admin/users/actions.ts` | `createUserAction`, `toggleBlockUserAction` |
| `admin/content/actions.ts` | Hero, about items, featured news/courses/teachers (CRUD + reorder) |
| `admin/news/actions.ts` | `createNewsAction`, `updateNewsAction`, `deleteNewsAction` |
| `teacher/grades/page.tsx` | `addGrade` (inline action) |
| `student/courses/actions.ts` | `enrollAction`, `unenrollAction` |
| `profile/actions.ts` | `updateProfileAction` |
| `components/lessons/actions.ts` | `createLessonAction`, `updateLessonAction`, `deleteLessonAction`, `moveLessonAction` |

---

## Storage

Three public Supabase storage buckets:

| Bucket | Max size | Used for | Who can write |
|--------|----------|----------|---------------|
| `avatars` | 2 MB | User profile photos | Owner only (`{user_id}/…`) |
| `course-images` | 5 MB | Course cover images | Admins only |
| `news-images` | 5 MB | News article images | Admins only |

**Accepted formats:** JPEG, PNG, WebP

**Upload pattern (`src/lib/supabase/storage.ts`):**
1. `validateImage(file, maxBytes)` — checks type + size
2. `uploadImage(supabase, bucket, folder, file, ext)` — clears old file first, uploads to `{folder}/image.{ext}`, returns cache-busted public URL

---

## Navigation

Defined in `src/components/dashboard/nav-config.ts`. Each role gets its own sidebar structure.

**Admin**
- Overview → Dashboard
- Manage → Users, Courses, News
- Marketing → Site content

**Teacher**
- Overview → Dashboard
- Teaching → My Courses, Grades

**Student**
- Overview → Dashboard
- Learning → Courses, My Grades, Timetable

---

## Environment Variables

| Variable | Where used | Notes |
|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (admin client) | Bypasses RLS — never expose to client |
| `NEXT_PUBLIC_SITE_URL` | OAuth redirect URL | Must match Vercel domain in production |

> **Production gotcha:** Set `NEXT_PUBLIC_SITE_URL` to your Vercel domain in the Vercel dashboard. Also add `https://your-app.vercel.app/auth/callback` to the Supabase allowed redirect URLs list.

---

## Key Architecture Patterns

### Data fetching
- All data fetching happens in **Server Components** — no `useEffect` / client fetches.
- Concurrent queries use `Promise.all()` to avoid waterfall.
- `getCurrentUserAndProfile()` uses React `cache()` to deduplicate across the render tree.

### Mutations
- All mutations are **Server Actions** (`"use server"`). No API routes except the OAuth callback.
- After mutations, `revalidatePath()` clears the Next.js cache for affected pages.

### RBAC
- Three independent layers: **middleware** (routing), **RLS** (database), **action guards** (role check in server action).
- The `current_role_for()` Postgres function is the single source of truth inside policies.

### Image management
- Each entity gets its own storage folder (`{course_id}/image.jpg`).
- Old files are deleted before each new upload to prevent orphaned blobs.
- Public URLs are cache-busted with a timestamp query param after upload.

### Featured content ordering
- `display_order` integer column + swap-with-neighbor action (no gap rebalancing needed).
- Featured IDs stored as a JSONB array in `site_settings`; array order = display order on landing page.
