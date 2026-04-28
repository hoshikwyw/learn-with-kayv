import { createClient } from "@/lib/supabase/server";
import { ContentTabs } from "./content-tabs";
import type { Hero } from "./hero-tab";
import type { AboutItem } from "./about-tab";
import type { NewsItem } from "./news-tab";
import type { Course } from "./courses-tab";
import type { FeaturedTeacher, AvailableTeacher } from "./teachers-tab";

export const metadata = { title: "Marketing content" };

const HERO_DEFAULT: Hero = {
  badge: "Private school · Est. 2026",
  title: "A calm, modern home for learning at Learn-with-kayv.",
  subtitle:
    "One place for students to track grades and timetables, teachers to manage their classes, and admins to run the school.",
};

export default async function AdminContentPage() {
  const supabase = await createClient();

  // All data in parallel
  const [
    heroSetting,
    featuredNewsIds,
    featuredCourseIds,
    aboutItems,
    allNews,
    allCourses,
    featuredTeachers,
    availableTeachers,
  ] = await Promise.all([
    supabase.from("site_settings").select("value").eq("key", "hero").maybeSingle<{ value: Hero }>(),
    supabase.from("site_settings").select("value").eq("key", "featured_news_ids").maybeSingle<{ value: string[] }>(),
    supabase.from("site_settings").select("value").eq("key", "featured_course_ids").maybeSingle<{ value: string[] }>(),
    supabase.from("about_items").select("id, icon, title, body, display_order").order("display_order", { ascending: true }).returns<AboutItem[]>(),
    supabase.from("news_items").select("id, title, body, published_on").order("published_on", { ascending: false }).returns<NewsItem[]>(),
    supabase.from("courses").select("id, code, title, description").order("created_at", { ascending: false }).returns<Course[]>(),
    supabase.from("featured_teachers").select("id, profile_id, display_order, full_name, avatar_url, bio").order("display_order", { ascending: true }).returns<FeaturedTeacher[]>(),
    supabase.from("profiles").select("id, full_name, email, avatar_url").eq("role", "teacher").order("full_name", { ascending: true }).returns<AvailableTeacher[]>(),
  ]);

  const hero = heroSetting.data?.value ?? HERO_DEFAULT;
  const featuredNewsIdsArr = Array.isArray(featuredNewsIds.data?.value)
    ? featuredNewsIds.data!.value
    : [];
  const featuredCourseIdsArr = Array.isArray(featuredCourseIds.data?.value)
    ? featuredCourseIds.data!.value
    : [];

  const newsAll = allNews.data ?? [];
  const coursesAll = allCourses.data ?? [];
  const featuredTeachersList = featuredTeachers.data ?? [];

  // Preserve order of featured arrays
  const newsById = new Map(newsAll.map((n) => [n.id, n]));
  const featuredNews = featuredNewsIdsArr
    .map((id: string) => newsById.get(id))
    .filter((x): x is NewsItem => Boolean(x));
  const availableNews = newsAll.filter((n) => !featuredNewsIdsArr.includes(n.id));

  const coursesById = new Map(coursesAll.map((c) => [c.id, c]));
  const featuredCourses = featuredCourseIdsArr
    .map((id: string) => coursesById.get(id))
    .filter((x): x is Course => Boolean(x));
  const availableCourses = coursesAll.filter((c) => !featuredCourseIdsArr.includes(c.id));

  const featuredTeacherProfileIds = new Set(
    featuredTeachersList.map((t) => t.profile_id),
  );
  const availableTeachersFiltered =
    (availableTeachers.data ?? []).filter(
      (t) => !featuredTeacherProfileIds.has(t.id),
    );

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Marketing content
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage what shows on the public landing page.
        </p>
      </div>

      <ContentTabs
        hero={hero}
        aboutItems={aboutItems.data ?? []}
        featuredNews={featuredNews}
        availableNews={availableNews}
        featuredCourses={featuredCourses}
        availableCourses={availableCourses}
        featuredTeachers={featuredTeachersList}
        availableTeachers={availableTeachersFiltered}
      />
    </>
  );
}
