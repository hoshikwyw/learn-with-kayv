import { Skeleton } from "@/components/ui/skeleton";

// Teacher grades — static form page, very fast but show skeleton briefly
export default function TeacherGradesLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="rounded-xl border bg-card p-6 max-w-lg space-y-5">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-28" />
      </div>
    </>
  );
}
