import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function AdminUsersLoading() {
  return (
    <>
      <PageHeaderSkeleton />

      <div className="space-y-6">
        {/* Role tabs + "Add user" button */}
        <div className="flex items-end justify-between border-b">
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-none rounded-t" />
            ))}
          </div>
          <Skeleton className="mb-2 h-9 w-28" />
        </div>

        <TableSkeleton columns={5} rows={6} />
      </div>
    </>
  );
}
