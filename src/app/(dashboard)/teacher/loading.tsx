import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/skeletons";

export default function TeacherLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <CardGridSkeleton
        count={6}
        cover
        lines={1}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      />
    </>
  );
}
