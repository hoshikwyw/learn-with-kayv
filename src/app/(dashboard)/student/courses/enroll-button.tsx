"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { enrollAction, unenrollAction } from "./actions";

interface EnrollButtonProps {
  courseId: string;
  enrolled: boolean;
}

export function EnrollButton({ courseId, enrolled }: EnrollButtonProps) {
  const [isPending, startTransition] = useTransition();

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
      className="shrink-0"
    >
      {isPending ? "..." : enrolled ? "Unenroll" : "Enroll"}
    </Button>
  );
}
