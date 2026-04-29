import Link from "next/link";
import { GraduationCap, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { ROLE_HOME } from "@/types/db";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getCurrentUserAndProfile();

  const dashboardHref = profile ? ROLE_HOME[profile.role] : null;

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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {profile && dashboardHref ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Signed in as{" "}
                  <span className="font-medium text-foreground">
                    {profile.full_name ?? profile.email}
                  </span>
                </span>
                <Button size="sm" render={<Link href={dashboardHref} />}>
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Button>
                <Avatar className="size-8">
                  {profile.avatar_url && (
                    <AvatarImage src={profile.avatar_url} alt={profile.email} />
                  )}
                  <AvatarFallback>
                    {(profile.full_name ?? profile.email)
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Button size="sm" render={<Link href="/login" />}>
                Sign in
              </Button>
            )}
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
