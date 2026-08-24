import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export interface LogAdminActionParams {
  adminEmail: string;
  adminName?: string | null;
  adminId?: string | null;
  action: string;
  details?: string | Record<string, any> | null;
  target?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Centrally records an administrative action to the AdminLog table.
 * Fails silently if database logging fails, ensuring main operations are not blocked.
 */
export async function logAdminAction(params: LogAdminActionParams) {
  try {
    let clientIp = params.ip;
    let clientAgent = params.userAgent;

    if (!clientIp || !clientAgent) {
      try {
        const reqHeaders = headers();
        if (!clientIp) {
          clientIp =
            reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            reqHeaders.get("x-real-ip") ||
            "unknown";
        }
        if (!clientAgent) {
          clientAgent = reqHeaders.get("user-agent") || undefined;
        }
      } catch {
        // In case headers() is called outside a request context
      }
    }

    const detailsString =
      typeof params.details === "object" && params.details !== null
        ? JSON.stringify(params.details)
        : params.details || null;

    return await prisma.adminLog.create({
      data: {
        adminId: params.adminId || null,
        adminEmail: params.adminEmail,
        adminName: params.adminName || null,
        action: params.action,
        details: detailsString,
        target: params.target || null,
        ip: clientIp || null,
        userAgent: clientAgent || null
      }
    });
  } catch (error) {
    console.error("[AdminLogger Error]: Failed to create admin log record:", error);
    return null;
  }
}
