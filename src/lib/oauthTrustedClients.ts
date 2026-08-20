import { prisma } from "./db";

/**
 * Validates whether a redirect URI belongs to Claude / Anthropic or local dev.
 */
export function isTrustedRedirect(redirectUri: string): boolean {
  if (!redirectUri) return false;
  try {
    const u = new URL(redirectUri);
    const host = u.hostname.toLowerCase();
    return (
      host === "claude.ai" ||
      host.endsWith(".claude.ai") ||
      host === "claude.com" ||
      host.endsWith(".claude.com") ||
      host === "anthropic.com" ||
      host.endsWith(".anthropic.com") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

/**
 * Resolves a client by clientId and checks redirectUri.
 * If the client was not registered via DCR but presents a trusted Claude redirect URI,
 * auto-registers the client in the database so the authorization flow seamlessly proceeds.
 */
export async function resolveOrAutoRegisterClient(clientId: string, redirectUri: string) {
  if (!clientId) return null;

  const existing = await prisma.oAuthClient.findUnique({ where: { clientId } });
  if (existing) {
    let allowed: string[] = [];
    try {
      allowed = JSON.parse(existing.redirectUris || "[]");
    } catch {
      allowed = [];
    }
    if (!Array.isArray(allowed)) allowed = [];

    if (redirectUri && !allowed.includes(redirectUri)) {
      if (isTrustedRedirect(redirectUri)) {
        allowed.push(redirectUri);
        return await prisma.oAuthClient.update({
          where: { clientId },
          data: { redirectUris: JSON.stringify(allowed) }
        });
      }
      return null;
    }
    return existing;
  }

  // Not in DB — if redirect_uri is a trusted Claude callback, auto-register the client
  if (redirectUri && isTrustedRedirect(redirectUri)) {
    return await prisma.oAuthClient.create({
      data: {
        clientId,
        clientName: "Claude",
        redirectUris: JSON.stringify([redirectUri])
      }
    });
  }

  return null;
}
