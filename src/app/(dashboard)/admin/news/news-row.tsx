"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteNewsAction, updateNewsAction } from "./actions";

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  published_on: string;
  image_url?: string | null;
};

export function NewsRow({ item }: { item: NewsItem }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateNewsAction, undefined);
  const [isDeleting, startDelete] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const seenRef = useRef<unknown>(undefined);

  function handleDelete() {
    if (!confirm(`Delete "${item.title}"?`)) return;
    const fd = new FormData();
    fd.append("id", item.id);
    startDelete(async () => {
      await deleteNewsAction(fd);
      toast.success("News item deleted.");
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      setEditing(false);
      setPreviewUrl(null);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  const editImageId = `news-image-edit-${item.id}`;
  const displayImage = previewUrl ?? item.image_url ?? null;

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="p-3">
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="id" value={item.id} />
            <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
              <Input type="date" name="published_on" defaultValue={item.published_on} required />
              <Input name="title" defaultValue={item.title} required />
            </div>
            <textarea
              name="body"
              defaultValue={item.body}
              rows={3}
              required
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
            />

            {/* Image picker */}
            <div className="space-y-2">
              {displayImage && (
                <div className="relative aspect-video w-48 overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={displayImage}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized={displayImage.startsWith("blob:")}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={editImageId}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
                >
                  {displayImage ? (
                    <><Upload className="size-4" /> Replace image</>
                  ) : (
                    <><ImageIcon className="size-4" /> Add image</>
                  )}
                </Label>
                <input
                  id={editImageId}
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <span className="text-xs text-muted-foreground">optional · max 5 MB</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => { setEditing(false); setPreviewUrl(null); }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="p-3">
        <div className="relative size-12 overflow-hidden rounded-md border bg-muted shrink-0">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-4" />
            </div>
          )}
        </div>
      </td>
      <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
        {new Date(item.published_on).toLocaleDateString()}
      </td>
      <td className="p-3 font-medium">{item.title}</td>
      <td className="p-3 text-sm text-muted-foreground line-clamp-2">{item.body}</td>
      <td className="p-3 text-right">
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
