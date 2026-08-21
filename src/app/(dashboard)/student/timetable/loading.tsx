import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function StudentTimetableLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <TableSkeleton columns={4} rows={8} />
    </>
  );
}
