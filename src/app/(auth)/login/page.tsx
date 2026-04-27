import { GoogleSignIn } from "@/components/auth/google-sign-in";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to Learn-with-kayv
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with your Google account to continue.
        </p>
      </div>

      <GoogleSignIn label="Continue with Google" />

      {error && (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-center text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Students self-enroll on first sign-in. Teachers and admins are added by
        an existing admin.
      </p>
    </div>
  );
}
