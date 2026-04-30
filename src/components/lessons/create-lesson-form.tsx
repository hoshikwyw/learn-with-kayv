"use client";

import { useActionState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLessonAction } from "./actions";

export function CreateLessonForm({
  courseId,
  onDone,
}: {
  courseId: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(createLessonAction, undefined);
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      onDone();
    } else if (state.error) toast.error(state.error);
  }, [state, onDone]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="course_id" value={courseId} />
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Lesson 1: Introduction"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Body</Label>
            <textarea
              id="body"
              name="body"
              rows={5}
              placeholder="Write the lesson content here."
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="video_url">YouTube URL (optional)</Label>
            <Input
              id="video_url"
              name="video_url"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              Accepts youtube.com/watch?v=… and youtu.be/… formats.
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Adding..." : "Add lesson"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onDone}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
