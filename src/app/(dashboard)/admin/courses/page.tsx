import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CreateCourseDialog } from "./create-course-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { siteConfig } from "@/config/site";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Courses" };

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, code, created_at, course_teachers(role, profiles(full_name))")
    .order("created_at", { ascending: false });

  const list = (courses ?? []).map((c) => {
    const main = (c.course_teachers as unknown as { role: string; profiles: { full_name: string | null } | null }[])
      ?.find((t) => t.role === "main");
    return { ...c, teacherName: main?.profiles?.full_name ?? null };
  });

  return (
    <>
      <PageHeader
        title={siteConfig.terminology.courses}
        description="Create and manage courses offered by the school."
        action={<CreateCourseDialog />}
      />

      <div className="rounded-lg border bg-card">
        {list.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet. Create the first one." />
        ) : (
          <ul className="divide-y divide-border">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/courses/${c.id}`}
                  className="group flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-muted/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {c.code}
                    </span>
                    <div className="min-w-0">
                      <span className="truncate font-medium">{c.title}</span>
                      {c.teacherName && (
                        <p className="truncate text-xs text-muted-foreground">{c.teacherName}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
