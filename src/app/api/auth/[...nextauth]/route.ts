import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = "e4b9d0b04e6c433190b25e7eb00c8b6b";
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = "https://youroffers.eu";
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
