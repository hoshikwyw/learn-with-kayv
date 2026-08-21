import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { requireUser } from "@/lib/auth/guards";

export const metadata = { title: "My grades" };

type GradeRow = {
  id: string;
  score: number;
  created_at: string;
  courses: { title: string; code: string } | null;
};

export default async function StudentGradesPage() {
  const [supabase, { user }] = await Promise.all([
    createClient(),
    requireUser(),
  ]);

  const { data: grades } = await supabase
    .from("grades")
    .select("id, score, created_at, courses(title, code)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .returns<GradeRow[]>();

  return (
    <>
      <PageHeader
        title="My grades"
        description="Every score your teachers have recorded for you."
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Recorded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(grades ?? []).map((g) => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">
                  {g.courses?.title ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {g.courses?.code ?? "—"}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {g.score}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDate(g.created_at)}
                </TableCell>
              </TableRow>
            ))}
            {(!grades || grades.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No grades recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
