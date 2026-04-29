import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Image as ImageIcon } from "lucide-react";
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
import { CourseImageUpload } from "./course-image-upload";

type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, title, description, image_url, created_at")
    .eq("id", id)
    .single<Course>();

  if (!course) notFound();

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
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {course.description?.trim() || (
                <span className="text-muted-foreground">
                  No description yet.
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start gap-3">
            <BookOpen className="size-5 text-muted-foreground" />
            <div>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>
                Assign main and assistant teachers to this course.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming next — once the <code>course_teachers</code> migration is
              applied, the assignment UI will live here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
