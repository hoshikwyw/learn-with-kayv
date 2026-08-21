import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/ui/skeletons";

export default function AdminCoursesLoading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <CardGridSkeleton count={6} cover />
    </>
  );
}
