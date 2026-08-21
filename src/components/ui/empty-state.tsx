import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Nothing here yet" placeholder for a list, table or grid that came back empty.
 *
 * Two sizes, because an empty state inside a bordered card wants less air than
 * one filling a whole public page:
 *
 *   sm (default) — inside a card, table or list
 *   lg           — a full-page empty result
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = "sm",
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center text-muted-foreground",
        size === "sm" ? "px-6 py-16 text-sm" : "px-6 py-24",
        className,
      )}
    >
      {Icon && (
        <Icon
          className={cn("opacity-30", size === "sm" ? "size-8" : "size-10")}
        />
      )}
      <p className={cn(size === "lg" && "text-base")}>{title}</p>
      {description && <p className="max-w-sm text-sm">{description}</p>}
      {action}
    </div>
  );
}
