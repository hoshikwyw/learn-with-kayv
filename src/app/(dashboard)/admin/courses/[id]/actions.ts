"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, validateImage } from "@/lib/supabase/storage";

const COURSE_MAX_BYTES = 5 * 1024 * 1024;

type State = { error?: string; success?: string } | undefined;

function bump(courseId: string) {
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  revalidatePath("/", "layout");
}

// ─── IMAGE ───────────────────────────────────────────────────────────────────

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

  bump(courseId);
  return { success: "Course image updated." };
}

// ─── DESCRIPTION ─────────────────────────────────────────────────────────────

export async function updateCourseDescriptionAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const courseId = String(formData.get("course_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (!courseId) return { error: "Missing course id." };
  if (description.length > 2000) {
    return { error: "Description must be 2000 characters or fewer." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({ description: description || null })
    .eq("id", courseId);

  if (error) return { error: error.message };

  bump(courseId);
  return { success: "Description saved." };
}

// ─── TEACHER ASSIGNMENT ──────────────────────────────────────────────────────

export async function assignTeacherAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const courseId = String(formData.get("course_id") ?? "");
  const teacherId = String(formData.get("teacher_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!courseId || !teacherId) {
    return { error: "Pick a teacher." };
  }
  if (role !== "main" && role !== "assistant") {
    return { error: "Role must be main or assistant." };
  }

  const supabase = await createClient();

  // Guardrail: confirm the picked profile is actually a teacher.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", teacherId)
    .single<{ role: string }>();
  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    return { error: "Selected user is not a teacher or admin." };
  }

  const { error } = await supabase
    .from("course_teachers")
    .insert({ course_id: courseId, teacher_id: teacherId, role });

  if (error) {
    // 23505 = unique violation (either teacher already assigned, or "main" slot taken)
    if (error.code === "23505") {
      if (role === "main") {
        return {
          error:
            "This course already has a main teacher. Remove them first or assign as assistant.",
        };
      }
      return { error: "This teacher is already assigned to the course." };
    }
    return { error: error.message };
  }

  bump(courseId);
  return { success: "Teacher assigned." };
}

export async function unassignTeacherAction(formData: FormData) {
  const courseId = String(formData.get("course_id") ?? "");
  const teacherId = String(formData.get("teacher_id") ?? "");
  if (!courseId || !teacherId) return;

  const supabase = await createClient();
  await supabase
    .from("course_teachers")
    .delete()
    .eq("course_id", courseId)
    .eq("teacher_id", teacherId);

  bump(courseId);
}
