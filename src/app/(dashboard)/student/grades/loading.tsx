import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function StudentGradesLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <TableSkeleton columns={4} rows={7} />
    </>
  );
}
