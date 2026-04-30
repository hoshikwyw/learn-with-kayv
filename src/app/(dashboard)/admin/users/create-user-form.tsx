"use client";

import { useActionState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction } from "./actions";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    undefined,
  );
  const seenRef = useRef<unknown>(undefined);

  useEffect(() => {
    if (!state || state === seenRef.current) return;
    seenRef.current = state;
    if (state.success) toast.success(state.success);
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4" key={state?.success}>
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" required placeholder="Jane Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Google email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          required
          placeholder="jane@gmail.com"
        />
        <p className="text-xs text-muted-foreground">
          Must match the Google account they will sign in with.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue="teacher" required>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create user"}
      </Button>
    </form>
  );
}
