# Template Refactor — Progress & Handoff

Goal: turn this project into a **white-label template** that can be sold to
education centres, where rebranding means editing one config file and picking a
theme — not hunting hardcoded strings through the codebase.

**Status: 4 of 6 parts done.** Working tree clean, all four parts committed.

| Part | What | Commit | Status |
|---|---|---|---|
| 1 | Branding — single source of truth | `bac057d` | ✅ done |
| 2 | Theme — derived colour system | `72d3995` | ✅ done |
| 3 | Shared format / auth / action layer | `e7189bd` | ✅ done |
| 4 | Shared UI primitives + skeletons | `823a182` | ✅ done |
| 5 | Database types & query layer | — | ⬜ next |
| 6 | Docs — rebrand-and-ship guide | — | ⬜ todo |

Net so far: **~-600 lines**, plus 12 bugs fixed (listed at the bottom).

---

## How to rebrand this template (current state)

Two files and one env var:

1. **`src/config/site.ts`** — name, description, tagline, URL, founded year,
   locale, brand icon, contact, socials, marketing nav, and a `terminology`
   block (Course / Lesson / role labels) for centres that say
   "Trainer / Trainee / Program".
2. **`src/app/globals.css`** — the `--brand-h` / `--brand-c` / `--brand-l`
   knobs at the top drive the entire palette.
3. **`.env.example`** — every field above can instead be set per-deployment via
   `NEXT_PUBLIC_SITE_*`, so one codebase can serve several customers.

Colour presets (set `NEXT_PUBLIC_SITE_THEME` or `siteConfig.theme`):
`indigo` · `blue` · `teal` · `emerald` · `violet` · `rose` · `amber` · `neutral`

---

## Part 1 — Branding (`bac057d`)

Brand name was hardcoded in 8 files + 2 migrations.

**Added**
- `src/config/site.ts` — the single rebrand surface, every field env-overridable.
- `src/components/brand/brand.tsx` — `<Brand>` / `<BrandMark>`, replacing three
  hand-rolled logo lockups. `variant="boxed"` for the sidebar (survives
  icon-collapse), `href={null}` for non-clickable use.
- `.env.example` — was missing entirely.

**Deduped** — `HERO_DEFAULT` (copy-pasted in the landing page and the CMS page)
now derives from `siteConfig`; `ROLE_LABEL` moved from `nav-config.ts` into the
config beside the rest of the vocabulary.

> `grep -rniE "kayv|learn-with" src supabase` now matches **only** the two
> default values inside `src/config/site.ts`.

---

## Part 2 — Theme (`72d3995`)

The palette was `oklch(x 0 0)` top to bottom — every value zero-chroma. There
was no brand colour to change, only greys.

`globals.css` is now **derived** from four knobs. 8 presets ship as
`:root[data-theme="…"]` blocks, written onto `<html>` by the root layout.
`neutral` reproduces the original monochrome look, so nothing was lost.

Added `--success` / `--warning` semantic tokens (+ `Badge` variants). These stay
on **fixed hues** on purpose — a "declined" badge must not turn green because
the school picked green branding.

**Contrast was measured, not assumed.** All 8 presets pass WCAG AA for primary
button text in both modes (4.75–17.16:1). That check caught a real problem: the
first `--warning` measured **3.72:1** on a light background — below AA, and used
at `text-xs`. Darkened `L 0.62 → 0.55` (now 4.95:1).

---

## Part 3 — Shared domain layer (`e7189bd`)

Net **-226 lines**.

**Added**
- `src/lib/format.ts` — `initials()`, `displayName()`, `formatDate()`,
  `formatDateTime()`
- `src/lib/auth/guards.ts` — `authorize()` (returns a result, for
  `useActionState` forms) and `requireRole()` / `requireUser()` /
  `requireAdmin()` / `requireStaff()` (throw, for transition-style actions)
- `src/lib/actions/state.ts` — one `ActionState` type, replacing 7 local copies
- `src/lib/actions/enrollment.ts` + `src/components/courses/enroll-button.tsx`

**Deduped** — `initials()` deleted from **11 files**; 11 date call sites in two
inconsistent shapes unified; the marketing/student `actions.ts` +
`enroll-button.tsx` pairs merged.

The two courses **pages** were deliberately *not* merged — one is a card grid,
the other a list. That is intentional design, not duplication.

### Security: 21 unguarded Server Actions

Server Actions are POST endpoints. Living in a file under `/admin/` does nothing
to stop a direct invocation.

| File | Unguarded actions |
|---|---|
| `admin/content/actions.ts` | **16 — zero authorization** |
| `admin/news/actions.ts` | 3 |
| `admin/courses/` + `[id]/actions.ts` | 5 |
| `components/lessons/actions.ts` | 4 |

RLS was the only thing behind them — it held, but a non-admin got a raw Postgres
error instead of a clean refusal, and there was zero margin if a policy is ever
loosened. All now declare their own requirement. Guards in `createUserAction`
and `updateProfileAction` were also moved **above** input validation, so an
unauthorized caller can no longer probe the form's rules.

---

## Part 4 — UI primitives (`823a182`)

Net **-385 lines**.

**Added** — `PageHeader` (replaced 14 hand-built headers), `EmptyState`,
`CourseCover` (the 16:9 image-or-placeholder block, copied into 4 layouts), and
`src/components/ui/skeletons.tsx` with 8 primitives.

**Skeletons: 656 → 329 lines.** Most `loading.tsx` files are now 3–8 lines. The
point is not the line count — a skeleton built from the same primitives as the
real page stays in sync when someone restyles it.

Left alone on purpose: the login card, the user-detail avatar row, and the
marketing section headings — different shapes, not duplication.

---

## ⬜ Part 5 — Database types & query layer (NEXT)

**Problem.** `Course`, `NewsItem`, `AboutItem`, `FeaturedTeacher`, `GradeRow`,
`AssignmentRow` are redeclared inline in nearly every page that reads them, each
with its own slightly different shape, and the Supabase `.select("…")` column
list is duplicated right beside each one. Change a column and you must find
every copy by hand.

**Plan**
1. Move the row types into `src/types/db.ts` (or split into `src/types/`
   modules) — `Course`, `CourseWithTeachers`, `NewsItem`, `AboutItem`,
   `FeaturedTeacher`, `Grade`, `Lesson`, `CourseTeacher`, `Enrollment`.
2. Add `src/lib/queries/` holding the shared column lists as constants
   (e.g. `COURSE_COLUMNS`, `COURSE_WITH_TEACHERS_COLUMNS`) so the `select()`
   string and the TypeScript type are declared together and cannot drift.
3. Replace the inline `type X = {…}` declarations page by page.
4. Check every `.returns<T>()` still matches its select list.

**Known issue to fix during Part 5:** `src/app/(dashboard)/student/courses/page.tsx`
carries a local `CourseRow` type added in Part 3 as a stopgap — fold it into the
shared types.

---

## ⬜ Part 6 — Docs

- Rewrite `README.md` as a **rebrand-and-ship guide**: clone → set env → run
  migrations → pick a theme → deploy. It currently documents features, not the
  resale workflow.
- Update `DOCS.md` — it still describes the pre-refactor structure and does not
  mention `src/config/`, `src/lib/auth/`, `src/lib/format.ts`, or the theme
  token system.
- Consider a `CLAUDE.md` recording the conventions established here (tokens over
  hardcoded colours, guards on every action, primitives over hand-rolled markup).

---

## Verification used at every step

```bash
npx tsc --noEmit                                  # types
npx eslint .                                      # lint
NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy" \
SUPABASE_SERVICE_ROLE_KEY="dummy" npx next build  # build (21 routes)
```

All three pass on `823a182`.

---

## Bugs fixed along the way

Found while refactoring, not sought out:

1. **`npm run lint` was completely broken** — `eslint.config.mjs` spread
   `eslint-config-next`'s exports, but v15 exports flat-config *objects*. Every
   run died with `nextVitals is not iterable`. Rewritten with `FlatCompat`;
   added the missing `@eslint/eslintrc` devDependency.
2. Once lint worked it surfaced **3 unused imports**, now removed.
3. `NextTopLoader color="hsl(var(--primary))"` — `--primary` is an `oklch()`
   value, so `hsl(oklch(…))` is invalid CSS. The loading bar had no colour.
4. The same `hsl()`-wrapping bug in `sidebar.tsx:484` — two invalid
   `box-shadow` values.
5. Dark mode's `--sidebar-primary` was a hardcoded **purple** while every other
   token was grey — a leftover that would have shipped as a mystery accent.
6. `--warning` failed WCAG AA (3.72:1) at `text-xs` on light backgrounds.
7. **21 Server Actions had no authorization check** (see Part 3).
8. Enroll/unenroll revalidation had **drifted between the two copies** — the
   student copy revalidated only its own route, leaving the public pages stale;
   neither revalidated `/admin/enrollments`, so new requests did not appear in
   the admin queue until a hard refresh.
9. `getCurrentUserAndProfile()` never selected the `blocked` column, so any
   check against `profile.blocked` was **dead code**.
10. **Four `user!` non-null assertions** (`student/courses`, `admin/users`,
    `student/grades`) that would throw on a null session. **Zero remain.**
11. Two marketing `loading.tsx` files **omitted their page container**, so
    skeletons rendered edge-to-edge and the layout jumped when content arrived.
12. A raw `<td>` inside a `<TableRow>` in the news table bypassed `TableCell`
    styling entirely.

---

## Conventions established (keep following these)

- **Never hardcode a colour** in a component. Use a token: `bg-primary`,
  `text-muted-foreground`, `text-success`, `text-warning`.
- **Never hardcode the brand name.** Read `siteConfig`.
- **Every Server Action declares its own authorization** via `@/lib/auth/guards`
  — never rely on RLS or middleware alone.
- **No `!` non-null assertions.** Use a guard that narrows the type.
- **Format dates with `formatDate()`**, never bare `toLocaleDateString()` — the
  locale is pinned in config because a bare call resolves against the server's
  locale during SSR and the browser's on the client, which is a hydration
  mismatch.
- **Reach for a primitive** (`PageHeader`, `EmptyState`, `CourseCover`, the
  skeleton kit) before hand-rolling markup.
