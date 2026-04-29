import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getAdminEmails, hasAdminConfig, isAdminRequest, resolveUserEmailFromRequest } from "../../../utils/admin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
  );

  let userId: string | null = null;
  if (hasClerk) {
    try {
      userId = getAuth(req).userId ?? null;
    } catch {
      userId = null;
    }
  } else {
    userId = "local-dev-user";
  }

  const email = await resolveUserEmailFromRequest(req);
  const isAdmin = await isAdminRequest(req);

  return res.status(200).json({
    userId,
    email,
    isAdmin,
    adminConfigured: hasAdminConfig(),
    admins: getAdminEmails(),
  });
}
