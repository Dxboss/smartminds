import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redirects } from "@/content/redirects";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if historical URL requires 301 redirect
  const match = redirects.find((r) => r.source === pathname);
  if (match) {
    const destinationUrl = new URL(match.destination, request.url);
    return NextResponse.redirect(destinationUrl, {
      status: match.permanent ? 301 : 302,
    });
  }

  return NextResponse.next();
}

export const matcher = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
