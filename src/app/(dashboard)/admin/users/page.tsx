import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import type { Profile } from "@/types/db";
import { UsersPageClient } from "./users-tabs";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const [supabase, { user }] = await Promise.all([
    createClient(),
    getCurrentUserAndProfile(),
  ]);

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, blocked, created_at, updated_at")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  const all = users ?? [];

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone enrolled or working in the school.
        </p>
      </div>

      <UsersPageClient
        admins={all.filter((u) => u.role === "admin")}
        teachers={all.filter((u) => u.role === "teacher")}
        students={all.filter((u) => u.role === "student")}
        currentUserId={user!.id}
      />
    </>
  );
}
