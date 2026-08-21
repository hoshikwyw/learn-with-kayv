import { ListSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function StudentCoursesLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <ListSkeleton rows={8} avatar={false} />
    </>
  );
}
