import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import type { Profile } from "@/types/db";
import { UsersPageClient } from "./users-tabs";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const [supabase, { user }] = await Promise.all([
    createClient(),
    requireUser(),
  ]);

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, blocked, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  const all = users ?? [];

  return (
    <>
      <PageHeader
        title="Users"
        description="Everyone enrolled or working in the school."
      />

      <UsersPageClient
        admins={all.filter((u) => u.role === "admin")}
        teachers={all.filter((u) => u.role === "teacher")}
        students={all.filter((u) => u.role === "student")}
        currentUserId={user.id}
      />
    </>
  );
}
