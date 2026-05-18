"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/types/db";

type State = { error?: string; success?: string } | undefined;

export async function createUserAction(
  _prev: State,
  formData: FormData,
): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "") as Role;

  if (!email || !fullName) {
    return { error: "Email and full name are required." };
  }
  if (role !== "teacher" && role !== "admin") {
    return { error: "Role must be teacher or admin." };
  }

  // Defense in depth: confirm the caller is actually an admin.
  // (Middleware already gates /admin/*, but the service-role client bypasses RLS.)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: Role }>();
  if (me?.role !== "admin") return { error: "Forbidden." };

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
): Promise<State> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };
  if (targetId === user.id) return { error: "You cannot block your own account." };

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: Role }>();
  if (me?.role !== "admin") return { error: "Forbidden." };

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
