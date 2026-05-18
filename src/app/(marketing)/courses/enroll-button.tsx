"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { enrollAction, unenrollAction } from "./actions";

interface EnrollButtonProps {
  courseId: string;
  /** true = logged in as student and already enrolled */
  enrolled: boolean;
  /** true = logged in as student (not yet enrolled) */
  isStudent: boolean;
  /** redirect path sent to /login when not signed in */
  redirectPath: string;
}

export function EnrollButton({
  courseId,
  enrolled,
  isStudent,
  redirectPath,
}: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

  // Not a student → prompt to register
  if (!isStudent) {
    return (
      <Button
        size="sm"
        render={
          <Link href={`/login?redirect=${encodeURIComponent(redirectPath)}`} />
        }
      >
        Register to Enroll
      </Button>
    );
  }

  function handleClick() {
    startTransition(async () => {
      if (enrolled) {
        await unenrollAction(courseId);
      } else {
        await enrollAction(courseId);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant={enrolled ? "outline" : "default"}
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "..." : enrolled ? "Unenroll" : "Enroll"}
    </Button>
  );
}
