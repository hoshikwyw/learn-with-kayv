import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { displayName, formatDate, initials } from "@/lib/format";

export type EnrolledStudent = {
  student_id: string;
  enrolled_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
};

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
                  alt={displayName(s.profiles)}
                />
              )}
              <AvatarFallback className="text-xs">
                {initials(displayName(s.profiles))}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {displayName(s.profiles)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {s.profiles.email}
              </p>
            </div>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {formatDate(s.enrolled_at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
