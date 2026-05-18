"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNewsAction } from "./actions";

export function CreateNewsForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, formAction, pending] = useActionState(createNewsAction, undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const seenRef = useRef<unknown>(undefined);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      setPreviewUrl(null);
      onSuccessRef.current?.();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  return (
    <form action={formAction} className="space-y-4" key={state?.success}>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div className="space-y-2">
          <Label htmlFor="published_on">Date</Label>
          <Input
            id="published_on"
            name="published_on"
            type="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Spring term timetable published"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <textarea
          id="body"
          name="body"
          rows={3}
          required
          placeholder="A short paragraph that appears on the landing page."
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
        />
      </div>

      <div className="space-y-2">
        <Label>Image <span className="text-muted-foreground">(optional)</span></Label>
        {previewUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label
            htmlFor="news-image"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            {previewUrl ? (
              <>
                <Upload className="size-4" />
                Change image
              </>
            ) : (
              <>
                <ImageIcon className="size-4" />
                Add image
              </>
            )}
          </Label>
          <input
            id="news-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
          {previewUrl && (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setPreviewUrl(null);
                const input = document.getElementById("news-image") as HTMLInputElement;
                if (input) input.value = "";
              }}
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WebP · max 5 MB</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add news"}
      </Button>
    </form>
  );
}
