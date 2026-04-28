import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, type Role } from "@/types/db";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("redirect");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeErr) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeErr.message)}`,
    );
  }

  // If middleware kicked them here with a "redirect=" param, honor it.
  if (next && next.startsWith("/")) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Otherwise route to the user's role home.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=no_session`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: Role }>();

  if (!profile) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "No profile found. Ask an admin to create your account.",
      )}`,
    );
  }

  return NextResponse.redirect(`${origin}${ROLE_HOME[profile.role]}`);
}
