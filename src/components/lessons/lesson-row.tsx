"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteLessonAction,
  moveLessonAction,
  updateLessonAction,
} from "./actions";
import { getYouTubeEmbedUrl } from "./youtube";

export type Lesson = {
  id: string;
  course_id: string;
  title: string;
  body: string;
  video_url: string | null;
  display_order: number;
};

export function LessonRow({
  lesson,
  index,
  isFirst,
  isLast,
  canEdit,
}: {
  lesson: Lesson;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateLessonAction, undefined);
  const [isDeleting, startDelete] = useTransition();
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      setEditing(false);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  function handleDelete() {
    if (!confirm(`Delete "${lesson.title}"?`)) return;
    const fd = new FormData();
    fd.append("id", lesson.id);
    fd.append("course_id", lesson.course_id);
    startDelete(async () => {
      await deleteLessonAction(fd);
      toast.success("Lesson deleted.");
    });
  }

  const embedUrl = getYouTubeEmbedUrl(lesson.video_url);

  if (editing) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6">
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="course_id" value={lesson.course_id} />
            <div className="space-y-1.5">
              <Label htmlFor={`title-${lesson.id}`}>Title</Label>
              <Input id={`title-${lesson.id}`} name="title" defaultValue={lesson.title} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`body-${lesson.id}`}>Body</Label>
              <textarea
                id={`body-${lesson.id}`}
                name="body"
                defaultValue={lesson.body}
                rows={5}
                placeholder="Write the lesson content here."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`video-${lesson.id}`}>YouTube URL (optional)</Label>
              <Input
                id={`video-${lesson.id}`}
                name="video_url"
                defaultValue={lesson.video_url ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="flex-1">
            <h3 className="font-semibold leading-snug">{lesson.title}</h3>
            {lesson.body && (
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                {lesson.body}
              </p>
            )}
          </div>

          {canEdit && (
            <div className="flex shrink-0 gap-1">
              <form action={moveLessonAction}>
                <input type="hidden" name="id" value={lesson.id} />
                <input type="hidden" name="course_id" value={lesson.course_id} />
                <input type="hidden" name="direction" value="up" />
                <Button type="submit" size="icon-sm" variant="ghost" disabled={isFirst}>
                  <ArrowUp className="size-4" />
                </Button>
              </form>
              <form action={moveLessonAction}>
                <input type="hidden" name="id" value={lesson.id} />
                <input type="hidden" name="course_id" value={lesson.course_id} />
                <input type="hidden" name="direction" value="down" />
                <Button type="submit" size="icon-sm" variant="ghost" disabled={isLast}>
                  <ArrowDown className="size-4" />
                </Button>
              </form>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {embedUrl && (
          <div className="aspect-video overflow-hidden rounded-md border bg-black">
            <iframe
              src={embedUrl}
              title={lesson.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        )}

        {!embedUrl && lesson.video_url && (
          <p className="text-xs text-destructive">
            Video URL didn&apos;t parse as a YouTube link.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
