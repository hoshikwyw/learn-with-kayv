"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";

export async function enrollAction(courseId: string) {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || profile?.role !== "student") throw new Error("Unauthorized");

  const supabase = await createClient();

  // Remove any previous declined row so the student can re-request
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
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/student/courses");
}

export async function unenrollAction(courseId: string) {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || profile?.role !== "student") throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_enrollments")
    .delete()
    .eq("student_id", user.id)
    .eq("course_id", courseId);

  if (error) throw new Error(error.message);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/student/courses");
}
