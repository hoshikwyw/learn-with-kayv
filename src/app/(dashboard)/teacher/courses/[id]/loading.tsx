import { Skeleton } from "@/components/ui/skeleton";

// Teacher course detail — same shape as admin but read-only lesson list
export default function TeacherCourseDetailLoading() {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      <Skeleton className="aspect-[16/9] w-full max-w-2xl rounded-xl" />

      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
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
