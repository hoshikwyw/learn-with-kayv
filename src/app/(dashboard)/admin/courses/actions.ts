"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { authorize } from "@/lib/auth/guards";
import type { ActionState } from "@/lib/actions/state";

export async function createCourseAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const auth = await authorize("admin");
  if (!auth.ok) return { error: auth.error };

  const title = String(formData.get("title") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();

  if (!title || !code) {
    return { error: "Title and code are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("courses").insert({ title, code });

  if (error) {
    return {
      error: error.code === "23505"
        ? `Course code "${code}" is already taken.`
        : error.message,
    };
  }

  revalidatePath("/admin/courses");
  return { success: `Course "${title}" created.` };
}
