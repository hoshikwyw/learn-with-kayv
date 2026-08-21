import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A course's cover image, or a placeholder tile when it has none.
 *
 * The 16:9 box and the BookOpen fallback were copied into four card layouts
 * (public landing, public course list, teacher dashboard, course detail) and
 * had already drifted — the placeholder icon was `opacity-30` in one and
 * `opacity-40` in another.
 */
export function CourseCover({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  zoomOnHover = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  /** `next/image` sizes hint — set it to match the grid the card sits in. */
  sizes?: string;
  /** Scale slightly when an ancestor with `group` is hovered. */
  zoomOnHover?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-[16/9] w-full items-center justify-center bg-muted",
          className,
        )}
      >
        <BookOpen className="size-10 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-[16/9] w-full overflow-hidden bg-muted",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn(
          "object-cover",
          zoomOnHover &&
            "transition-transform duration-300 group-hover:scale-[1.02]",
        )}
      />
    </div>
  );
}
