import { siteConfig } from "@/config/site";

/**
 * Initials for an avatar fallback — "Ada Lovelace" → "AL".
 *
 * Splits on any run of whitespace, so double spaces and stray tabs in a
 * user-entered name do not produce a blank or single-letter result.
 */
export function initials(
  value: string | null | undefined,
  fallback = "?",
): string {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return letters || fallback;
}

/** What to call a person: their name if they set one, otherwise their email. */
export function displayName(person: {
  full_name?: string | null;
  email?: string | null;
}): string {
  return person.full_name?.trim() || person.email || "Unknown";
}

/**
 * "12 Mar 2026".
 *
 * The locale is pinned to `siteConfig.locale` on purpose. `toLocaleDateString()`
 * with no locale resolves against the SERVER's locale during SSR and the
 * BROWSER's locale on the client, which renders two different strings for the
 * same date and trips React's hydration check.
 */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(siteConfig.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "12 Mar 2026, 14:30" — for timestamps where the time matters. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(siteConfig.locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
