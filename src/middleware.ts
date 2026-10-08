import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redirects } from "@/content/redirects";
import { DEMO_COOKIE_NAME, verifySession } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Check if historical URL requires 301/302 redirect
  const match = redirects.find((r) => r.source === pathname);
  if (match) {
    const destinationUrl = new URL(match.destination, request.url);
    return NextResponse.redirect(destinationUrl, {
      status: match.permanent ? 301 : 302,
    });
  }

  // 2. Legacy portal path migration redirects
  if (pathname.startsWith("/portal/student")) {
    return NextResponse.redirect(new URL("/student", request.url));
  }
  if (pathname.startsWith("/portal/tutor")) {
    return NextResponse.redirect(new URL("/staff", request.url));
  }
  if (pathname.startsWith("/portal/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // 3. Protected Route Guards for /student, /staff, /admin, /super
  const isProtectedPath =
    pathname.startsWith("/student") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super");

  if (isProtectedPath) {
    const sessionCookie = request.cookies.get(DEMO_COOKIE_NAME);
    const session = sessionCookie ? await verifySession(sessionCookie.value) : null;

    // Not authenticated -> redirect to /login
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization guards
    if (pathname.startsWith("/super") && session.role !== "super_admin") {
      // Non-super admin cannot access /super
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      pathname.startsWith("/admin") &&
      session.role !== "admin_staff" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin"
    ) {
      // Students and tutors cannot enter /admin
      const destination = session.role === "student" ? "/student" : "/staff";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (
      pathname.startsWith("/staff") &&
      session.role !== "tutor" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin"
    ) {
      // Non-staff cannot enter /staff
      const destination = session.role === "student" ? "/student" : "/admin";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    if (
      pathname.startsWith("/student") &&
      session.role !== "student" &&
      session.role !== "owner_admin" &&
      session.role !== "super_admin"
    ) {
      // Staff/admin cannot enter student area without owner privilege
      const destination = session.role === "tutor" ? "/staff" : "/admin";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  return NextResponse.next();
}

export const matcher = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons and public static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
