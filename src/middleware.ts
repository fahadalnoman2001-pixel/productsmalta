import { withAuth } from "next-auth/middleware";

export default withAuth({
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
