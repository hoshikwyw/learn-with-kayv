import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, PlayCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { EnrollButton } from "../enroll-button";

type Lesson = {
  id: string;
  title: string;
  video_url: string | null;
  display_order: number;
};

type CourseTeacher = {
  role: string;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("title")
    .eq("id", id)
    .single();
  return { title: data?.title ?? "Course" };
}

export default async function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { user, profile } = await getCurrentUserAndProfile();

  const isStudent = profile?.role === "student";

  const [courseResp, lessonsResp, enrollmentResp] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, code, title, description, image_url, course_teachers(role, profiles(id, full_name, avatar_url))",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("lessons")
      .select("id, title, video_url, display_order")
      .eq("course_id", id)
      .order("display_order")
      .returns<Lesson[]>(),
    isStudent && user
      ? supabase
          .from("student_enrollments")
          .select("course_id, status")
          .eq("student_id", user.id)
          .eq("course_id", id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!courseResp.data) notFound();

  const course = courseResp.data;
  const lessons = lessonsResp.data ?? [];
  const enrollmentStatus = (enrollmentResp.data?.status ?? null) as
    | "pending"
    | "approved"
    | "declined"
    | null;

  const teachers = (
    course.course_teachers as unknown as CourseTeacher[]
  )?.filter((t) => t.profiles);
  const mainTeacher = teachers?.find((t) => t.role === "main");
  const assistants = teachers?.filter((t) => t.role === "assistant") ?? [];

  function initials(name: string | null) {
    if (!name) return "?";
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      {/* Back */}
      <Link
        href="/courses"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All courses
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          {/* Course image */}
          {course.image_url ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center rounded-xl bg-muted">
              <BookOpen className="size-16 text-muted-foreground/30" />
            </div>
          )}

          {/* Title & description */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary">{course.code}</Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-3 text-muted-foreground">{course.description}</p>
            )}
          </div>

          {/* Lessons */}
          {lessons.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold tracking-tight">
                Course content
              </h2>
              <div className="rounded-lg border border-border/60 bg-card">
                <ul className="divide-y divide-border">
                  {lessons.map((lesson, i) => (
                    <li
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium">
                        {lesson.title}
                      </span>
                      {lesson.video_url && (
                        <PlayCircle className="size-4 shrink-0 text-muted-foreground" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Right column — enrollment card */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border/60">
            <CardContent className="flex flex-col gap-5 pt-6">
              {/* Enroll / Register */}
              <div className="flex flex-col gap-2">
                <EnrollButton
                  courseId={course.id}
                  status={enrollmentStatus}
                  isStudent={isStudent}
                  redirectPath={`/courses/${course.id}`}
                />
                {!profile && (
                  <p className="text-center text-xs text-muted-foreground">
                    Create a free account to enroll.
                  </p>
                )}
                {enrollmentStatus === "pending" && (
                  <p className="text-center text-xs text-amber-600 dark:text-amber-400">
                    Your request is awaiting admin approval.
                  </p>
                )}
                {enrollmentStatus === "approved" && (
                  <p className="text-center text-xs text-muted-foreground">
                    You&apos;re enrolled in this course.
                  </p>
                )}
                {enrollmentStatus === "declined" && (
                  <p className="text-center text-xs text-destructive">
                    Your previous request was declined. You can request again.
                  </p>
                )}
              </div>

              <Separator />

              {/* Teachers */}
              {teachers && teachers.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Instructors
                  </p>

                  {mainTeacher?.profiles && (
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {mainTeacher.profiles.avatar_url && (
                          <AvatarImage
                            src={mainTeacher.profiles.avatar_url}
                            alt={mainTeacher.profiles.full_name ?? ""}
                          />
                        )}
                        <AvatarFallback className="text-xs">
                          {initials(mainTeacher.profiles.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {mainTeacher.profiles.full_name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Main teacher
                        </p>
                      </div>
                    </div>
                  )}

                  {assistants.map(
                    (a) =>
                      a.profiles && (
                        <div key={a.profiles.id} className="flex items-center gap-3">
                          <Avatar className="size-9">
                            {a.profiles.avatar_url && (
                              <AvatarImage
                                src={a.profiles.avatar_url}
                                alt={a.profiles.full_name ?? ""}
                              />
                            )}
                            <AvatarFallback className="text-xs">
                              {initials(a.profiles.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {a.profiles.full_name ?? "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Assistant
                            </p>
                          </div>
                        </div>
                      ),
                  )}
                </div>
              )}

              {(!teachers || teachers.length === 0) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="size-4" />
                  No instructor assigned yet.
                </div>
              )}

              {/* Lesson count */}
              {lessons.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="size-4 shrink-0" />
                    {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
