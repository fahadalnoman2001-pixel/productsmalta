import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import MCPPanel from "@/components/admin/MCPPanel";

export default async function AdminMCP() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "super_admin") redirect("/admin");
  const tokens = await prisma.mCPToken.findMany({ orderBy: { createdAt: "desc" } });
  const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || `${process.env.NEXTAUTH_URL || "https://youroffers.eu"}/mcp`;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">MCP Server</h1>
      <p className="text-slate-600 mb-6">The MCP server exposes the admin panel to Claude / other MCP clients. Tokens never expire and grant full write access — only super admins can view this page.</p>
      <MCPPanel tokens={tokens} mcpUrl={mcpUrl} />
    </div>
  );
}
