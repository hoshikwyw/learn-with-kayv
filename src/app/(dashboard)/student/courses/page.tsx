import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { EnrollButton } from "./enroll-button";

export const metadata = { title: "Courses" };

export default async function StudentCoursesPage() {
  const { user } = await getCurrentUserAndProfile();
  const supabase = await createClient();

  const [{ data: courses }, { data: enrollments }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, title, description, course_teachers(role, profiles(full_name))")
      .order("title"),
    supabase
      .from("student_enrollments")
      .select("course_id")
      .eq("student_id", user!.id),
  ]);

  const enrolledIds = new Set((enrollments ?? []).map((e) => e.course_id));

  const list = (courses ?? []).map((c) => {
    const main = (
      c.course_teachers as unknown as {
        role: string;
        profiles: { full_name: string | null } | null;
      }[]
    )?.find((t) => t.role === "main");
    return { ...c, teacherName: main?.profiles?.full_name ?? null };
  });

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Courses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse all available courses and enroll in the ones you want to take.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        {list.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            No courses available yet.
          </div>
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
                  enrolled={enrolledIds.has(c.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
