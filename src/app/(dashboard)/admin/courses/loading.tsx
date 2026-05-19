import { Skeleton } from "@/components/ui/skeleton";

// Admin courses — header with button + course cards grid
export default function AdminCoursesLoading() {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            {/* Image placeholder */}
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
