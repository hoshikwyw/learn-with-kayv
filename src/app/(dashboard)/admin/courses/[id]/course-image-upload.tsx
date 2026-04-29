"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadCourseImageAction } from "./actions";

export function CourseImageUpload({
  courseId,
  initialImageUrl,
}: {
  courseId: string;
  initialImageUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    uploadCourseImageAction,
    undefined,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      setPreviewUrl(null);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  // Clear preview when server-rendered image changes (i.e. successful save)
  useEffect(() => {
    setPreviewUrl(null);
  }, [initialImageUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displayed = previewUrl ?? initialImageUrl;

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="course_id" value={courseId} />

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border bg-muted">
        {displayed ? (
          <Image
            src={displayed}
            alt="Course image"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            unoptimized={displayed.startsWith("blob:")}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Label
          htmlFor="course-image"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          <Upload className="size-4" />
          {previewUrl ? "Change image" : initialImageUrl ? "Replace image" : "Upload image"}
        </Label>
        <input
          id="course-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
        {previewUrl && (
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Uploading..." : "Save"}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        JPG, PNG, or WebP. Max 5MB. Recommended 16:9 (e.g. 1280×720).
      </p>
    </form>
  );
}
