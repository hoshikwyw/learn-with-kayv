import { Skeleton } from "@/components/ui/skeleton";

// Admin site content — tab bar + hero form skeleton
export default function AdminContentLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b pb-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-none rounded-t" />
        ))}
      </div>

      {/* Content area — hero form shape */}
      <div className="rounded-xl border bg-card p-6 space-y-5 max-w-2xl">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-24" />
      </div>
    </>
  );
}
