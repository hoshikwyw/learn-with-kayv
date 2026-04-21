import { Users, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin dashboard" };

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // These queries will return `count: 0` until you run the SQL migration.
  const [{ count: userCount }, { count: teacherCount }, { count: studentCount }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "teacher"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),
    ]);

  const stats = [
    { label: "Total users", value: userCount ?? 0, icon: Users },
    { label: "Teachers", value: teacherCount ?? 0, icon: GraduationCap },
    { label: "Students", value: studentCount ?? 0, icon: BookOpen },
  ];

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Admin dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of the school.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">
                  {s.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
