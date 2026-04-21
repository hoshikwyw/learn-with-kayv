import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const NEWS = [
  {
    date: "Apr 18, 2026",
    title: "Spring term timetable published",
    body: "Teachers and students can now view the full Spring term schedule from the dashboard.",
  },
  {
    date: "Apr 05, 2026",
    title: "New science lab opens on campus",
    body: "A fully equipped science lab is now available for Year 8 and above.",
  },
  {
    date: "Mar 22, 2026",
    title: "Registrations open for 2026 cohort",
    body: "Families can now enroll new students through the platform.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
        <span className="rounded-full border border-border/80 bg-muted/30 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Private school · Est. 2026
        </span>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          A calm, modern home for learning at{" "}
          <span className="text-primary">Learn-with-kayv</span>.
        </h1>
        <p className="max-w-xl text-balance text-base text-muted-foreground md:text-lg">
          One place for students to track grades and timetables, teachers to manage
          their classes, and admins to run the school.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/signup" />}>
            Get started <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/login" />}>
            I already have an account
          </Button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 md:grid-cols-3">
          <About
            icon={<BookOpen className="size-5" />}
            title="Coursera-style courses"
            body="Modules, lessons, quizzes and assignments — structured the way students already learn online."
          />
          <About
            icon={<Users className="size-5" />}
            title="Three roles, one system"
            body="Admins manage users and courses. Teachers grade work. Students track progress. Each gets a focused dashboard."
          />
          <About
            icon={<Newspaper className="size-5" />}
            title="School news, built in"
            body="Announcements, timetable changes, and events — published by admins, visible to the whole school."
          />
        </div>
      </section>

      {/* News */}
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
          {NEWS.map((n) => (
            <Card key={n.title} className="border-border/60">
              <CardHeader>
                <p className="text-xs font-medium text-muted-foreground">
                  {n.date}
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
    </>
  );
}

function About({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
