"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { MoreHorizontal, ShieldOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toggleBlockUserAction } from "./actions";

export function UserRowActions({
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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            aria-label="Row actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuItem
          variant={blocked ? "default" : "destructive"}
          disabled={isPending}
          onClick={handleToggle}
        >
          {blocked ? (
            <>
              <ShieldCheck className="size-4" />
              Unblock account
            </>
          ) : (
            <>
              <ShieldOff className="size-4" />
              Block account
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
