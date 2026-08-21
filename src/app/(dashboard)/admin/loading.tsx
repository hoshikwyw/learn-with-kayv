import {
  PageHeaderSkeleton,
  StatGridSkeleton,
} from "@/components/ui/skeletons";

export default function AdminLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <StatGridSkeleton count={3} />
    </>
  );
}
