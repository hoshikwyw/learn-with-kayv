"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { ArrowDown, ArrowUp, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  addFeaturedTeacherAction,
  moveFeaturedTeacherAction,
  removeFeaturedTeacherAction,
  syncFeaturedTeacherFromProfileAction,
  updateFeaturedTeacherAction,
} from "./actions";

export type FeaturedTeacher = {
  id: string;
  profile_id: string;
  display_order: number;
  full_name: string;
  avatar_url: string | null;
  bio: string;
};

export type AvailableTeacher = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

export function TeachersTab({
  featured,
  available,
}: {
  featured: FeaturedTeacher[];
  available: AvailableTeacher[];
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">
            Featured on landing ({featured.length}/5)
          </h3>
          <p className="text-sm text-muted-foreground">
            Card shows avatar + name + bio. Bio is editable here only.
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            None featured yet — pick from the list below.
          </p>
        ) : (
          <div className="space-y-3">
            {featured.map((t, idx) => (
              <FeaturedTeacherRow
                key={t.id}
                teacher={t}
                isFirst={idx === 0}
                isLast={idx === featured.length - 1}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Available teachers</h3>
          <p className="text-sm text-muted-foreground">
            Teachers from /admin/users. Click + to feature.
          </p>
        </div>

        {available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No more teachers to feature.
          </p>
        ) : (
          <ul className="space-y-2">
            {available.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="size-9">
                  {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.email} />}
                  <AvatarFallback>{initials(t.full_name ?? t.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{t.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                </div>
                <FeatureTeacherButton profileId={t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FeaturedTeacherRow({
  teacher,
  isFirst,
  isLast,
}: {
  teacher: FeaturedTeacher;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateFeaturedTeacherAction, undefined);
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
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-4">
        <Avatar className="size-12">
          {teacher.avatar_url && (
            <AvatarImage src={teacher.avatar_url} alt={teacher.full_name} />
          )}
          <AvatarFallback>{initials(teacher.full_name)}</AvatarFallback>
        </Avatar>

        {editing ? (
          <form action={formAction} className="flex-1 space-y-3">
            <input type="hidden" name="id" value={teacher.id} />
            <div className="space-y-1">
              <Label htmlFor={`name-${teacher.id}`}>Display name</Label>
              <Input
                id={`name-${teacher.id}`}
                name="full_name"
                defaultValue={teacher.full_name}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`bio-${teacher.id}`}>Bio</Label>
              <textarea
                id={`bio-${teacher.id}`}
                name="bio"
                defaultValue={teacher.bio}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
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
        ) : (
          <div className="flex-1">
            <p className="font-medium">{teacher.full_name}</p>
            <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
              {teacher.bio || (
                <span className="italic">No bio yet — click Edit to add one.</span>
              )}
            </p>
          </div>
        )}

        {!editing && (
          <div className="flex shrink-0 gap-1">
            <form action={moveFeaturedTeacherAction}>
              <input type="hidden" name="id" value={teacher.id} />
              <input type="hidden" name="direction" value="up" />
              <Button type="submit" size="icon-sm" variant="ghost" disabled={isFirst}>
                <ArrowUp className="size-4" />
              </Button>
            </form>
            <form action={moveFeaturedTeacherAction}>
              <input type="hidden" name="id" value={teacher.id} />
              <input type="hidden" name="direction" value="down" />
              <Button type="submit" size="icon-sm" variant="ghost" disabled={isLast}>
                <ArrowDown className="size-4" />
              </Button>
            </form>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <form action={syncFeaturedTeacherFromProfileAction}>
              <input type="hidden" name="id" value={teacher.id} />
              <Button
                type="submit"
                size="icon-sm"
                variant="ghost"
                title="Refresh name and avatar from profile"
              >
                <RefreshCw className="size-4" />
              </Button>
            </form>
            <form action={removeFeaturedTeacherAction}>
              <input type="hidden" name="id" value={teacher.id} />
              <Button type="submit" size="icon-sm" variant="ghost">
                <X className="size-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureTeacherButton({ profileId }: { profileId: string }) {
  const [pending, startTransition] = useTransition();
  function handleClick() {
    const fd = new FormData();
    fd.append("profile_id", profileId);
    startTransition(async () => {
      const result = await addFeaturedTeacherAction(fd);
      if (result?.error) toast.error(result.error);
      else if (result?.success) toast.success(result.success);
    });
  }
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={pending}
    >
      <Plus className="size-4" />
      Feature
    </Button>
  );
}

function initials(value: string) {
  return value
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
