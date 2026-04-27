import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Role } from "@/types/db";
import { ROLE_HOME } from "@/types/db";

const PUBLIC_PATHS = ["/", "/about", "/news"];
const AUTH_PATHS = ["/login", "/auth/callback"];
const ROLE_PREFIXES: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

const SHARED_AUTH_PATHS = ["/profile"];

function isProtected(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/student")
  );
}

function requiresAuth(pathname: string) {
  return (
    isProtected(pathname) ||
    SHARED_AUTH_PATHS.some((p) => pathname.startsWith(p))
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: no logic between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isPublicRoute =
    PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/_next");

  // Unauthenticated users hitting a protected route → /login
  if (!user && requiresAuth(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users — resolve role once, then decide
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single<{ role: Role }>();

    const role: Role = profile?.role ?? "student";
    const home = ROLE_HOME[role];

    // Redirect logged-in users away from auth pages
    if (isAuthRoute && pathname !== "/auth/callback") {
      const url = request.nextUrl.clone();
      url.pathname = home;
      return NextResponse.redirect(url);
    }

    // RBAC: only allow users to access their own role's prefix
    if (isProtected(pathname)) {
      const allowed = ROLE_PREFIXES[role];
      if (!pathname.startsWith(allowed)) {
        const url = request.nextUrl.clone();
        url.pathname = home;
        return NextResponse.redirect(url);
      }
    }
  }

  // Suppress unused-var warnings from linter for helpers
  void isPublicRoute;

  return response;
}
