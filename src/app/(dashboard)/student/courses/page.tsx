import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { EnrollButton } from "@/components/courses/enroll-button";
import type { EnrollmentStatus } from "@/types/db";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Courses" };

type CourseRow = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  course_teachers: {
    role: string;
    profiles: { full_name: string | null } | null;
  }[];
};

export default async function StudentCoursesPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, title, description, course_teachers(role, profiles(full_name))")
      .order("title")
      .returns<CourseRow[]>(),
    supabase
      .from("student_enrollments")
      .select("course_id, status")
      .eq("student_id", user.id),
  ]);

  const enrollmentMap = new Map(
    (enrollments ?? []).map((e) => [
      e.course_id,
      e.status as EnrollmentStatus,
    ]),
  );

  const list = (courses ?? []).map((c) => {
    const main = c.course_teachers?.find((t) => t.role === "main");
    return { ...c, teacherName: main?.profiles?.full_name ?? null };
  });

  return (
    <>
      <PageHeader
        title={siteConfig.terminology.courses}
        description="Browse all available courses and enroll in the ones you want to take."
      />

      <div className="rounded-lg border bg-card">
        {list.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses available yet." />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {c.code}
                      </span>
                      <span className="truncate font-medium">{c.title}</span>
                    </div>
                    {c.teacherName && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {c.teacherName}
                      </p>
                    )}
                    {c.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {c.description}
                      </p>
                    )}
                  </div>
                </div>

                <EnrollButton
                  courseId={c.id}
                  status={enrollmentMap.get(c.id) ?? null}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
