import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function AdminEnrollmentsLoading() {
  return (
    <>
      <PageHeaderSkeleton action />

      {/* Pending, then approved */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-36" />
          <ListSkeleton rows={i === 0 ? 4 : 3} />
        </div>
      ))}
    </>
  );
}
