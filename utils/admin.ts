import type { NextApiRequest } from "next";
import { clerkClient } from "@clerk/nextjs/server";
import { resolveRequestUserId } from "./requestAuth";

function parseAdminEmails(): string[] {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails() {
  return parseAdminEmails();
}

export function hasAdminConfig() {
  return parseAdminEmails().length > 0;
}

export async function resolveUserEmailFromRequest(req: NextApiRequest): Promise<string | null> {
  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );
  if (!hasClerk) return "local-dev-user@example.com";

  const auth = await resolveRequestUserId(req);
  const userId = auth.userId;
  if (!userId) {
    console.error("[admin.resolveEmail] no user id from auth", {
      authVia: auth.via,
      authReason: auth.via === "none" ? auth.reason : undefined,
      host: req.headers.host,
    });
    return null;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((e) => e.id === primaryId) || user.emailAddresses[0];
    const email = primary?.emailAddress?.toLowerCase() || null;
    console.log("[admin.resolveEmail] resolved", {
      userIdPrefix: userId.slice(0, 8),
      email,
      host: req.headers.host,
    });
    return email;
  } catch {
    console.error("[admin.resolveEmail] clerk lookup failed", {
      userIdPrefix: userId.slice(0, 8),
      host: req.headers.host,
    });
    return null;
  }
}

export async function isAdminRequest(req: NextApiRequest): Promise<boolean> {
  // If no admin list configured, allow by default for local bootstrap.
  const admins = parseAdminEmails();
  if (admins.length === 0) return true;

  const email = await resolveUserEmailFromRequest(req);
  if (!email) {
    console.log("[admin.check] deny: email missing", { host: req.headers.host, admins });
    return false;
  }
  const ok = admins.includes(email.toLowerCase());
  console.log("[admin.check] result", { email, ok, host: req.headers.host });
  return ok;
}
