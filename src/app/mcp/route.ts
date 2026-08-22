import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { tools, dispatch } from "@/lib/mcpTools";

export const dynamic = "force-dynamic";

// MCP Protocol Version this server supports
const PROTOCOL_VERSION = "2025-03-26";
const SERVER_INFO = { name: "youroffers-mcp", version: "1.0.0" };
const ISSUER = process.env.NEXTAUTH_URL || "https://youroffers.eu";

// --- Auth helper ---
async function authenticate(req: NextRequest): Promise<{ ok: true; tokenRow: any } | { ok: false; response: NextResponse }> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: new NextResponse(JSON.stringify({ error: "missing bearer token" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": `Bearer resource_metadata="${ISSUER}/.well-known/oauth-protected-resource"`
        }
      })
    };
  }

  const row = await prisma.mCPToken.findUnique({ where: { token } });
  if (!row || !row.isActive) {
    return {
      ok: false,
      response: NextResponse.json({ error: "invalid token" }, { status: 403 })
    };
  }

  // Update last-used timestamp (fire-and-forget)
  prisma.mCPToken.update({ where: { id: row.id }, data: { lastUsed: new Date() } }).catch(() => {});

  return { ok: true, tokenRow: row };
}

// --- JSON-RPC helpers ---
function jsonrpcResult(id: string | number | null, result: any) {
  return { jsonrpc: "2.0" as const, id, result };
}

function jsonrpcError(id: string | number | null, code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

// --- Handle a single JSON-RPC request ---
async function handleRequest(body: any): Promise<any> {
  const { id, method, params } = body;

  switch (method) {
    case "initialize":
      return jsonrpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO
      });

    case "notifications/initialized":
      // Notification — no response needed, return null to signal 202
      return null;

    case "ping":
      return jsonrpcResult(id, {});

    case "tools/list":
      return jsonrpcResult(id, { tools });

    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await dispatch(prisma, toolName, toolArgs);
        return jsonrpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        });
      } catch (err: any) {
        return jsonrpcResult(id, {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true
        });
      }
    }

    default:
      return jsonrpcError(id, -32601, `Method not found: ${method}`);
  }
}

// --- POST: Streamable HTTP — receive JSON-RPC messages ---
export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      jsonrpcError(null, -32700, "Parse error"),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Handle batch requests (array of JSON-RPC messages)
  if (Array.isArray(body)) {
    const results = await Promise.all(body.map(handleRequest));
    const responses = results.filter((r) => r !== null);
    if (responses.length === 0) {
      return new NextResponse(null, { status: 202 });
    }
    return NextResponse.json(responses, {
      headers: { "Content-Type": "application/json" }
    });
  }

  // Single request
  const result = await handleRequest(body);

  // Notifications get 202 with no body
  if (result === null) {
    return new NextResponse(null, { status: 202 });
  }

  return NextResponse.json(result, {
    headers: { "Content-Type": "application/json" }
  });
}

// --- GET: SSE stream for server-initiated messages (optional, backwards compat) ---
// Some clients may open a GET to receive server-sent events. We support this
// by returning a keep-alive SSE stream. For Streamable HTTP the primary
// communication happens via POST, so this is mainly for compatibility.
export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth.ok) return auth.response;

  const stream = new ReadableStream({
    start(controller) {
      // Send an initial comment to establish the connection
      controller.enqueue(new TextEncoder().encode(": connected\n\n"));

      // Keep-alive every 20 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 20_000);

      // Clean up on abort
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        try { controller.close(); } catch {}
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

// --- DELETE: Session termination (optional, per spec) ---
export async function DELETE(req: NextRequest) {
  const auth = await authenticate(req);
  if (!auth.ok) return auth.response;

  return new NextResponse(null, { status: 200 });
}
