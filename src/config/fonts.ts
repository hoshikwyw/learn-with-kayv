/**
 * Typefaces. Changing these is part of rebranding — see also the colour knobs
 * at the top of `src/app/globals.css`.
 *
 * `next/font` self-hosts the files at build time (no request to Google at
 * runtime, no layout shift). The trade-off is that each call must be a literal
 * at module scope, so a font CANNOT be chosen from an env var — swap the
 * import and the call below instead.
 *
 * Pairings that work well here:
 *   Plus_Jakarta_Sans  — geometric, friendly. The default.
 *   Inter              — neutral workhorse, the safest choice.
 *   Manrope            — a touch warmer than Inter.
 *   Outfit             — rounder and more distinctive; good for younger brands.
 *   Source_Serif_4     — for a traditional, academic feel.
 *
 * Keep the `variable` names as they are: `globals.css` maps them to Tailwind's
 * `font-sans` / `font-mono`.
 */

import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

export const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Applied to <body> so both families are available as CSS variables. */
export const fontVariables = `${fontSans.variable} ${fontMono.variable}`;
