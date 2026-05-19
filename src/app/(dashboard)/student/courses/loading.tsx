import { Skeleton } from "@/components/ui/skeleton";

// Student courses — list of course rows with enroll button
export default function StudentCoursesLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-80" />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b px-5 py-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg shrink-0" />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-14 rounded" />
                  <Skeleton className="h-4 w-36" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
}
