import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || "e4b9d0b04e6c433190b25e7eb00c8b6b";

  // Check both secure and standard cookie names to handle reverse proxies (HTTPS outside, HTTP inside)
  let token = await getToken({ req, secret, secureCookie: true });
  if (!token) {
    token = await getToken({ req, secret, secureCookie: false });
  }

  const path = req.nextUrl.pathname;

  // If visiting login page:
  if (path.startsWith("/admin/login")) {
    // If already logged in, redirect to admin dashboard
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Protected admin routes:
  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Super admin only routes:
  if (path.startsWith("/admin/mcp") && (token as any)?.role !== "super_admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
