import { CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { approveEnrollmentAction, declineEnrollmentAction } from "./actions";

export const metadata = { title: "Enrollments" };

type EnrollmentRow = {
  status: "pending" | "approved" | "declined";
  enrolled_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  courses: {
    id: string;
    code: string;
    title: string;
  };
};

function initials(name: string | null, email: string) {
  const source = name ?? email;
  return source
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: Clock,
  },
  approved: {
    label: "Approved",
    variant: "default" as const,
    icon: CheckCircle,
  },
  declined: {
    label: "Declined",
    variant: "destructive" as const,
    icon: XCircle,
  },
};

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("student_enrollments")
    .select(
      "status, enrolled_at, profiles!student_id(id, full_name, email, avatar_url), courses!course_id(id, code, title)",
    )
    .order("enrolled_at", { ascending: false })
    .returns<EnrollmentRow[]>();

  const all = enrollments ?? [];
  const pending = all.filter((e) => e.status === "pending");
  const approved = all.filter((e) => e.status === "approved");
  const declined = all.filter((e) => e.status === "declined");

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Enrollments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review student enrollment requests and approve or decline them.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          {pending.length} pending
        </div>
      </div>

      {/* Pending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4 text-amber-500" />
            Pending requests
          </CardTitle>
          <CardDescription>
            These students are waiting for approval to join a course.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {pending.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No pending requests.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((e) => (
                <EnrollmentRow
                  key={`${e.profiles.id}-${e.courses.id}`}
                  enrollment={e}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Approved */}
      {approved.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="size-4 text-green-500" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {approved.map((e) => (
                <EnrollmentRow
                  key={`${e.profiles.id}-${e.courses.id}`}
                  enrollment={e}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Declined */}
      {declined.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="size-4 text-destructive" />
              Declined
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {declined.map((e) => (
                <EnrollmentRow
                  key={`${e.profiles.id}-${e.courses.id}`}
                  enrollment={e}
                />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function EnrollmentRow({ enrollment: e }: { enrollment: EnrollmentRow }) {
  const cfg = STATUS_CONFIG[e.status];
  const Icon = cfg.icon;

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
      {/* Student */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="size-9 shrink-0">
          {e.profiles.avatar_url && (
            <AvatarImage
              src={e.profiles.avatar_url}
              alt={e.profiles.full_name ?? e.profiles.email}
            />
          )}
          <AvatarFallback className="text-xs">
            {initials(e.profiles.full_name, e.profiles.email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">
            {e.profiles.full_name ?? e.profiles.email}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {e.profiles.email}
          </p>
        </div>
      </div>

      {/* Course */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
          {e.courses.code}
        </span>
        <span className="truncate text-sm">{e.courses.title}</span>
      </div>

      {/* Date + status + actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {new Date(e.enrolled_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>

        <Badge variant={cfg.variant} className="gap-1">
          <Icon className="size-3" />
          {cfg.label}
        </Badge>

        {e.status === "pending" && (
          <div className="flex items-center gap-2">
            <form
              action={approveEnrollmentAction.bind(
                null,
                e.profiles.id,
                e.courses.id,
              )}
            >
              <Button size="sm" variant="default" type="submit">
                Approve
              </Button>
            </form>
            <form
              action={declineEnrollmentAction.bind(
                null,
                e.profiles.id,
                e.courses.id,
              )}
            >
              <Button size="sm" variant="outline" type="submit">
                Decline
              </Button>
            </form>
          </div>
        )}

        {e.status === "approved" && (
          <form
            action={declineEnrollmentAction.bind(
              null,
              e.profiles.id,
              e.courses.id,
            )}
          >
            <Button size="sm" variant="outline" type="submit">
              Revoke
            </Button>
          </form>
        )}

        {e.status === "declined" && (
          <form
            action={approveEnrollmentAction.bind(
              null,
              e.profiles.id,
              e.courses.id,
            )}
          >
            <Button size="sm" variant="outline" type="submit">
              Approve
            </Button>
          </form>
        )}
      </div>
    </li>
  );
}
