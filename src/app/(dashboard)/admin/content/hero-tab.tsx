"use client";

import { useActionState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateHeroAction } from "./actions";

export type Hero = { badge: string; title: string; subtitle: string };

export function HeroTab({ initial }: { initial: Hero }) {
  const [state, formAction, pending] = useActionState(updateHeroAction, undefined);
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="badge">Badge text</Label>
        <Input id="badge" name="badge" defaultValue={initial.badge} />
        <p className="text-xs text-muted-foreground">
          Small pill above the headline. Leave blank to hide.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={initial.title} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <textarea
          id="subtitle"
          name="subtitle"
          defaultValue={initial.subtitle}
          required
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save hero"}
      </Button>
    </form>
  );
}
