import { Skeleton } from "@/components/ui/skeleton";
import { LessonListSkeleton } from "@/components/ui/skeletons";

export default function PublicCourseDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-12">
      <Skeleton className="h-4 w-28" />

      <div className="space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-5 w-3/4 max-w-xl" />
      </div>

      <Skeleton className="aspect-[16/9] w-full rounded-xl" />
      <LessonListSkeleton count={5} />
    </div>
  );
}
