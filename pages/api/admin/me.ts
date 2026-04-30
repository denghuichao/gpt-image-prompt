import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminEmails, hasAdminConfig, isAdminRequest, resolveUserEmailFromRequest } from "../../../utils/admin";
import { resolveRequestUserId } from "../../../utils/requestAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const auth = await resolveRequestUserId(req);
  const userId = auth.userId;

  const email = await resolveUserEmailFromRequest(req);
  const isAdmin = await isAdminRequest(req);
  console.log("[admin.me] status", {
    host: req.headers.host,
    authVia: auth.via,
    authReason: auth.via === "none" ? auth.reason : undefined,
    userIdPrefix: userId ? userId.slice(0, 8) : null,
    email,
    isAdmin,
    adminConfigured: hasAdminConfig(),
    admins: getAdminEmails(),
  });

  return res.status(200).json({
    userId,
    authVia: auth.via,
    authReason: auth.via === "none" ? auth.reason : undefined,
    email,
    isAdmin,
    adminConfigured: hasAdminConfig(),
    admins: getAdminEmails(),
  });
}
