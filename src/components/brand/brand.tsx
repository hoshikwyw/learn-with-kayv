import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Library,
  Lightbulb,
  School,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, type BrandIconName } from "@/config/site";

/**
 * Icons selectable via `siteConfig.icon` / `NEXT_PUBLIC_SITE_ICON`.
 * Add your own here and to `BrandIconName` in `src/config/site.ts`.
 */
export const BRAND_ICONS: Record<BrandIconName, LucideIcon> = {
  GraduationCap,
  BookOpen,
  School,
  Sparkles,
  Library,
  Lightbulb,
};

/** The resolved brand icon. Falls back to GraduationCap for an unknown name. */
export const BrandIcon: LucideIcon =
  BRAND_ICONS[siteConfig.icon] ?? GraduationCap;

/**
 * The brand icon on its own.
 *
 * `variant="boxed"` renders it on a filled primary tile — used in the
 * dashboard sidebar, where it stays visible while the sidebar is collapsed.
 */
export function BrandMark({
  variant = "plain",
  className,
}: {
  variant?: "plain" | "boxed";
  className?: string;
}) {
  if (variant === "boxed") {
    return (
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground",
          className,
        )}
      >
        <BrandIcon className="size-4" />
      </div>
    );
  }
  return <BrandIcon className={cn("size-6 text-primary", className)} />;
}

/**
 * The full brand lockup: icon + site name, optionally over a subtitle.
 *
 * Pass `href={null}` to render it as plain text instead of a link (e.g. inside
 * the sidebar header, which is not itself clickable).
 */
export function Brand({
  href = "/",
  variant = "plain",
  subtitle,
  className,
  nameClassName,
}: {
  href?: string | null;
  variant?: "plain" | "boxed";
  subtitle?: React.ReactNode;
  className?: string;
  nameClassName?: string;
}) {
  const content = (
    <>
      <BrandMark variant={variant} />
      <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
        <span
          className={cn(
            "truncate text-lg font-semibold tracking-tight",
            variant === "boxed" && "text-sm",
            nameClassName,
          )}
        >
          {siteConfig.name}
        </span>
        {subtitle && (
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </>
  );

  const classes = cn("flex items-center gap-2", className);

  if (href === null) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
