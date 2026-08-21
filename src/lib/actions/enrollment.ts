"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/guards";

/**
 * Enrollment actions, shared by the public course pages and the student
 * dashboard. Both used to carry their own near-identical copy, which had
 * drifted: the student copy revalidated only its own route, so enrolling from
 * /student/courses left the public pages showing stale state.
 */

/** Every route whose content depends on a student's enrollment rows. */
function revalidateEnrollmentViews(courseId: string) {
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/student/courses");
  // A new request shows up in the admin approval queue straight away.
  revalidatePath("/admin/enrollments");
}

export async function enrollAction(courseId: string) {
  const { user } = await requireRole("student");
  const supabase = await createClient();

  // Clear a previous rejection so the student can ask again.
  await supabase
    .from("student_enrollments")
    .delete()
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "declined");

  const { error } = await supabase
    .from("student_enrollments")
    .insert({ student_id: user.id, course_id: courseId });

  if (error) throw new Error(error.message);
  revalidateEnrollmentViews(courseId);
}

export async function unenrollAction(courseId: string) {
  const { user } = await requireRole("student");
  const supabase = await createClient();

  const { error } = await supabase
    .from("student_enrollments")
    .delete()
    .eq("student_id", user.id)
    .eq("course_id", courseId);

  if (error) throw new Error(error.message);
  revalidateEnrollmentViews(courseId);
}
