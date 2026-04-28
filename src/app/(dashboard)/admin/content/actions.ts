"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type State = { error?: string; success?: string } | undefined;

function bumpMarketing() {
  revalidatePath("/", "layout"); // marketing page reads multiple tables; nuke layout cache
  revalidatePath("/admin/content");
}

// ─── HERO ────────────────────────────────────────────────────────────────────

export async function updateHeroAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const badge = String(formData.get("badge") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();

  if (!title || !subtitle) {
    return { error: "Title and subtitle are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "hero", value: { badge, title, subtitle } },
      { onConflict: "key" },
    );

  if (error) return { error: error.message };

  bumpMarketing();
  return { success: "Hero saved." };
}

// ─── ABOUT ITEMS ─────────────────────────────────────────────────────────────

export async function createAboutItemAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const icon = String(formData.get("icon") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!icon || !title || !body) {
    return { error: "Icon, title and body are required." };
  }

  const supabase = await createClient();
  // Append to the end
  const { data: maxRow } = await supabase
    .from("about_items")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ display_order: number }>();
  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { error } = await supabase
    .from("about_items")
    .insert({ icon, title, body, display_order: nextOrder });

  if (error) return { error: error.message };

  bumpMarketing();
  return { success: "About item added." };
}

export async function updateAboutItemAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const id = String(formData.get("id") ?? "");
  const icon = String(formData.get("icon") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!id || !icon || !title || !body) return { error: "Missing fields." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("about_items")
    .update({ icon, title, body })
    .eq("id", id);

  if (error) return { error: error.message };

  bumpMarketing();
  return { success: "About item saved." };
}

export async function deleteAboutItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("about_items").delete().eq("id", id);
  bumpMarketing();
}

export async function moveAboutItemAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? ""); // "up" | "down"
  if (!id || (direction !== "up" && direction !== "down")) return;

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("about_items")
    .select("id, display_order")
    .order("display_order", { ascending: true })
    .returns<{ id: string; display_order: number }[]>();
  if (!items) return;

  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= items.length) return;

  const a = items[idx];
  const b = items[swapWith];
  await Promise.all([
    supabase.from("about_items").update({ display_order: b.display_order }).eq("id", a.id),
    supabase.from("about_items").update({ display_order: a.display_order }).eq("id", b.id),
  ]);
  bumpMarketing();
}

// ─── FEATURED NEWS / COURSES (ID arrays in site_settings) ────────────────────

async function setFeatured(key: string, ids: string[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: ids }, { onConflict: "key" });
  if (error) return { error: error.message };
  bumpMarketing();
  return { success: "Saved." };
}

async function readFeaturedIds(key: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle<{ value: string[] }>();
  return Array.isArray(data?.value) ? data.value : [];
}

export async function addFeaturedNewsAction(formData: FormData): Promise<State> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const ids = await readFeaturedIds("featured_news_ids");
  if (ids.includes(id)) return { error: "Already featured." };
  if (ids.length >= 5) return { error: "Maximum of 5 featured news items." };
  return setFeatured("featured_news_ids", [...ids, id]);
}

export async function removeFeaturedNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const ids = await readFeaturedIds("featured_news_ids");
  await setFeatured("featured_news_ids", ids.filter((x) => x !== id));
}

export async function moveFeaturedNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;
  const ids = await readFeaturedIds("featured_news_ids");
  const idx = ids.indexOf(id);
  if (idx === -1) return;
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= ids.length) return;
  const next = [...ids];
  [next[idx], next[swap]] = [next[swap], next[idx]];
  await setFeatured("featured_news_ids", next);
}

export async function addFeaturedCourseAction(formData: FormData): Promise<State> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const ids = await readFeaturedIds("featured_course_ids");
  if (ids.includes(id)) return { error: "Already featured." };
  if (ids.length >= 3) return { error: "Maximum of 3 featured courses." };
  return setFeatured("featured_course_ids", [...ids, id]);
}

export async function removeFeaturedCourseAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const ids = await readFeaturedIds("featured_course_ids");
  await setFeatured("featured_course_ids", ids.filter((x) => x !== id));
}

export async function moveFeaturedCourseAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;
  const ids = await readFeaturedIds("featured_course_ids");
  const idx = ids.indexOf(id);
  if (idx === -1) return;
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= ids.length) return;
  const next = [...ids];
  [next[idx], next[swap]] = [next[swap], next[idx]];
  await setFeatured("featured_course_ids", next);
}

// ─── FEATURED TEACHERS (snapshot rows) ───────────────────────────────────────

export async function addFeaturedTeacherAction(formData: FormData): Promise<State> {
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return { error: "Missing profile id." };

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("featured_teachers")
    .select("id")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (existing) return { error: "Teacher is already featured." };

  const { count } = await supabase
    .from("featured_teachers")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) >= 5) return { error: "Maximum of 5 featured teachers." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", profileId)
    .single<{ full_name: string | null; avatar_url: string | null; role: string }>();

  if (!profile || profile.role !== "teacher") {
    return { error: "Profile is not a teacher." };
  }

  const { error } = await supabase.from("featured_teachers").insert({
    profile_id: profileId,
    display_order: count ?? 0,
    full_name: profile.full_name ?? "",
    avatar_url: profile.avatar_url,
    bio: "",
  });

  if (error) return { error: error.message };

  bumpMarketing();
  return { success: "Teacher featured." };
}

export async function updateFeaturedTeacherAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!id || !fullName) {
    return { error: "Name is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("featured_teachers")
    .update({ full_name: fullName, bio })
    .eq("id", id);

  if (error) return { error: error.message };

  bumpMarketing();
  return { success: "Teacher saved." };
}

export async function removeFeaturedTeacherAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("featured_teachers").delete().eq("id", id);
  bumpMarketing();
}

export async function moveFeaturedTeacherAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("featured_teachers")
    .select("id, display_order")
    .order("display_order", { ascending: true })
    .returns<{ id: string; display_order: number }[]>();
  if (!rows) return;

  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= rows.length) return;

  const a = rows[idx];
  const b = rows[swap];
  await Promise.all([
    supabase.from("featured_teachers").update({ display_order: b.display_order }).eq("id", a.id),
    supabase.from("featured_teachers").update({ display_order: a.display_order }).eq("id", b.id),
  ]);
  bumpMarketing();
}

export async function syncFeaturedTeacherFromProfileAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("featured_teachers")
    .select("profile_id")
    .eq("id", id)
    .single<{ profile_id: string }>();
  if (!row) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", row.profile_id)
    .single<{ full_name: string | null; avatar_url: string | null }>();
  if (!profile) return;

  await supabase
    .from("featured_teachers")
    .update({
      full_name: profile.full_name ?? "",
      avatar_url: profile.avatar_url,
    })
    .eq("id", id);

  bumpMarketing();
}
