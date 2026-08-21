import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/skeletons";

export default function StudentLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <CardGridSkeleton
        count={3}
        lines={1}
        className="grid gap-4 md:grid-cols-2"
      />
    </>
  );
}
