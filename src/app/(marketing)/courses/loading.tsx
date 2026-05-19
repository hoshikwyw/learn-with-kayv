import { Skeleton } from "@/components/ui/skeleton";

// Public courses listing
export default function PublicCoursesLoading() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-5 w-56" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
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
