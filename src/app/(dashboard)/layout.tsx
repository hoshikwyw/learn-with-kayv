import { redirect } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentUserAndProfile();

  // Middleware already enforces this, but belt-and-suspenders for direct hits.
  if (!user) redirect("/login");

  if (!profile) {
    redirect(
      `/login?error=${encodeURIComponent(
        "No profile found for your account. Ask an admin to add you.",
      )}`,
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium text-muted-foreground">
            {profile.full_name ?? profile.email}
          </h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
