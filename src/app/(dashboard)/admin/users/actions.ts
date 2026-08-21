"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { authorize } from "@/lib/auth/guards";
import type { ActionState } from "@/lib/actions/state";
import type { Role } from "@/types/db";

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Defense in depth: middleware gates /admin/*, but a Server Action is a POST
  // endpoint that can be invoked directly — and the service-role client below
  // bypasses RLS entirely, so this is the only check standing between a
  // non-admin and user creation.
  const auth = await authorize("admin");
  if (!auth.ok) return { error: auth.error };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as Role;

  if (!email || !fullName) {
    return { error: "Email and full name are required." };
  }
  if (role !== "teacher" && role !== "admin") {
    return { error: "Role must be teacher or admin." };
  }

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createErr || !created.user) {
    return { error: createErr?.message ?? "Could not create user." };
  }

  // Trigger inserted the profile with role=student. Promote to chosen role.
  const { error: roleErr } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", created.user.id);

  if (roleErr) {
    return { error: `User created but role update failed: ${roleErr.message}` };
  }

  revalidatePath("/admin/users");
  return {
    success: `${email} created as ${role}. Tell them to sign in with Google using this exact email.`,
  };
}

export async function toggleBlockUserAction(
  targetId: string,
  block: boolean,
): Promise<ActionState> {
  const auth = await authorize("admin");
  if (!auth.ok) return { error: auth.error };
  if (targetId === auth.user.id) {
    return { error: "You cannot block your own account." };
  }

  const admin = createAdminClient();

  const { error: profileErr } = await admin
    .from("profiles")
    .update({ blocked: block })
    .eq("id", targetId);

  if (profileErr) return { error: profileErr.message };

  // Keep Supabase auth in sync — banning invalidates all existing tokens.
  const { error: banErr } = await admin.auth.admin.updateUserById(targetId, {
    ban_duration: block ? "87600h" : "none",
  });

  if (banErr) {
    await admin.from("profiles").update({ blocked: !block }).eq("id", targetId);
    return { error: banErr.message };
  }

  revalidatePath("/admin/users");
  return { success: `Account ${block ? "blocked" : "unblocked"} successfully.` };
}
