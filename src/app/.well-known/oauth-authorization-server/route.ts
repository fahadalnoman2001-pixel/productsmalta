import { NextResponse } from "next/server";

// RFC 8414 authorization server metadata. claude.ai's remote MCP connector fetches this
// (at the origin root, i.e. https://youroffers.eu/.well-known/oauth-authorization-server)
// to discover where to register a client and send users to authorize.
export async function GET() {
  const issuer = process.env.NEXTAUTH_URL || "https://youroffers.eu";
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/api/oauth/token`,
    registration_endpoint: `${issuer}/api/oauth/register`,
    revocation_endpoint: `${issuer}/api/oauth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
    scopes_supported: ["mcp"]
  });
}
