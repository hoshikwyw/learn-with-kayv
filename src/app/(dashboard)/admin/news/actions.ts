"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validateImage, uploadImage } from "@/lib/supabase/storage";

type State = { error?: string; success?: string } | undefined;

const NEWS_MAX_BYTES = 5 * 1024 * 1024;

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

  const imageValidation = validateImage(formData.get("image"), NEWS_MAX_BYTES);
  if (imageValidation.kind === "error") return { error: imageValidation.message };

  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("news_items")
    .insert({ title, body, published_on: publishedOn })
    .select("id")
    .single<{ id: string }>();

  if (error || !inserted) return { error: error?.message ?? "Could not create news item." };

  if (imageValidation.kind === "ok") {
    const result = await uploadImage(
      supabase,
      "news-images",
      inserted.id,
      imageValidation.file,
      imageValidation.ext,
    );
    if (!result.ok) return { error: result.error };
    await supabase
      .from("news_items")
      .update({ image_url: result.publicUrl })
      .eq("id", inserted.id);
  }

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

  const imageValidation = validateImage(formData.get("image"), NEWS_MAX_BYTES);
  if (imageValidation.kind === "error") return { error: imageValidation.message };

  const supabase = await createClient();

  const { error } = await supabase
    .from("news_items")
    .update({ title, body, published_on: publishedOn })
    .eq("id", id);

  if (error) return { error: error.message };

  if (imageValidation.kind === "ok") {
    const result = await uploadImage(
      supabase,
      "news-images",
      id,
      imageValidation.file,
      imageValidation.ext,
    );
    if (!result.ok) return { error: result.error };
    await supabase
      .from("news_items")
      .update({ image_url: result.publicUrl })
      .eq("id", id);
  }

  bump();
  return { success: "News item saved." };
}

export async function deleteNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();

  // Clean up storage folder for this news item
  const { data: files } = await supabase.storage.from("news-images").list(id);
  if (files && files.length > 0) {
    await supabase.storage
      .from("news-images")
      .remove(files.map((f) => `${id}/${f.name}`));
  }

  await supabase.from("news_items").delete().eq("id", id);

  // Remove from featured if present
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
