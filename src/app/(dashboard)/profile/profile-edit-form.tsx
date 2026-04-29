"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfileAction } from "./actions";

export function ProfileEditForm({
  initialFullName,
  initialAvatarUrl,
}: {
  initialFullName: string;
  initialAvatarUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    undefined,
  );
  const [fullName, setFullName] = useState(initialFullName);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    setFullName(initialFullName);
  }, [initialFullName]);

  // Clear preview when the server-rendered avatar changes (i.e. a successful save)
  useEffect(() => {
    setPreviewUrl(null);
  }, [initialAvatarUrl]);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  const displayedAvatar = previewUrl ?? initialAvatarUrl ?? undefined;
  const initials = (initialFullName || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          {displayedAvatar && <AvatarImage src={displayedAvatar} alt={fullName} />}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label
            htmlFor="avatar"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <Upload className="size-4" />
            {previewUrl ? "Change image" : "Upload image"}
          </Label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 2MB.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
