import { Suspense } from "react";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToastFromSearchParams } from "@/components/toast/toast-from-search-params";
import { siteConfig } from "@/config/site";
import { fontVariables } from "@/config/fonts";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `data-theme` picks the colour preset; next-themes owns the `class`
    // attribute for light/dark, so the two never collide.
    <html lang="en" data-theme={siteConfig.theme} suppressHydrationWarning>
      <body
        className={`${fontVariables} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="var(--primary)"
            showSpinner={false}
            height={3}
          />
          <TooltipProvider delay={200}>{children}</TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              success: { duration: 3000 },
              error: { duration: 5000 },
              className: "!bg-background !text-foreground !border !border-border",
              style: { borderRadius: "10px", fontSize: "14px" },
            }}
          />
          <Suspense fallback={null}>
            <ToastFromSearchParams />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
