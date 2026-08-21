import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tools, dispatch } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

// Legacy message endpoint — kept for backwards compatibility with any
// existing integrations that still use the old SSE transport's separate
// /mcp/message path. New clients should POST directly to /mcp instead.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json(
      { error: "missing bearer token" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer resource_metadata="https://youroffers.eu/.well-known/oauth-protected-resource"'
        }
      }
    );
  }

  const row = await prisma.mCPToken.findUnique({ where: { token } });
  if (!row || !row.isActive) {
    return NextResponse.json({ error: "invalid token" }, { status: 403 });
  }

  await prisma.mCPToken.update({ where: { id: row.id }, data: { lastUsed: new Date() } });

  const body = await req.json().catch(() => ({}));
  const { id, method, params } = body;

  let response: any = null;

  try {
    if (method === "initialize") {
      response = {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "productsinmalta", version: "1.0.0" }
        }
      };
    } else if (method === "notifications/initialized") {
      return new NextResponse(null, { status: 202 });
    } else if (method === "ping") {
      response = { jsonrpc: "2.0", id, result: {} };
    } else if (method === "tools/list") {
      response = { jsonrpc: "2.0", id, result: { tools } };
    } else if (method === "tools/call") {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await dispatch(prisma, toolName, toolArgs);
        response = {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
          }
        };
      } catch (err: any) {
        response = {
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: `Error: ${err.message}` }],
            isError: true
          }
        };
      }
    } else {
      response = {
        jsonrpc: "2.0",
        id,
        error: { code: -32601, message: `Method not found: ${method}` }
      };
    }
  } catch (err: any) {
    response = {
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: err.message }
    };
  }

  return NextResponse.json(response || { ok: true });
}
