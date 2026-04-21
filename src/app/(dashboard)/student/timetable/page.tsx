import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Timetable" };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

// Placeholder schedule until the timetable table is wired up.
const SAMPLE: Record<(typeof DAYS)[number], { time: string; subject: string }[]> =
  {
    Monday: [
      { time: "08:30 - 09:30", subject: "Mathematics" },
      { time: "09:45 - 10:45", subject: "English" },
      { time: "11:00 - 12:00", subject: "Science" },
    ],
    Tuesday: [
      { time: "08:30 - 09:30", subject: "History" },
      { time: "09:45 - 10:45", subject: "Mathematics" },
    ],
    Wednesday: [
      { time: "08:30 - 09:30", subject: "Art" },
      { time: "09:45 - 10:45", subject: "Science" },
    ],
    Thursday: [
      { time: "08:30 - 09:30", subject: "English" },
      { time: "09:45 - 10:45", subject: "Physical Education" },
    ],
    Friday: [
      { time: "08:30 - 09:30", subject: "Mathematics" },
      { time: "09:45 - 10:45", subject: "Music" },
    ],
  };

export default function StudentTimetablePage() {
  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Timetable</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your weekly class schedule. (Static sample — wire up in v2.)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {DAYS.map((day) => (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{day}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {SAMPLE[day].map((s) => (
                <div
                  key={s.time}
                  className="rounded-md border border-border/60 p-3 text-sm"
                >
                  <p className="font-medium">{s.subject}</p>
                  <p className="text-xs text-muted-foreground">{s.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
