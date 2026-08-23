import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREFIXED_LOCALES = ["de", "fr", "es"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPrivatePath =
    path.startsWith("/admin") ||
    path.startsWith("/oauth") ||
    path.startsWith("/api") ||
    path.startsWith("/mcp") ||
    path.startsWith("/.well-known");

  // Helper: add security headers to admin/private routes
  const addSecurityHeaders = (res: NextResponse) => {
    if (isPrivatePath) {
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    }
    return res;
  };

  // 1. NextAuth protection for /admin routes
  if (path.startsWith("/admin")) {
    const secret = process.env.NEXTAUTH_SECRET || "e4b9d0b04e6c433190b25e7eb00c8b6b";

    let token = await getToken({ req, secret, secureCookie: true });
    if (!token) {
      token = await getToken({ req, secret, secureCookie: false });
    }

    if (path.startsWith("/admin/login")) {
      if (token) {
        return addSecurityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
      }
      return addSecurityHeaders(NextResponse.next());
    }

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", path);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (path.startsWith("/admin/mcp") && (token as any)?.role !== "super_admin") {
      return addSecurityHeaders(NextResponse.redirect(new URL("/admin", req.url)));
    }
  }

  // If private path (admin, oauth, api, mcp, .well-known), proceed directly
  if (isPrivatePath) {
    const res = NextResponse.next();
    return addSecurityHeaders(res);
  }

  // 2. Multi-language (i18n) handling for public site routes:

  // Rule A: If visiting /en or /en/*, redirect to root canonical path (308 Permanent)
  if (path === "/en" || path.startsWith("/en/")) {
    const targetPath = path === "/en" ? "/" : path.slice(3);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = targetPath || "/";
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Rule B: If visiting a prefixed locale route (/de, /fr, /es)
  for (const loc of PREFIXED_LOCALES) {
    if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-locale", loc);
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
    }
  }

  // Rule C: English default route at root (e.g. /, /products, /blog, /about, etc.)
  // Internally rewrite to /en/... so Next.js matches [locale] route group, keeping clean URL in browser
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", "en");

  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = `/en${path === "/" ? "" : path}`;

  return NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png, icon.png, apple-icon.png, logo.png
     * - robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|icon.png|apple-icon.png|logo.png|robots.txt|sitemap.xml).*)"
  ]
};
