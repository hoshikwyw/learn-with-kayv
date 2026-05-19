import { Skeleton } from "@/components/ui/skeleton";

// Student dashboard — 3 navigation cards
export default function StudentLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </>
  );
}
