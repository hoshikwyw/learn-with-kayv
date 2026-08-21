import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BookOpen, ImageIcon, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ROLE_LABEL } from "@/config/site";
import type { Profile } from "@/types/db";

export const metadata = { title: "User details" };

type CourseAssignment = {
  role: "main" | "assistant";
  assigned_at: string;
  courses: {
    id: string;
    title: string;
    code: string;
    image_url: string | null;
  } | null;
};

const POSITION_LABEL: Record<"main" | "assistant", string> = {
  main: "Main teacher",
  assistant: "Assistant",
};

function initials(value: string) {
  return value
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role, blocked, created_at, updated_at")
    .eq("id", id)
    .single<Profile>();

  if (!profile) notFound();

  const { data: assignments } = await supabase
    .from("course_teachers")
    .select("role, assigned_at, courses(id, title, code, image_url)")
    .eq("teacher_id", id)
    .returns<CourseAssignment[]>();

  const courseList = (assignments ?? []).filter((a) => a.courses !== null);

  const displayName = profile.full_name ?? profile.email;
  const canTeach = profile.role === "teacher" || profile.role === "admin";

  return (
    <>
      {/* Back */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          All users
        </Link>
      </div>

      {/* Profile header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Avatar className="size-20 text-2xl">
          {profile.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={displayName} />
          )}
          <AvatarFallback>{initials(displayName)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{displayName}</h2>
            {profile.blocked && (
              <Badge variant="destructive" className="gap-1">
                <ShieldAlert className="size-3" />
                Blocked
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <div className="flex items-center gap-2">
            <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
              {ROLE_LABEL[profile.role]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Info card */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Account info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Row label="Full name" value={profile.full_name ?? "—"} />
            <Row label="Email" value={profile.email} />
            <Row label="Role" value={ROLE_LABEL[profile.role]} />
            <Row
              label="Status"
              value={profile.blocked ? "Blocked" : "Active"}
              valueClassName={profile.blocked ? "text-destructive" : "text-success"}
            />
            <Row
              label="Joined"
              value={new Date(profile.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          </CardContent>
        </Card>

        {/* Courses card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Course assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canTeach ? (
              <p className="text-sm text-muted-foreground">
                Students are not assigned to courses as instructors.
              </p>
            ) : courseList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not assigned to any courses yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {courseList.map((a) => {
                  const course = a.courses!;
                  return (
                    <li key={course.id}>
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="group flex items-center gap-4 rounded-md px-2 py-3 -mx-2 transition hover:bg-muted/60"
                      >
                        {/* Thumbnail */}
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          {course.image_url ? (
                            <Image
                              src={course.image_url}
                              alt={course.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="size-4" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                              {course.code}
                            </span>
                            <span className="truncate font-medium">{course.title}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Assigned{" "}
                            {new Date(a.assigned_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        {/* Position badge */}
                        <Badge
                          variant={a.role === "main" ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {POSITION_LABEL[a.role]}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  );
}
