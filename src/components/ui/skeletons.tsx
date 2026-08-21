import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Composable loading skeletons.
 *
 * Every `loading.tsx` used to hand-assemble its own grid of <Skeleton> divs —
 * ~650 lines that had to be re-tuned by hand whenever a page's layout moved.
 * These primitives cover the shapes this app actually renders; reach for a
 * raw <Skeleton> only for something genuinely one-off.
 */

/** Matches <PageHeader>: a title line, a description line, optional action. */
export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  const heading = (
    <div className="space-y-2">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-4 w-64" />
    </div>
  );

  if (!action) return heading;

  return (
    <div className="flex items-start justify-between gap-4">
      {heading}
      <Skeleton className="h-9 w-32" />
    </div>
  );
}

/**
 * A grid of card placeholders.
 *
 * `cover` adds the 16:9 image block that course cards lead with.
 */
export function CardGridSkeleton({
  count = 6,
  cover = false,
  lines = 2,
  className = "grid gap-4 md:grid-cols-3",
}: {
  count?: number;
  cover?: boolean;
  /** Body text lines under the title. */
  lines?: number;
  /** The grid classes — pass the same ones the real page uses. */
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border bg-card">
          {cover && <Skeleton className="aspect-[16/9] w-full rounded-none" />}
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
            {Array.from({ length: lines }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn("h-4", j === lines - 1 ? "w-2/3" : "w-full")}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stat tiles — a label, an icon, and a big number. */
export function StatGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded" />
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
      ))}
    </div>
  );
}

/** A bordered table: header row plus body rows, all evenly divided. */
export function TableSkeleton({
  columns,
  rows = 6,
}: {
  columns: number;
  rows?: number;
}) {
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="grid gap-4 border-b px-4 py-3" style={gridStyle}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 border-b px-4 py-4 last:border-0"
          style={gridStyle}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-4 w-full max-w-32" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * A bordered list of rows — an avatar or icon, a couple of text lines, and
 * an optional control on the right.
 */
export function ListSkeleton({
  rows = 5,
  avatar = true,
  trailing = true,
}: {
  rows?: number;
  /** Round avatar (true) or square icon tile (false). */
  avatar?: boolean;
  /** A button-sized block at the end of each row. */
  trailing?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 border-b px-5 py-4 last:border-0"
        >
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton
              className={cn(
                "size-9 shrink-0",
                avatar ? "rounded-full" : "rounded-lg",
              )}
            />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          {trailing && <Skeleton className="h-9 w-20 shrink-0" />}
        </div>
      ))}
    </div>
  );
}

/** The numbered lesson cards shown on every course detail page. */
export function LessonListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-24" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <Skeleton className="h-7 w-8 shrink-0 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Course detail header: code pill, title, description, optional action. */
export function CourseDetailSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      {action && <Skeleton className="h-9 w-32 shrink-0" />}
    </div>
  );
}

/** A card holding a stack of labelled inputs and a submit button. */
export function FormSkeleton({
  fields = 3,
  className = "max-w-lg",
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-5 rounded-xl border bg-card p-6", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-28" />
    </div>
  );
}
