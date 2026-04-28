"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type State = { error?: string; success?: string } | undefined;

export async function updateProfileAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!fullName) {
    return { error: "Full name is required." };
  }
  if (fullName.length > 100) {
    return { error: "Full name must be 100 characters or fewer." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { success: "Profile updated." };
}
