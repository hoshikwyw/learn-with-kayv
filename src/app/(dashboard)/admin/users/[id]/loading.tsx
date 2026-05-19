import { Skeleton } from "@/components/ui/skeleton";

// Admin user detail — profile card + grades table
export default function UserDetailLoading() {
  return (
    <>
      {/* Back link */}
      <Skeleton className="h-4 w-24" />

      {/* Profile card */}
      <div className="rounded-xl border bg-card p-6 flex items-center gap-5">
        <Skeleton className="size-20 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Grades table */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-4 gap-4 border-b px-4 py-3">
            {["Course", "Code", "Score", "Date"].map((h) => (
              <Skeleton key={h} className="h-4 w-16" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 border-b px-4 py-4 last:border-0">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
