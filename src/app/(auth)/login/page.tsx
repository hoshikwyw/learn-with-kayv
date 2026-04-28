import { GoogleSignIn } from "@/components/auth/google-sign-in";

export default function LoginPage() {
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

      <p className="text-center text-xs text-muted-foreground">
        Students self-enroll on first sign-in. Teachers and admins are added by
        an existing admin.
      </p>
    </div>
  );
}
