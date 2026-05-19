import { Skeleton } from "@/components/ui/skeleton";

// Student timetable — table with schedule
export default function StudentTimetableLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="grid grid-cols-4 gap-4 border-b px-4 py-3">
          {["Day", "Time", "Course", "Teacher"].map((h) => (
            <Skeleton key={h} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 border-b px-4 py-4 last:border-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </>
  );
}
