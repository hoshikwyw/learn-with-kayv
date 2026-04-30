import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, FileText, Image as ImageIcon, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { LessonsSection } from "@/components/lessons/lessons-section";
import type { Lesson } from "@/components/lessons/lesson-row";
import { CourseImageUpload } from "./course-image-upload";
import { DescriptionEdit } from "./description-edit";
import {
  TeacherAssignment,
  type AssignedTeacher,
  type AvailableTeacher,
} from "./teacher-assignment";

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

type AssignmentRow = {
  teacher_id: string;
  role: "main" | "assistant";
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [courseResp, assignmentsResp, allTeachersResp, lessonsResp] = await Promise.all([
    supabase
      .from("courses")
      .select("id, code, title, description, image_url, created_at")
      .eq("id", id)
      .single<Course>(),
    supabase
      .from("course_teachers")
      .select(
        "teacher_id, role, profiles!inner(full_name, email, avatar_url)",
      )
      .eq("course_id", id)
      .order("role", { ascending: true })
      .returns<AssignmentRow[]>(),
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("role", "teacher")
      .order("full_name", { ascending: true })
      .returns<AvailableTeacher[]>(),
    supabase
      .from("lessons")
      .select("id, course_id, title, body, video_url, display_order")
      .eq("course_id", id)
      .order("display_order", { ascending: true })
      .returns<Lesson[]>(),
  ]);

  const course = courseResp.data;
  if (!course) notFound();

  const assignedRows = assignmentsResp.data ?? [];
  const assignedIds = new Set(assignedRows.map((r) => r.teacher_id));

  const assigned: AssignedTeacher[] = assignedRows.map((r) => ({
    teacher_id: r.teacher_id,
    role: r.role,
    full_name: r.profiles.full_name,
    email: r.profiles.email,
    avatar_url: r.profiles.avatar_url,
  }));

  const available = (allTeachersResp.data ?? []).filter(
    (t) => !assignedIds.has(t.id),
  );

  return (
    <>
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/courses" />}
        >
          <ArrowLeft className="size-4" />
          Back to courses
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">
            {course.title}
          </h2>
          <Badge variant="secondary">{course.code}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Created {new Date(course.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <ImageIcon className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Course image</CardTitle>
              <CardDescription>
                Shown on the public landing page and in course listings.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CourseImageUpload
              courseId={course.id}
              initialImageUrl={course.image_url}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start gap-3">
            <FileText className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Click Edit description to update the public copy.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <DescriptionEdit
              courseId={course.id}
              initialDescription={course.description}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start gap-3">
            <BookOpen className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>
                Assign one main teacher and any number of assistants. Teachers
                can only enter grades for courses they are assigned to.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <TeacherAssignment
              courseId={course.id}
              assigned={assigned}
              available={available}
            />
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
      </div>
    </>
  );
}
