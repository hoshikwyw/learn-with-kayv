import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "My grades" };

type GradeRow = {
  id: string;
  score: number;
  created_at: string;
  courses: { title: string; code: string } | null;
};

export default async function StudentGradesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: grades } = await supabase
    .from("grades")
    .select("id, score, created_at, courses(title, code)")
    .eq("student_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<GradeRow[]>();

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My grades</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every score your teachers have recorded for you.
        </p>
      </div>

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
                  {new Date(g.created_at).toLocaleDateString()}
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
