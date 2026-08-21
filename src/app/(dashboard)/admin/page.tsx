import { Users, BookOpen, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/page-header";

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
      <PageHeader
        title="Admin dashboard"
        description="A snapshot of the school."
      />

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
