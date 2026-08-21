"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";

export async function approveEnrollmentAction(
  studentId: string,
  courseId: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_enrollments")
    .update({ status: "approved" })
    .eq("student_id", studentId)
    .eq("course_id", courseId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/teacher/courses/${courseId}`);
}

export async function declineEnrollmentAction(
  studentId: string,
  courseId: string,
) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_enrollments")
    .update({ status: "declined" })
    .eq("student_id", studentId)
    .eq("course_id", courseId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/courses/${courseId}`);
}
