"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type State = { error?: string; success?: string } | undefined;

function bump(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}`);
  revalidatePath(`/student/courses/${courseId}`);
}

export async function createLessonAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();

  if (!courseId || !title) {
    return { error: "Title is required." };
  }
  if (title.length > 200) {
    return { error: "Title must be 200 characters or fewer." };
  }
  if (body.length > 10000) {
    return { error: "Body must be 10,000 characters or fewer." };
  }

  const supabase = await createClient();

  const { data: maxRow } = await supabase
    .from("lessons")
    .select("display_order")
    .eq("course_id", courseId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ display_order: number }>();
  const nextOrder = (maxRow?.display_order ?? -1) + 1;

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    body,
    video_url: videoUrl || null,
    display_order: nextOrder,
  });

  if (error) return { error: error.message };

  bump(courseId);
  return { success: "Lesson added." };
}

export async function updateLessonAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();

  if (!id || !title) return { error: "Title is required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({ title, body, video_url: videoUrl || null })
    .eq("id", id);

  if (error) return { error: error.message };

  if (courseId) bump(courseId);
  return { success: "Lesson saved." };
}

export async function deleteLessonAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("lessons").delete().eq("id", id);
  if (courseId) bump(courseId);
}

export async function moveLessonAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const courseId = String(formData.get("course_id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || !courseId || (direction !== "up" && direction !== "down")) return;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("lessons")
    .select("id, display_order")
    .eq("course_id", courseId)
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
    supabase.from("lessons").update({ display_order: b.display_order }).eq("id", a.id),
    supabase.from("lessons").update({ display_order: a.display_order }).eq("id", b.id),
  ]);
  bump(courseId);
}
