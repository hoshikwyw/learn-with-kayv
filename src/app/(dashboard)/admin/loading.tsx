import { Skeleton } from "@/components/ui/skeleton";

// Admin overview — 3 stat cards
export default function AdminLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-4 rounded" />
            </div>
            <Skeleton className="h-9 w-16" />
          </div>
        ))}
      </div>
    </>
  );
}
