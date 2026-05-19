import { Skeleton } from "@/components/ui/skeleton";

// Admin news — header with dialog button + table
export default function AdminNewsLoading() {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[64px_128px_1fr_1fr_128px] gap-4 border-b px-4 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full max-w-[80px]" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[64px_128px_1fr_1fr_128px] gap-4 items-center border-b px-4 py-4 last:border-0"
          >
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </>
  );
}
