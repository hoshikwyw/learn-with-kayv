import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { EnrollButton } from "./enroll-button";

export const metadata = { title: "Courses" };

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  image_url: string | null;
  course_teachers: {
    role: string;
    profiles: { full_name: string | null } | null;
  }[];
};

export default async function PublicCoursesPage() {
  const supabase = await createClient();
  const { user, profile } = await getCurrentUserAndProfile();

  const isStudent = profile?.role === "student";

  const [{ data: courses }, enrollmentsResp] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, code, title, description, image_url, course_teachers(role, profiles(full_name))",
      )
      .order("title")
      .returns<Course[]>(),
    isStudent && user
      ? supabase
          .from("student_enrollments")
          .select("course_id, status")
          .eq("student_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const enrollmentMap = new Map(
    (enrollmentsResp.data ?? []).map((e) => [
      e.course_id,
      e.status as "pending" | "approved" | "declined",
    ]),
  );

  const list = (courses ?? []).map((c) => {
    const main = c.course_teachers?.find((t) => t.role === "main");
    return { ...c, teacherName: main?.profiles?.full_name ?? null };
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          All Courses
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse everything on offer and enroll in the courses you want to take.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center text-muted-foreground">
          <BookOpen className="size-10 opacity-30" />
          <p>No courses have been published yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <Card
              key={c.id}
              className="group flex flex-col overflow-hidden border-border/60 pt-0 transition-shadow hover:shadow-md"
            >
              {/* Image */}
              <Link href={`/courses/${c.id}`} className="block shrink-0">
                {c.image_url ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    <Image
                      src={c.image_url}
                      alt={c.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted">
                    <BookOpen className="size-10 text-muted-foreground/40" />
                  </div>
                )}
              </Link>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="w-fit shrink-0">
                    {c.code}
                  </Badge>
                </div>
                <Link href={`/courses/${c.id}`}>
                  <CardTitle className="line-clamp-2 text-base font-semibold leading-snug hover:underline">
                    {c.title}
                  </CardTitle>
                </Link>
                {c.teacherName && (
                  <p className="text-xs text-muted-foreground">
                    {c.teacherName}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between gap-4">
                {c.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/courses/${c.id}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    View details
                    <ChevronRight className="size-3" />
                  </Link>
                  <EnrollButton
                    courseId={c.id}
                    status={enrollmentMap.get(c.id) ?? null}
                    isStudent={isStudent}
                    redirectPath={`/courses/${c.id}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
