import crypto from "crypto";

interface MCPSession {
  id: string;
  token: string;
  controller?: ReadableStreamDefaultController;
  createdAt: number;
  lastActive: number;
}

const globalForMCP = global as unknown as { mcpSessions: Map<string, MCPSession> };
export const sessions = globalForMCP.mcpSessions || new Map<string, MCPSession>();
if (process.env.NODE_ENV !== "production") globalForMCP.mcpSessions = sessions;

export function createSession(token: string): MCPSession {
  const id = crypto.randomBytes(16).toString("hex");
  const session: MCPSession = {
    id,
    token,
    createdAt: Date.now(),
    lastActive: Date.now()
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): MCPSession | undefined {
  return sessions.get(id);
}

export function removeSession(id: string) {
  sessions.delete(id);
}

export function sendSSEMessage(session: MCPSession, data: any) {
  if (session.controller) {
    try {
      const payload = typeof data === "string" ? data : JSON.stringify(data);
      session.controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${payload}\n\n`));
      session.lastActive = Date.now();
    } catch (e) {
      // Stream may have closed
    }
  }
}
