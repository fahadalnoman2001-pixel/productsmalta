// Standalone MCP server for Products in Malta admin panel.
// Persistent HTTP+SSE endpoint at /mcp, token-authenticated, no expiry.

import express from "express";
import { PrismaClient } from "@prisma/client";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { tools, dispatch } from "./tools.js";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.MCP_SHARED_DB_URL || process.env.DATABASE_URL || "file:../dev.db" } }
});
const PORT = parseInt(process.env.MCP_SERVER_PORT || "4000");

const app = express();
app.use(express.json({ limit: "10mb" }));

// --- Auth middleware ---
async function requireToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing bearer token" });
  const row = await prisma.mCPToken.findUnique({ where: { token } });
  if (!row || !row.isActive) return res.status(403).json({ error: "invalid token" });
  await prisma.mCPToken.update({ where: { id: row.id }, data: { lastUsed: new Date() } });
  req.mcpToken = row;
  next();
}

// --- Health check (no auth) ---
app.get("/health", (_req, res) => res.json({ ok: true, service: "productsinmalta-mcp", tools: tools.length }));

// --- Simple JSON-RPC-style tool call endpoint (optional, easier debug) ---
app.post("/tools/:name", requireToken, async (req, res) => {
  try {
    const result = await dispatch(prisma, req.params.name, req.body || {});
    res.json({ ok: true, result });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});
app.get("/tools", requireToken, (_req, res) => res.json({ tools }));

// --- MCP SSE endpoint (persistent, no timeout) ---
const sseTransports = new Map();

app.get("/mcp", requireToken, async (req, res) => {
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

  const transport = new SSEServerTransport("/mcp/message", res);
  sseTransports.set(transport.sessionId, transport);
  res.on("close", () => sseTransports.delete(transport.sessionId));
  await server.connect(transport);
});

app.post("/mcp/message", requireToken, async (req, res) => {
  const sid = req.query.sessionId;
  const transport = sseTransports.get(sid);
  if (!transport) return res.status(404).json({ error: "no such session" });
  await transport.handlePostMessage(req, res);
});

app.listen(PORT, () => {
  console.log(`[MCP] listening on http://localhost:${PORT}`);
  console.log(`[MCP] SSE endpoint: /mcp   |   REST endpoint: /tools/:name   |   health: /health`);
  console.log(`[MCP] ${tools.length} tools registered`);
});
