import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Courses" };

async function createCourse(formData: FormData) {
  "use server";
  const title = String(formData.get("title") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  if (!title || !code) return;

  const supabase = await createClient();
  await supabase.from("courses").insert({ title, code });
  revalidatePath("/admin/courses");
}

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, code, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Courses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage courses offered by the school.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create a new course</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCourse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required placeholder="Algebra I" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" required placeholder="MATH-101" />
              </div>
              <Button type="submit">Create course</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing courses</CardTitle>
          </CardHeader>
          <CardContent>
            {(courses ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses yet. Create the first one.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {courses!.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-2">
                    <span className="font-medium">{c.title}</span>
                    <span className="text-xs text-muted-foreground">{c.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
