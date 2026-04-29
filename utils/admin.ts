import type { NextApiRequest } from "next";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

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

  let userId: string | null = null;
  try {
    const auth = getAuth(req);
    userId = auth.userId ?? null;
  } catch {
    return null;
  }
  if (!userId) return null;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryId = user.primaryEmailAddressId;
    const primary = user.emailAddresses.find((e) => e.id === primaryId) || user.emailAddresses[0];
    return primary?.emailAddress?.toLowerCase() || null;
  } catch {
    return null;
  }
}

export async function isAdminRequest(req: NextApiRequest): Promise<boolean> {
  // If no admin list configured, allow by default for local bootstrap.
  const admins = parseAdminEmails();
  if (admins.length === 0) return true;

  const email = await resolveUserEmailFromRequest(req);
  if (!email) return false;
  return admins.includes(email.toLowerCase());
}
