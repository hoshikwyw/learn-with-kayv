"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enrollAction, unenrollAction } from "@/lib/actions/enrollment";
import type { EnrollmentStatus } from "@/types/db";

type EnrollButtonProps = {
  courseId: string;
  /** The signed-in student's current status for this course, or null. */
  status: EnrollmentStatus | null;
  /**
   * Whether the viewer is a signed-in student. Public pages pass `false` for
   * visitors and for staff, who get a sign-in link instead of an Enroll button.
   * Defaults to true for dashboard pages, where only students ever see this.
   */
  isStudent?: boolean;
  /** Where to send a visitor back to after they sign in. */
  redirectPath?: string;
};

export function EnrollButton({
  courseId,
  status,
  isStudent = true,
  redirectPath,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (!isStudent) {
    const href = redirectPath
      ? `/login?redirect=${encodeURIComponent(redirectPath)}`
      : "/login";
    return (
      <Button size="sm" render={<Link href={href} />}>
        Register to Enroll
      </Button>
    );
  }

  if (status === "pending") {
    return (
      <Button size="sm" variant="outline" disabled className="gap-1.5 shrink-0">
        <Clock className="size-3.5" />
        Pending Approval
      </Button>
    );
  }

  function handleClick() {
    startTransition(async () => {
      if (status === "approved") {
        await unenrollAction(courseId);
      } else {
        await enrollAction(courseId);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={status === "approved" ? "outline" : "default"}
      onClick={handleClick}
      disabled={isPending}
      className="shrink-0"
    >
      {isPending ? "..." : status === "approved" ? "Unenroll" : "Enroll"}
    </Button>
  );
}
