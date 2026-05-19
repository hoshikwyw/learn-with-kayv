import { Skeleton } from "@/components/ui/skeleton";

// Profile page — avatar + form fields
export default function ProfileLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="rounded-xl border bg-card p-6 max-w-lg space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        {/* Form fields */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}

        <Skeleton className="h-10 w-28" />
      </div>
    </>
  );
}
