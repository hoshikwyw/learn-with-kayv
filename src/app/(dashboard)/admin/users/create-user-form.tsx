"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction } from "./actions";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    undefined,
  );

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
        <select
          id="role"
          name="role"
          defaultValue="teacher"
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
        >
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600" role="status">
          {state.success}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create user"}
      </Button>
    </form>
  );
}
