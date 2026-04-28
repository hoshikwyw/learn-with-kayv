import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/types/db";
import { ROLE_LABEL } from "@/components/dashboard/nav-config";
import { ProfileEditForm } from "./profile-edit-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/login");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your name. Email and role come from your account and can&apos;t
          be changed here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
          <CardDescription>
            Your full name shows up in the sidebar and across the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileEditForm initialFullName={profile.full_name ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account info</CardTitle>
          <CardDescription>
            Sign-in is handled by Google. To change your password, manage it
            from your Google account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Email" value={profile.email} />
          <Field label="Role" value={ROLE_LABEL[profile.role]} />
          <Field label="Sign-in method" value="Google" />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:items-center sm:gap-4">
      <Label className="text-muted-foreground">{label}</Label>
      <p className="text-sm sm:col-span-2">{value}</p>
    </div>
  );
}
