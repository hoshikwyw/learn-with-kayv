import { Skeleton } from "@/components/ui/skeleton";

// Admin enrollments — pending card + approved card
export default function AdminEnrollmentsLoading() {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Pending card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-6 border-b space-y-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-64" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 last:border-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
