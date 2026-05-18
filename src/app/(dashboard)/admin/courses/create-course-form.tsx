"use client";

import { useActionState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCourseAction } from "./actions";

export function CreateCourseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createCourseAction, undefined);
  const seenRef = useRef<unknown>(undefined);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      onSuccessRef.current?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" key={state?.success}>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Algebra I" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" required placeholder="MATH-101" />
        <p className="text-xs text-muted-foreground">Must be unique across all courses.</p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create course"}
      </Button>
    </form>
  );
}
