import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Teacher dashboard" };

export default function TeacherOverviewPage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">My Courses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Courses you are assigned to teach.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BookOpen className="size-5 text-muted-foreground" />
          <CardTitle className="text-base">No assigned courses yet</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          An admin will assign you to courses. Once assigned they will appear here.
        </CardContent>
      </Card>
    </>
  );
}
