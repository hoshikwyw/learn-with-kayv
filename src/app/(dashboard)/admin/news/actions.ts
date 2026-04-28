"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type State = { error?: string; success?: string } | undefined;

function bump() {
  revalidatePath("/admin/news");
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export async function createNewsAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publishedOn = String(formData.get("published_on") ?? "").trim();

  if (!title || !body || !publishedOn) {
    return { error: "Title, body, and date are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_items")
    .insert({ title, body, published_on: publishedOn });

  if (error) return { error: error.message };

  bump();
  return { success: "News item added." };
}

export async function updateNewsAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publishedOn = String(formData.get("published_on") ?? "").trim();

  if (!id || !title || !body || !publishedOn) {
    return { error: "All fields are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("news_items")
    .update({ title, body, published_on: publishedOn })
    .eq("id", id);

  if (error) return { error: error.message };

  bump();
  return { success: "News item saved." };
}

export async function deleteNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("news_items").delete().eq("id", id);

  // Also remove from featured if present
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "featured_news_ids")
    .maybeSingle<{ value: string[] }>();
  const ids = Array.isArray(data?.value) ? data.value : [];
  if (ids.includes(id)) {
    await supabase
      .from("site_settings")
      .upsert(
        { key: "featured_news_ids", value: ids.filter((x) => x !== id) },
        { onConflict: "key" },
      );
  }

  bump();
}
