import { cn } from "@/lib/utils";

/**
 * The title block every dashboard page opens with.
 *
 * Pass `action` to put a button (or dialog trigger) on the right — the layout
 * switches to a split row on its own, so pages do not each hand-roll the
 * flex wrapper.
 *
 *   <PageHeader title="Courses" description="…" action={<CreateCourseDialog />} />
 *
 * `children` renders inline after the title, for badges on a detail page:
 *
 *   <PageHeader title={course.title}>
 *     <Badge variant="secondary">{course.code}</Badge>
 *   </PageHeader>
 */
export function PageHeader({
  title,
  description,
  action,
  children,
  as: Heading = "h2",
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  /** `h1` for standalone pages, `h2` inside the dashboard shell (default). */
  as?: "h1" | "h2";
  className?: string;
}) {
  const heading = (
    <div className={cn(!action && className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Heading className="text-2xl font-semibold tracking-tight">
          {title}
        </Heading>
        {children}
      </div>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );

  if (!action) return heading;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {heading}
      {action}
    </div>
  );
}
