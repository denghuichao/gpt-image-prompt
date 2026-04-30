import type { NextApiRequest } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { verifyToken } from "@clerk/backend";

export type RequestAuthResolution =
  | { userId: string; via: "local-dev" | "cookie" | "bearer" | "session-cookie" }
  | { userId: null; via: "none"; reason: string };

function hasClerkConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

function getBearerToken(req: NextApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

function getSessionTokenFromCookie(req: NextApiRequest): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  const parts = raw.split(";");
  for (const part of parts) {
    const [nameRaw, ...valueParts] = part.trim().split("=");
    const name = nameRaw?.trim();
    if (name !== "__session") continue;
    const value = valueParts.join("=");
    if (!value) return null;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

function getSubFromVerifiedToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  if (!("sub" in data)) return null;
  const sub = (data as { sub?: unknown }).sub;
  return typeof sub === "string" && sub.length > 0 ? sub : null;
}

async function verifyAndExtractSub(token: string): Promise<string | null> {
  try {
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return getSubFromVerifiedToken(verified.data);
  } catch {
    return null;
  }
}

export async function resolveRequestUserId(
  req: NextApiRequest,
): Promise<RequestAuthResolution> {
  const host = String(req.headers.host || "");
  const origin = String(req.headers.origin || "");
  const referer = String(req.headers.referer || "");
  const hasAuthHeader = Boolean(req.headers.authorization);
  const hasCookieHeader = Boolean(req.headers.cookie);

  if (!hasClerkConfig()) {
    console.log("[auth.resolve] local-dev fallback", { host, origin, referer });
    return { userId: "local-dev-user", via: "local-dev" };
  }

  try {
    const { userId } = getAuth(req);
    if (userId) {
      console.log("[auth.resolve] success via cookie/getAuth", {
        host,
        origin,
        referer,
        userIdPrefix: userId.slice(0, 8),
      });
      return { userId, via: "cookie" };
    }
  } catch {
    // continue with token fallbacks
  }

  const bearer = getBearerToken(req);
  if (bearer) {
    const sub = await verifyAndExtractSub(bearer);
    if (sub) {
      console.log("[auth.resolve] success via bearer", {
        host,
        origin,
        referer,
        userIdPrefix: sub.slice(0, 8),
      });
      return { userId: sub, via: "bearer" };
    }
  }

  const sessionToken = getSessionTokenFromCookie(req);
  if (sessionToken) {
    const sub = await verifyAndExtractSub(sessionToken);
    if (sub) {
      console.log("[auth.resolve] success via __session cookie token", {
        host,
        origin,
        referer,
        userIdPrefix: sub.slice(0, 8),
      });
      return { userId: sub, via: "session-cookie" };
    }
  }

  console.error("[auth.resolve] failed", {
    host,
    origin,
    referer,
    hasAuthorizationHeader: hasAuthHeader,
    hasCookieHeader,
    hasBearerToken: Boolean(bearer),
    hasSessionCookieToken: Boolean(sessionToken),
    nodeEnv: process.env.NODE_ENV,
  });
  return { userId: null, via: "none", reason: "no_valid_auth_context" };
}
