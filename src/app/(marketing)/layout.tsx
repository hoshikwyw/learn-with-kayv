import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="size-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              Learn-with-kayv
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/#about" className="hover:text-foreground">
              About
            </Link>
            <Link href="/#news" className="hover:text-foreground">
              News
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Enroll
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Learn-with-kayv. All rights reserved.</p>
          <p className="hidden md:block">A private-school platform.</p>
        </div>
      </footer>
    </div>
  );
}
