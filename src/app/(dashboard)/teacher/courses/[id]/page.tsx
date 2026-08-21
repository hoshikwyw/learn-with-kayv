import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, PlayCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { LessonsSection } from "@/components/lessons/lessons-section";
import type { Lesson } from "@/components/lessons/lesson-row";
import {
  EnrolledStudents,
  type EnrolledStudent,
} from "@/components/dashboard/enrolled-students";
import { PageHeader } from "@/components/layout/page-header";

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  image_url: string | null;
};

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user } = await getCurrentUserAndProfile();
  if (!user) redirect("/login");

  const supabase = await createClient();

  // Confirm the teacher is assigned to this course (defense in depth — RLS gates writes anyway)
  const { data: assignment } = await supabase
    .from("course_teachers")
    .select("role")
    .eq("course_id", id)
    .eq("teacher_id", user.id)
    .maybeSingle<{ role: "main" | "assistant" }>();

  if (!assignment) {
    redirect("/teacher");
  }

  const [courseResp, lessonsResp, enrolledResp] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, title, description, image_url")
      .eq("id", id)
      .single<Course>(),
    supabase
      .from("lessons")
      .select("id, course_id, title, body, video_url, display_order")
      .eq("course_id", id)
      .order("display_order", { ascending: true })
      .returns<Lesson[]>(),
    supabase
      .from("student_enrollments")
      .select("student_id, enrolled_at, profiles!student_id(full_name, email, avatar_url)")
      .eq("course_id", id)
      .eq("status", "approved")
      .order("enrolled_at", { ascending: true })
      .returns<EnrolledStudent[]>(),
  ]);

  const course = courseResp.data;
  if (!course) notFound();

  return (
    <>
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/teacher" />}
        >
          <ArrowLeft className="size-4" />
          Back to my courses
        </Button>
      </div>

      <PageHeader title={course.title}>
        <Badge variant="secondary">{course.code}</Badge>
        <Badge variant={assignment.role === "main" ? "default" : "secondary"}>
          {assignment.role}
        </Badge>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        {course.image_url ? (
          <Card className="overflow-hidden pt-0">
            <div className="relative aspect-[16/9] w-full bg-muted">
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <CardHeader className="flex flex-row items-start gap-3">
              <BookOpen className="size-5 text-muted-foreground" />
              <CardTitle>Course image</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-start gap-3">
              <BookOpen className="size-5 text-muted-foreground" />
              <CardTitle>Course image</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No image yet — an admin can upload one from{" "}
                <span className="font-mono">/admin/courses/{course.id}</span>.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <FileText className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Description</CardTitle>
              <CardDescription>Public course description.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {course.description?.trim() || (
                <span className="text-muted-foreground">No description yet.</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start gap-3">
            <PlayCircle className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Lessons</CardTitle>
              <CardDescription>
                Text + optional YouTube video. Use the up/down arrows to reorder.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <LessonsSection
              courseId={course.id}
              lessons={lessonsResp.data ?? []}
              canEdit={true}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start gap-3">
            <Users className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Enrolled students</CardTitle>
              <CardDescription>
                Students approved to take this course.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <EnrolledStudents students={enrolledResp.data ?? []} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
