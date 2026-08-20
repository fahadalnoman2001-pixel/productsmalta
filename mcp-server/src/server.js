// Standalone MCP server for Products in Malta admin panel.
// Persistent HTTP+SSE endpoint at /mcp, token-authenticated, no expiry.
//
// Deployment note: this app can be reached two different ways depending on
// how it's exposed on Hostinger, and this file supports BOTH without any
// config change:
//   1. Hostinger Node.js "Application URL" set to a subpath (e.g. /mcp) on
//      the main domain — Passenger strips that prefix before the request
//      reaches this process, so it arrives here as "/", "/message", etc.
//   2. A plain reverse-proxy / rewrite rule that forwards the full path
//      through unchanged — the request arrives here still carrying "/mcp".
// Every route below is registered at both the bare path and the prefixed
// path so either setup works. Set MCP_PUBLIC_PATH if the public prefix is
// ever something other than "/mcp" (defaults to "/mcp").

import express from "express";
import { PrismaClient } from "@prisma/client";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { tools, dispatch } from "./tools.js";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.MCP_SHARED_DB_URL || process.env.DATABASE_URL || "file:../dev.db" } }
});

// Passenger assigns the listen port via process.env.PORT when it manages
// this app (subpath or subdomain setup). Fall back to MCP_SERVER_PORT for
// running it standalone (e.g. local dev, or a manually-managed process).
const PORT = parseInt(process.env.PORT || process.env.MCP_SERVER_PORT || "4000");

// The full public path clients (Claude, etc.) actually request, e.g.
// "https://youroffers.eu/mcp". Used only to build the message-endpoint URL
// handed back to clients in the SSE handshake — must always be the real
// public path regardless of how this process receives the request internally.
const PUBLIC_BASE = (process.env.MCP_PUBLIC_PATH || "/mcp").replace(/\/+$/, "") || "/mcp";

// Origin of the main app, which hosts the OAuth authorization server (see
// src/app/oauth/authorize, src/app/api/oauth/*, and src/app/.well-known/*
// in the Next.js app). Used only to point unauthenticated clients at the
// protected-resource metadata document per RFC 9728.
const ISSUER = (process.env.MCP_ISSUER_URL || "https://youroffers.eu").replace(/\/+$/, "");

// Keep-alive heartbeat interval for the SSE stream (ms). Some reverse
// proxies / load balancers close "idle" HTTP connections (commonly ~60s)
// even though this app's own timeouts are disabled — a periodic comment
// line keeps bytes flowing so nothing in front of us decides to drop it.
const HEARTBEAT_MS = 20_000;

const app = express();
app.use(express.json({ limit: "10mb" }));

// Register a handler at both the bare path and the PUBLIC_BASE-prefixed
// path, so it works whether or not the proxy in front strips the prefix.
function mount(method, pathSuffix, ...handlers) {
  const bare = pathSuffix === "" ? "/" : pathSuffix;
  app[method](bare, ...handlers);
  const prefixed = pathSuffix === "" ? PUBLIC_BASE : `${PUBLIC_BASE}${pathSuffix}`;
  if (prefixed !== bare) app[method](prefixed, ...handlers);
}

// --- Auth middleware ---
async function requireToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    // Point unauthenticated clients (e.g. claude.ai's OAuth discovery) at the
    // resource metadata document so they find the real authorize/token
    // endpoints instead of guessing "/authorize" at the domain root.
    res.setHeader(
      "WWW-Authenticate",
      `Bearer resource_metadata="${ISSUER}/.well-known/oauth-protected-resource"`
    );
    return res.status(401).json({ error: "missing bearer token" });
  }
  const row = await prisma.mCPToken.findUnique({ where: { token } });
  if (!row || !row.isActive) return res.status(403).json({ error: "invalid token" });
  await prisma.mCPToken.update({ where: { id: row.id }, data: { lastUsed: new Date() } });
  req.mcpToken = row;
  next();
}

// --- Health check (no auth) ---
mount("get", "/health", (_req, res) => res.json({ ok: true, service: "productsinmalta-mcp", tools: tools.length }));

// --- Simple JSON-RPC-style tool call endpoint (optional, easier debug) ---
mount("post", "/tools/:name", requireToken, async (req, res) => {
  try {
    const result = await dispatch(prisma, req.params.name, req.body || {});
    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});
mount("get", "/tools", requireToken, (_req, res) => res.json({ tools }));

// --- MCP SSE endpoint (persistent, no timeout) ---
const sseTransports = new Map();

mount("get", "", requireToken, async (req, res) => {
  // Persistent connection — disable timeout so it truly never expires
  req.setTimeout(0);
  res.setTimeout(0);
  res.setHeader("Connection", "keep-alive");

  const server = new Server(
    { name: "productsinmalta", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    try {
      const result = await dispatch(prisma, name, args || {});
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
    }
  });

  // Message endpoint URL handed to the client MUST be the real public path.
  const transport = new SSEServerTransport(`${PUBLIC_BASE}/message`, res);
  sseTransports.set(transport.sessionId, transport);

  const heartbeat = setInterval(() => {
    try { res.write(": keep-alive\n\n"); } catch { clearInterval(heartbeat); }
  }, HEARTBEAT_MS);

  res.on("close", () => {
    clearInterval(heartbeat);
    sseTransports.delete(transport.sessionId);
  });

  await server.connect(transport);
});

mount("post", "/message", requireToken, async (req, res) => {
  const sid = req.query.sessionId;
  const transport = sseTransports.get(sid);
  if (!transport) return res.status(404).json({ error: "no such session" });
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`[MCP] listening on http://localhost:${PORT} (public path: ${PUBLIC_BASE})`);
  console.log(`[MCP] SSE endpoint: ${PUBLIC_BASE}   |   REST endpoint: ${PUBLIC_BASE}/tools/:name   |   health: ${PUBLIC_BASE}/health`);
  console.log(`[MCP] ${tools.length} tools registered, heartbeat every ${HEARTBEAT_MS / 1000}s`);
});
