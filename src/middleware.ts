import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get user role if session exists
  let userRole = null;
  if (session) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    userRole = userData?.role;
  }

  const { pathname } = req.nextUrl;

  // Public routes that don't need authentication
  if (pathname === "/login" || pathname === "/") {
    if (session && userRole) {
      // Redirect authenticated users to appropriate dashboard
      const redirectUrl =
        userRole === "admin" ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return res;
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes protection
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Student routes protection (block admin from student routes)
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/attendance")) &&
    userRole === "admin"
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
