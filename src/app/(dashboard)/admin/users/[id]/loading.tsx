import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/skeletons";

export default function AdminUserDetailLoading() {
  return (
    <>
      <Skeleton className="h-4 w-24" />

      {/* Profile card */}
      <div className="flex items-center gap-5 rounded-xl border bg-card p-6">
        <Skeleton className="size-20 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <TableSkeleton columns={4} rows={5} />
      </div>
    </>
  );
}
