import { Skeleton } from "@/components/ui/skeleton";
import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function ProfileLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeaderSkeleton />

      {/* Avatar row */}
      <div className="flex items-center gap-5 rounded-xl border bg-card p-6">
        <Skeleton className="size-20 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <FormSkeleton fields={2} />
    </div>
  );
}
