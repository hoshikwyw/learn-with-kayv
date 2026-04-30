"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCourseDescriptionAction } from "./actions";

export function DescriptionEdit({
  courseId,
  initialDescription,
}: {
  courseId: string;
  initialDescription: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateCourseDescriptionAction,
    undefined,
  );
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      setEditing(false);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  if (editing) {
    return (
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="course_id" value={courseId} />
        <textarea
          name="description"
          defaultValue={initialDescription ?? ""}
          rows={6}
          maxLength={2000}
          placeholder="Tell students what this course is about."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm whitespace-pre-wrap min-h-[3rem]">
        {initialDescription?.trim() || (
          <span className="text-muted-foreground">No description yet.</span>
        )}
      </p>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-4" />
        Edit description
      </Button>
    </div>
  );
}
