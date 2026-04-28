"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAboutItemAction,
  deleteAboutItemAction,
  moveAboutItemAction,
  updateAboutItemAction,
} from "./actions";

export type AboutItem = {
  id: string;
  icon: string;
  title: string;
  body: string;
  display_order: number;
};

export function AboutTab({ items }: { items: AboutItem[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4" /> Add about item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAboutForm />
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No about items yet. Add the first one above.
          </p>
        )}
        {items.map((item, idx) => (
          <AboutItemRow
            key={item.id}
            item={item}
            isFirst={idx === 0}
            isLast={idx === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function CreateAboutForm() {
  const [state, formAction, pending] = useActionState(createAboutItemAction, undefined);
  const seenRef = useRef<unknown>(undefined);
  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[140px_1fr_1fr_auto]" key={state?.success}>
      <Input name="icon" placeholder="BookOpen" required />
      <Input name="title" placeholder="Title" required />
      <Input name="body" placeholder="Body text" required />
      <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Add"}</Button>
    </form>
  );
}

function AboutItemRow({
  item,
  isFirst,
  isLast,
}: {
  item: AboutItem;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateAboutItemAction, undefined);
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) {
      toast.success(state.success);
      setEditing(false);
    } else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardContent className="pt-6">
        {editing ? (
          <form action={formAction} className="grid gap-3 sm:grid-cols-[140px_1fr_2fr_auto]">
            <input type="hidden" name="id" value={item.id} />
            <Input name="icon" defaultValue={item.icon} required />
            <Input name="title" defaultValue={item.title} required />
            <Input name="body" defaultValue={item.body} required />
            <div className="flex gap-1">
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
        ) : (
          <div className="flex items-start gap-4">
            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
              {item.icon}
            </span>
            <div className="flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <form action={moveAboutItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="direction" value="up" />
                <Button type="submit" size="icon-sm" variant="ghost" disabled={isFirst}>
                  <ArrowUp className="size-4" />
                </Button>
              </form>
              <form action={moveAboutItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="direction" value="down" />
                <Button type="submit" size="icon-sm" variant="ghost" disabled={isLast}>
                  <ArrowDown className="size-4" />
                </Button>
              </form>
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <form action={deleteAboutItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button type="submit" size="icon-sm" variant="ghost">
                  <Trash2 className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
