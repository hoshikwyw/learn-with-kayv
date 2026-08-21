import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function AdminContentLoading() {
  return (
    <>
      <PageHeaderSkeleton />

      {/* Hero / About / Courses / Teachers / News tabs */}
      <div className="flex gap-1 border-b">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-none rounded-t" />
        ))}
      </div>

      <FormSkeleton fields={3} className="max-w-2xl" />
    </>
  );
}
