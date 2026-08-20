import { NextResponse } from "next/server";

// RFC 9728 protected resource metadata. The mcp-server's 401 response points here
// (via WWW-Authenticate: Bearer resource_metadata="...") so clients know which
// authorization server issues tokens for the /mcp resource.
export async function GET() {
  const issuer = process.env.NEXTAUTH_URL || "https://youroffers.eu";
  const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || `${issuer}/mcp`;
  return NextResponse.json({
    resource: mcpUrl,
    authorization_servers: [issuer]
  });
}
