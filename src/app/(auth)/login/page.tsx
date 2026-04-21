"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, undefined);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your Learn-with-kayv account.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@school.edu"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error && (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
