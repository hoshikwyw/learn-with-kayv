import { Skeleton } from "@/components/ui/skeleton";

// Admin users — tabs + table rows
export default function AdminUsersLoading() {
  return (
    <>
      <div className="space-y-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Tabs bar */}
      <div className="space-y-6">
        <div className="flex items-end justify-between border-b pb-0">
          <div className="flex gap-1">
            {["Admins", "Teachers", "Students"].map((label) => (
              <Skeleton key={label} className="h-10 w-24 rounded-none rounded-t" />
            ))}
          </div>
          <Skeleton className="mb-2 h-9 w-28" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="grid grid-cols-5 gap-4 border-b px-4 py-3">
            {["Name", "Email", "Joined", "Details", "Block"].map((h) => (
              <Skeleton key={h} className="h-4 w-full max-w-[80px]" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 border-b px-4 py-4 last:border-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-12 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
