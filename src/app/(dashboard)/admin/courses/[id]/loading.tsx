import { Skeleton } from "@/components/ui/skeleton";
import {
  CourseDetailSkeleton,
  LessonListSkeleton,
} from "@/components/ui/skeletons";

export default function AdminCourseDetailLoading() {
  return (
    <>
      <CourseDetailSkeleton action />
      <Skeleton className="aspect-[16/9] w-full max-w-2xl rounded-xl" />
      <LessonListSkeleton count={4} />
    </>
  );
}
