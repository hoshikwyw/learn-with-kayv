"use client";

import { useTransition } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { enrollAction, unenrollAction } from "./actions";

export type EnrollmentStatus = "pending" | "approved" | "declined" | null;

interface EnrollButtonProps {
  courseId: string;
  status: EnrollmentStatus;
}

export function EnrollButton({ courseId, status }: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

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
