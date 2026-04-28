"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteNewsAction, updateNewsAction } from "./actions";

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  published_on: string;
};

export function NewsRow({ item }: { item: NewsItem }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateNewsAction, undefined);
  const [isDeleting, startDelete] = useTransition();
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
      <tr>
        <td colSpan={4} className="p-3">
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
        </td>
      </tr>
    );
  }

  return (
    <tr>
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
