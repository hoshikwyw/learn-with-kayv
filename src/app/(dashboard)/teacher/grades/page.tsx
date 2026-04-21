import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Add grade" };

async function addGrade(formData: FormData) {
  "use server";
  const studentEmail = String(formData.get("student_email") ?? "").trim();
  const courseCode = String(formData.get("course_code") ?? "").trim();
  const score = Number(formData.get("score") ?? 0);
  if (!studentEmail || !courseCode || Number.isNaN(score)) return;

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;

  const [{ data: student }, { data: course }] = await Promise.all([
    supabase.from("profiles").select("id").eq("email", studentEmail).single(),
    supabase.from("courses").select("id").eq("code", courseCode).single(),
  ]);
  if (!student || !course) return;

  await supabase.from("grades").insert({
    student_id: student.id,
    course_id: course.id,
    teacher_id: user.user.id,
    score,
  });
  revalidatePath("/teacher/grades");
}

export default function TeacherGradesPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Add a grade</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record a score for a student in one of your courses.
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>New grade</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addGrade} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_email">Student email</Label>
              <Input
                id="student_email"
                name="student_email"
                type="email"
                required
                placeholder="student@school.edu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_code">Course code</Label>
              <Input
                id="course_code"
                name="course_code"
                required
                placeholder="MATH-101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <Input
                id="score"
                name="score"
                type="number"
                min={0}
                max={100}
                required
              />
            </div>
            <Button type="submit">Save grade</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
