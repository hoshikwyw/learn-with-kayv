"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, validateImage } from "@/lib/supabase/storage";

const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

type State = { error?: string; success?: string } | undefined;

export async function updateProfileAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const file = formData.get("avatar");

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

  const validation = validateImage(file, AVATAR_MAX_BYTES);
  if (validation.kind === "error") return { error: validation.message };

  const updates: { full_name: string; avatar_url?: string } = {
    full_name: fullName,
  };

  if (validation.kind === "ok") {
    const result = await uploadImage(
      supabase,
      "avatars",
      user.id,
      validation.file,
      validation.ext,
    );
    if (!result.ok) return { error: result.error };
    updates.avatar_url = result.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return {
    success:
      validation.kind === "ok"
        ? "Profile and avatar updated."
        : "Profile updated.",
  };
}
