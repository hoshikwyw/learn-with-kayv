"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HeroTab, type Hero } from "./hero-tab";
import { AboutTab, type AboutItem } from "./about-tab";
import { NewsTab, type NewsItem } from "./news-tab";
import { CoursesTab, type Course } from "./courses-tab";
import {
  TeachersTab,
  type FeaturedTeacher,
  type AvailableTeacher,
} from "./teachers-tab";

const TABS = [
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "news", label: "News" },
  { key: "courses", label: "Courses" },
  { key: "teachers", label: "Teachers" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ContentTabs({
  hero,
  aboutItems,
  featuredNews,
  availableNews,
  featuredCourses,
  availableCourses,
  featuredTeachers,
  availableTeachers,
}: {
  hero: Hero;
  aboutItems: AboutItem[];
  featuredNews: NewsItem[];
  availableNews: NewsItem[];
  featuredCourses: Course[];
  availableCourses: Course[];
  featuredTeachers: FeaturedTeacher[];
  availableTeachers: AvailableTeacher[];
}) {
  const [active, setActive] = useState<TabKey>("hero");

  return (
    <div className="space-y-6">
      <div className="border-b">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition",
                active === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {active === "hero" && <HeroTab initial={hero} />}
      {active === "about" && <AboutTab items={aboutItems} />}
      {active === "news" && (
        <NewsTab featured={featuredNews} available={availableNews} />
      )}
      {active === "courses" && (
        <CoursesTab featured={featuredCourses} available={availableCourses} />
      )}
      {active === "teachers" && (
        <TeachersTab
          featured={featuredTeachers}
          available={availableTeachers}
        />
      )}
    </div>
  );
}
