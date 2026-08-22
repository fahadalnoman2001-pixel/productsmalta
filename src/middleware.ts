import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPrivatePath =
    path.startsWith("/admin") ||
    path.startsWith("/oauth") ||
    path.startsWith("/api") ||
    path.startsWith("/mcp");

  // Base response handler helper
  const addSecurityHeaders = (res: NextResponse) => {
    if (isPrivatePath) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    }
    return res;
  };

  // Only run NextAuth protection for /admin routes
  if (path.startsWith("/admin")) {
    const secret = process.env.NEXTAUTH_SECRET || "e4b9d0b04e6c433190b25e7eb00c8b6b";

    // Check both secure and standard cookie names to handle reverse proxies
    let token = await getToken({ req, secret, secureCookie: true });
    if (!token) {
      token = await getToken({ req, secret, secureCookie: false });
    }

    // If visiting login page:
    if (path.startsWith("/admin/login")) {
      if (token) {
        return addSecurityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
      }
      return addSecurityHeaders(NextResponse.next());
    }

    // Protected admin routes:
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Super admin only routes:
    if (path.startsWith("/admin/mcp") && (token as any)?.role !== "super_admin") {
      return addSecurityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
    }
  }

  const res = NextResponse.next();
  return addSecurityHeaders(res);
}

export const config = {
  matcher: ["/admin/:path*", "/oauth/:path*", "/api/:path*", "/mcp/:path*"]
};
