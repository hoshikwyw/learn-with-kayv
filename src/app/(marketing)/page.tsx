import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  School,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/lib/supabase/session";
import { ROLE_HOME } from "@/types/db";

// Icons available to the About-items "icon" field. Keep this list in sync
// with what the admin can pick from (or accept as a string).
const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  Users,
  Newspaper,
  GraduationCap,
  ClipboardList,
  Calendar,
  School,
  Sparkles,
  Star,
  Clock,
};

type Hero = { badge: string; title: string; subtitle: string };
type AboutItem = { id: string; icon: string; title: string; body: string };
type NewsItem = {
  id: string;
  title: string;
  body: string;
  published_on: string;
};
type Course = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  image_url: string | null;
};
type FeaturedTeacher = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
};

const HERO_DEFAULT: Hero = {
  badge: "Private school · Est. 2026",
  title: "A calm, modern home for learning at Learn-with-kayv.",
  subtitle:
    "One place for students to track grades and timetables, teachers to manage their classes, and admins to run the school.",
};

export default async function LandingPage() {
  const supabase = await createClient();

  // 1 round-trip for ALL three site_settings keys instead of 3 separate calls.
  // The user/profile fetch is cached (deduped with the marketing layout).
  const [
    sessionData,
    settingsResp,
    aboutResp,
    featuredTeachersResp,
  ] = await Promise.all([
    getCurrentUserAndProfile(),
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["hero", "featured_news_ids", "featured_course_ids"])
      .returns<{ key: string; value: unknown }[]>(),
    supabase.from("about_items").select("id, icon, title, body").order("display_order", { ascending: true }).returns<AboutItem[]>(),
    supabase.from("featured_teachers").select("id, full_name, avatar_url, bio").order("display_order", { ascending: true }).returns<FeaturedTeacher[]>(),
  ]);

  const settingsMap = new Map(
    (settingsResp.data ?? []).map((row) => [row.key, row.value]),
  );
  const hero = (settingsMap.get("hero") as Hero | undefined) ?? HERO_DEFAULT;
  const featuredNewsIds = Array.isArray(settingsMap.get("featured_news_ids"))
    ? (settingsMap.get("featured_news_ids") as string[])
    : [];
  const featuredCourseIds = Array.isArray(settingsMap.get("featured_course_ids"))
    ? (settingsMap.get("featured_course_ids") as string[])
    : [];
  const aboutItems = aboutResp.data ?? [];
  const featuredTeachers = featuredTeachersResp.data ?? [];

  const dashboardHref = sessionData.profile
    ? ROLE_HOME[sessionData.profile.role]
    : null;

  // Fetch the actual featured news + courses preserving id-array order
  const [featuredNews, featuredCourses] = await Promise.all([
    fetchByIds<NewsItem>(supabase, "news_items", "id, title, body, published_on", featuredNewsIds),
    fetchByIds<Course>(supabase, "courses", "id, code, title, description, image_url", featuredCourseIds),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        {hero.badge && (
          <span className="rounded-full border border-border/80 bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            {hero.badge}
          </span>
        )}
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          {hero.title}
        </h1>
        <p className="max-w-xl text-balance text-base text-muted-foreground md:text-lg">
          {hero.subtitle}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {dashboardHref ? (
            <Button size="lg" render={<Link href={dashboardHref} />}>
              <LayoutDashboard className="size-4" />
              Go to dashboard
            </Button>
          ) : (
            <Button size="lg" render={<Link href="/login" />}>
              Get started <ArrowRight className="ml-1 size-4" />
            </Button>
          )}
        </div>
      </section>

      {/* About */}
      {aboutItems.length > 0 && (
        <section id="about" className="border-y border-border/60 bg-muted/20">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 md:grid-cols-3">
            {aboutItems.map((item) => {
              const Icon = ICON_MAP[item.icon] ?? Sparkles;
              return (
                <div key={item.id} className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Courses */}
      {featuredCourses.length > 0 && (
        <section id="courses" className="mx-auto w-full max-w-7xl px-6 py-20">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Our courses
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A taste of what we offer.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredCourses.map((c) => (
              <Card key={c.id} className="overflow-hidden border-border/60 pt-0">
                {c.image_url && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                    <Image
                      src={c.image_url}
                      alt={c.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    {c.code}
                  </Badge>
                  <CardTitle className="text-base font-semibold leading-snug">
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {c.description ?? "—"}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Teachers */}
      {featuredTeachers.length > 0 && (
        <section
          id="teachers"
          className="border-y border-border/60 bg-muted/20"
        >
          <div className="mx-auto w-full max-w-7xl px-6 py-20">
            <div className="mb-10">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Meet the teachers
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The people who run the classroom.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {featuredTeachers.map((t) => (
                <Card key={t.id} className="border-border/60 text-center">
                  <CardContent className="flex flex-col items-center gap-3 pt-6">
                    <Avatar className="size-20">
                      {t.avatar_url && (
                        <AvatarImage src={t.avatar_url} alt={t.full_name} />
                      )}
                      <AvatarFallback className="text-lg">
                        {initials(t.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{t.full_name}</p>
                      {t.bio && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t.bio}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* News */}
      {featuredNews.length > 0 && (
        <section id="news" className="mx-auto w-full max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Latest news
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What&apos;s been happening on campus.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredNews.map((n) => (
              <Card key={n.id} className="border-border/60">
                <CardHeader>
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(n.published_on).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <CardTitle className="text-base font-semibold leading-snug">
                    {n.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {n.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function initials(value: string) {
  return value
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function fetchByIds<T extends { id: string }>(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  columns: string,
  ids: string[],
): Promise<T[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from(table)
    .select(columns)
    .in("id", ids)
    .returns<T[]>();
  if (!data) return [];
  // Preserve order of `ids`
  const byId = new Map(data.map((d) => [d.id, d]));
  return ids.map((id) => byId.get(id)).filter((x): x is T => Boolean(x));
}
