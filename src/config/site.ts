/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION — the single place to rebrand this template.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Everything a new customer needs to change about *identity* lives here:
 *  name, description, contact details, navigation, and the words the product
 *  uses for its own concepts ("Student" vs "Trainee", "Course" vs "Program").
 *
 *  Colours, fonts and radius live in `src/app/globals.css` — see the
 *  "BRAND TOKENS" block at the top of that file.
 *
 *  Two ways to rebrand:
 *
 *    1. Edit the defaults below. Best when you fork the template per customer.
 *    2. Set the `NEXT_PUBLIC_SITE_*` environment variables. Best when you deploy
 *       the same codebase for several customers. See `.env.example`.
 *
 *  Note: `NEXT_PUBLIC_*` values are inlined at BUILD time, not run time — a
 *  change to them needs a rebuild, not just a restart.
 */

import type { Role } from "@/types/db";

/** Names of icons in `BRAND_ICONS` (src/components/brand/brand.tsx). */
export type BrandIconName =
  | "GraduationCap"
  | "BookOpen"
  | "School"
  | "Sparkles"
  | "Library"
  | "Lightbulb";

/**
 * Colour presets defined in `src/app/globals.css`. The chosen name is written
 * to `<html data-theme="...">`, which re-points the brand hue/chroma knobs the
 * whole palette derives from. Add a preset there, then add its name here.
 */
export type ThemePreset =
  | "indigo"
  | "blue"
  | "teal"
  | "emerald"
  | "violet"
  | "rose"
  | "amber"
  | "neutral";

export type NavLink = {
  label: string;
  href: string;
};

export type SiteConfig = {
  /** Full name. Used in <title>, headers, footer, sign-in page. */
  name: string;
  /** Short name for tight spaces (collapsed sidebar, mobile). */
  shortName: string;
  /** Meta description + the sentence under the hero on the landing page. */
  description: string;
  /** Small line in the marketing footer, opposite the copyright. */
  tagline: string;
  /** Canonical public URL. Also used as the OAuth redirect origin fallback. */
  url: string;
  /** First year of operation — rendered as "Est. {founded}" in the hero badge. */
  founded: number;
  /** Which icon represents the brand. Add your own in `BRAND_ICONS`. */
  icon: BrandIconName;
  /**
   * Colour preset. For a hue that no preset matches, leave this alone and
   * edit the `--brand-*` knobs at the top of `src/app/globals.css` instead.
   */
  theme: ThemePreset;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  /** Empty string = link hidden. */
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  /** Links in the public site header. */
  marketingNav: NavLink[];
  /**
   * The product's own vocabulary. An education centre may prefer
   * "Trainer / Trainee / Program" over "Teacher / Student / Course".
   * Changing these changes the sidebar, page headings and empty states.
   */
  terminology: {
    course: string;
    courses: string;
    lesson: string;
    lessons: string;
    /** Displayed under the brand name in the dashboard sidebar. */
    roleLabels: Record<Role, string>;
  };
};

/** `NEXT_PUBLIC_*` reads must be static property accesses — Next inlines them. */
export const siteConfig: SiteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Learn with Kayv",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "Kayv",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "One place for students to track grades and timetables, teachers to manage their classes, and admins to run the school.",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || "A private-school platform.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  founded: Number(process.env.NEXT_PUBLIC_SITE_FOUNDED) || 2026,
  icon: (process.env.NEXT_PUBLIC_SITE_ICON as BrandIconName) || "GraduationCap",
  theme: (process.env.NEXT_PUBLIC_SITE_THEME as ThemePreset) || "indigo",

  contact: {
    email: process.env.NEXT_PUBLIC_SITE_EMAIL || "hello@example.com",
    phone: process.env.NEXT_PUBLIC_SITE_PHONE || "",
    address: process.env.NEXT_PUBLIC_SITE_ADDRESS || "",
  },

  social: {
    facebook: process.env.NEXT_PUBLIC_SITE_FACEBOOK || "",
    instagram: process.env.NEXT_PUBLIC_SITE_INSTAGRAM || "",
    youtube: process.env.NEXT_PUBLIC_SITE_YOUTUBE || "",
  },

  marketingNav: [
    { label: "About", href: "/#about" },
    { label: "Courses", href: "/courses" },
    { label: "News", href: "/#news" },
  ],

  terminology: {
    course: "Course",
    courses: "Courses",
    lesson: "Lesson",
    lessons: "Lessons",
    roleLabels: {
      admin: "Administrator",
      teacher: "Teacher",
      student: "Student",
    },
  },
};

/** Landing-page hero copy. Editable at runtime from /admin/content. */
export type Hero = { badge: string; title: string; subtitle: string };

/**
 * Shown until an admin saves hero copy in the CMS, and used as the fallback
 * when the `hero` row is missing from `site_settings`.
 */
export const HERO_DEFAULT: Hero = {
  badge: `Private school · Est. ${siteConfig.founded}`,
  title: `A calm, modern home for learning at ${siteConfig.name}.`,
  subtitle: siteConfig.description,
};

/** Display label for each role, e.g. for the sidebar subtitle. */
export const ROLE_LABEL: Record<Role, string> = siteConfig.terminology.roleLabels;

/** "© 2026 Acme Academy. All rights reserved." */
export function copyright(year: number = new Date().getFullYear()) {
  return `© ${year} ${siteConfig.name}. All rights reserved.`;
}
