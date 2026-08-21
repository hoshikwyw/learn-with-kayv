import "server-only";

import type { User } from "@supabase/supabase-js";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import type { Profile, Role } from "@/types/db";

/**
 * Authorization helpers for Server Actions.
 *
 * Access is enforced at three layers, and this is the third:
 *
 *   1. `middleware.ts`  — keeps a role out of another role's route prefix.
 *   2. Postgres RLS     — the real boundary; every table has policies.
 *   3. These guards     — so an action states its own requirement instead of
 *                         inheriting it from whichever page happened to link
 *                         to it. Server Actions are POST endpoints: being
 *                         declared in a page under /admin does NOT stop
 *                         someone from invoking them directly.
 *
 * Layer 3 matters most for anything touching `createAdminClient()`, which
 * uses the service-role key and bypasses RLS entirely.
 *
 * Two flavours, because the codebase has two kinds of action:
 *
 *   requireRole() throws  — for actions called from a transition, where an
 *                           exception surfaces as an error boundary.
 *   authorize()   returns — for `useActionState` actions, which must hand a
 *                           readable `{ error }` back to the form.
 */

export type AuthedSession = { user: User; profile: Profile };

export type AuthorizeResult =
  | ({ ok: true } & AuthedSession)
  | { ok: false; error: string };

/**
 * Resolves the caller and checks their role. Never throws — the caller decides
 * what to do with a failure.
 *
 * Pass no roles to require only that someone is signed in.
 */
export async function authorize(
  ...allowed: Role[]
): Promise<AuthorizeResult> {
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user) return { ok: false, error: "You are not signed in." };
  if (!profile) {
    return {
      ok: false,
      error: "No profile found for your account. Ask an admin to add you.",
    };
  }
  if (profile.blocked) {
    return { ok: false, error: "This account has been blocked." };
  }
  if (allowed.length > 0 && !allowed.includes(profile.role)) {
    return { ok: false, error: "You are not allowed to do that." };
  }

  return { ok: true, user, profile };
}

/** `authorize()`, but throws instead of returning a result. */
export async function requireRole(...allowed: Role[]): Promise<AuthedSession> {
  const result = await authorize(...allowed);
  if (!result.ok) throw new Error(result.error);
  return { user: result.user, profile: result.profile };
}

/** Signed in, any role. */
export async function requireUser(): Promise<AuthedSession> {
  return requireRole();
}

/** Admins only. Use for anything that reaches for the service-role client. */
export async function requireAdmin(): Promise<AuthedSession> {
  return requireRole("admin");
}

/** Admins and teachers — course content, grades, lessons. */
export async function requireStaff(): Promise<AuthedSession> {
  return requireRole("admin", "teacher");
}
