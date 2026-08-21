import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";
import { CourseCover } from "@/components/courses/course-cover";

export const metadata = { title: "Teacher dashboard" };

type AssignmentRow = {
  role: "main" | "assistant";
  courses: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    image_url: string | null;
  };
};

export default async function TeacherOverviewPage() {
  const { user } = await getCurrentUserAndProfile();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: assignments } = await supabase
    .from("course_teachers")
    .select(
      "role, courses!inner(id, code, title, description, image_url)",
    )
    .eq("teacher_id", user.id)
    .order("role", { ascending: true })
    .returns<AssignmentRow[]>();

  const items = assignments ?? [];

  return (
    <>
      <PageHeader
        title={`My ${siteConfig.terminology.courses}`}
        description="Courses you are assigned to teach."
      />

      {items.length === 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BookOpen className="size-5 text-muted-foreground" />
            <CardTitle className="text-base">No assigned courses yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            An admin will assign you to courses. Once assigned they will appear
            here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ role, courses: c }) => (
            <Link
              key={c.id}
              href={`/teacher/courses/${c.id}`}
              className="group block focus-visible:outline-none"
            >
              <Card className="h-full overflow-hidden pt-0 transition group-hover:border-foreground/30 group-hover:shadow-md">
                <CourseCover src={c.image_url} alt={c.title} />
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{c.code}</Badge>
                    <Badge variant={role === "main" ? "default" : "secondary"}>
                      {role}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug">
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {c.description?.trim() || "No description yet."}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
