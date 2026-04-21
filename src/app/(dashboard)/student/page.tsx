import { GraduationCap, Calendar } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Student dashboard" };

export default function StudentOverviewPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your school, at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/student/grades" className="group">
          <Card className="h-full transition-colors group-hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </div>
              <CardTitle>My Grades</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Review your latest scores across all your courses.
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/timetable" className="group">
          <Card className="h-full transition-colors group-hover:bg-muted/40">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="size-5" />
              </div>
              <CardTitle>Timetable</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              See your class schedule for the week.
            </CardContent>
          </Card>
        </Link>
      </div>
    </>
  );
}
