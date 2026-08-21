import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/skeletons";

export default function PublicCoursesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16">
      <PageHeaderSkeleton />
      <CardGridSkeleton
        count={9}
        cover
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />
    </div>
  );
}
