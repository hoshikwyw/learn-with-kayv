import { Skeleton } from "@/components/ui/skeleton";

// Course detail page — image + title + lesson list
export default function CourseDetailLoading() {
  return (
    <>
      {/* Course header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-32 shrink-0" />
      </div>

      {/* Course image */}
      <Skeleton className="aspect-[16/9] w-full max-w-2xl rounded-xl" />

      {/* Lessons section */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-7 w-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
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
