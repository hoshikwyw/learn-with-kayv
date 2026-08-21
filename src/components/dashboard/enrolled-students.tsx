import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

export type EnrolledStudent = {
  student_id: string;
  enrolled_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

function initials(name: string | null, email: string) {
  const src = name ?? email;
  return src
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function EnrolledStudents({
  students,
}: {
  students: EnrolledStudent[];
}) {
  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No approved students yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        {students.length} student{students.length !== 1 ? "s" : ""} enrolled
      </p>
      <ul className="divide-y divide-border rounded-lg border">
        {students.map((s) => (
          <li
            key={s.student_id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <Avatar className="size-8 shrink-0">
              {s.profiles.avatar_url && (
                <AvatarImage
                  src={s.profiles.avatar_url}
                  alt={s.profiles.full_name ?? s.profiles.email}
                />
              )}
              <AvatarFallback className="text-xs">
                {initials(s.profiles.full_name, s.profiles.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {s.profiles.full_name ?? s.profiles.email}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {s.profiles.email}
              </p>
            </div>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {new Date(s.enrolled_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
