import { Skeleton } from "@/components/ui/skeleton";

// Marketing landing page loading skeleton
export default function MarketingLoading() {
  return (
    <>
      {/* Hero section */}
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-16 w-full max-w-3xl" />
        <Skeleton className="h-6 w-full max-w-xl" />
        <Skeleton className="h-6 w-80 mt-2" />
        <Skeleton className="h-12 w-40 rounded-lg" />
      </section>

      {/* About section */}
      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </section>

      {/* Courses grid */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <Skeleton className="aspect-[16/9] w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
