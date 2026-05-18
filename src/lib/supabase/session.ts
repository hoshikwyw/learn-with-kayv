import { cache } from "react";
import { createClient } from "./server";
import type { Profile } from "@/types/db";

/**
 * Fetches the current user + profile, deduped across server components in a
 * single render pass via React `cache()`. Without this, the marketing layout
 * and the marketing page each call getUser() independently — two round-trips
 * per page load. With it, only one.
 *
 * Note: this is request-scoped; each new request still refetches.
 */
export const getCurrentUserAndProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .single<Profile>();

  return { user, profile: profile ?? null };
});
