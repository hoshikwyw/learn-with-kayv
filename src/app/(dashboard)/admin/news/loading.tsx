import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/skeletons";

export default function AdminNewsLoading() {
  return (
    <>
      <PageHeaderSkeleton action />
      <TableSkeleton columns={5} rows={5} />
    </>
  );
}
