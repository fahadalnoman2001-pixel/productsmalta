import { withAuth } from "next-auth/middleware";

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET || "e4b9d0b04e6c433190b25e7eb00c8b6b",
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith("/admin/login")) return true;
      if (path.startsWith("/admin/mcp")) return (token as any)?.role === "super_admin";
      return !!token;
    }
  }
});

export const config = { matcher: ["/admin/:path*"] };
