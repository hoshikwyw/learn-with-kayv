"use client";

import { useActionState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createNewsAction } from "./actions";

export function CreateNewsForm() {
  const [state, formAction, pending] = useActionState(createNewsAction, undefined);
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-3" key={state?.success}>
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
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add news"}
      </Button>
    </form>
  );
}
