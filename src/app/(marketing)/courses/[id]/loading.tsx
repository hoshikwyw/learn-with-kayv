import { Skeleton } from "@/components/ui/skeleton";

// Public course detail — image hero + lesson list
export default function PublicCourseDetailLoading() {
  return (
    <>
      {/* Back */}
      <Skeleton className="h-4 w-28" />

      {/* Course header */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-5 w-3/4 max-w-xl" />
      </div>

      {/* Cover image */}
      <Skeleton className="aspect-[16/9] w-full rounded-xl" />

      {/* Lessons */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-2">
            <div className="flex items-start gap-3">
              <Skeleton className="h-7 w-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
