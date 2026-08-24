import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "e4b9d0b04e6c433190b25e7eb00c8b6b";
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://youroffers.eu";
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "e4b9d0b04e6c433190b25e7eb00c8b6b",
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const cleanEmail = creds.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (!user) {
          try {
            await prisma.adminLog.create({
              data: {
                adminEmail: cleanEmail,
                action: "LOGIN_FAILED",
                details: "User email not found",
                target: "Admin Portal"
              }
            });
          } catch {}
          return null;
        }
        const ok = await bcrypt.compare(creds.password, user.password);
        if (!ok) {
          try {
            await prisma.adminLog.create({
              data: {
                adminId: user.id,
                adminEmail: user.email,
                adminName: user.name,
                action: "LOGIN_FAILED",
                details: "Invalid password provided",
                target: "Admin Portal"
              }
            });
          } catch {}
          return null;
        }

        try {
          await prisma.adminLog.create({
            data: {
              adminId: user.id,
              adminEmail: user.email,
              adminName: user.name,
              action: "LOGIN_SUCCESS",
              details: `Logged in with role: ${user.role}`,
              target: "Admin Portal"
            }
          });
        } catch {}

        return { id: user.id, email: user.email, name: user.name ?? "", role: user.role } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) (token as any).role = (user as any).role; return token; },
    async session({ session, token }) { (session.user as any).role = (token as any).role; return session; }
  }
};

