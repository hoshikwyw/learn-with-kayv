"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, validateImage } from "@/lib/supabase/storage";

const COURSE_MAX_BYTES = 5 * 1024 * 1024;

type State = { error?: string; success?: string } | undefined;

export async function uploadCourseImageAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const courseId = String(formData.get("course_id") ?? "");
  const file = formData.get("image");

  if (!courseId) return { error: "Missing course id." };

  const validation = validateImage(file, COURSE_MAX_BYTES);
  if (validation.kind === "missing") {
    return { error: "Pick an image to upload." };
  }
  if (validation.kind === "error") return { error: validation.message };

  const supabase = await createClient();
  const result = await uploadImage(
    supabase,
    "course-images",
    courseId,
    validation.file,
    validation.ext,
  );
  if (!result.ok) return { error: result.error };

  const { error } = await supabase
    .from("courses")
    .update({ image_url: result.publicUrl })
    .eq("id", courseId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  revalidatePath("/", "layout");
  return { success: "Course image updated." };
}
