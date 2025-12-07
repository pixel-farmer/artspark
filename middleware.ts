// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Don't track the /visits page itself or API routes
  if (request.nextUrl.pathname === "/visits" || request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Track the visit asynchronously
  const userAgent = request.headers.get("user-agent") || "";
  const ip = getClientIP(request);
  
  // Fire and forget - don't block the request
  // Use void to explicitly ignore the promise
  void fetch(`${request.nextUrl.origin}/api/track`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ip,
      userAgent,
      path: request.nextUrl.pathname,
    }),
  }).catch(() => {
    // Silently fail if tracking fails
  });

  return NextResponse.next();
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;
  
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  
  return request.ip || "Unknown";
}

export const config = {
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