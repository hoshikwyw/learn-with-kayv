import { FormSkeleton, PageHeaderSkeleton } from "@/components/ui/skeletons";

export default function TeacherGradesLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <FormSkeleton fields={3} />
    </>
  );
}
