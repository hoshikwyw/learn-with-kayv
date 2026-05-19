import { Skeleton } from "@/components/ui/skeleton";

// Student grades — table with 4 columns
export default function StudentGradesLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-4 gap-4 border-b px-4 py-3">
          {["Course", "Code", "Score", "Recorded"].map((h) => (
            <Skeleton key={h} className="h-4 w-20" />
          ))}
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-4 gap-4 border-b px-4 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12 ml-auto" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </>
  );
}
