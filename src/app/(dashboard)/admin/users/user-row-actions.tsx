"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { toggleBlockUserAction } from "./actions";

export function BlockToggleButton({
  userId,
  blocked,
}: {
  userId: string;
  blocked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleBlockUserAction(userId, !blocked);
      if (result?.error) toast.error(result.error);
      else if (result?.success) toast.success(result.success);
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleToggle}
      className={
        blocked
          ? "text-muted-foreground"
          : "text-destructive hover:bg-destructive/10 hover:text-destructive"
      }
    >
      {isPending ? "..." : blocked ? "Unblock" : "Block"}
    </Button>
  );
}
