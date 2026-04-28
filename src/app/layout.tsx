import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastFromSearchParams } from "@/components/toast/toast-from-search-params";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Learn-with-kayv",
    template: "%s | Learn-with-kayv",
  },
  description:
    "A private school management platform — courses, grades, and timetables for students, teachers, and admins.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <TooltipProvider delay={200}>{children}</TooltipProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            success: { duration: 3000 },
            error: { duration: 5000 },
            style: {
              borderRadius: "10px",
              background: "hsl(var(--background, 0 0% 100%))",
              color: "hsl(var(--foreground, 222 47% 11%))",
              border: "1px solid hsl(var(--border, 214 32% 91%))",
              fontSize: "14px",
            },
          }}
        />
        <Suspense fallback={null}>
          <ToastFromSearchParams />
        </Suspense>
      </body>
    </html>
  );
}
