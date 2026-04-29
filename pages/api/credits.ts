import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getCredits } from "../../utils/creditsStore";

function resolveUserId(req: NextApiRequest): string {
  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
  if (!hasClerk) return "local-dev-user";
  try {
    const { userId } = getAuth(req);
    return userId ?? "local-dev-user";
  } catch {
    return "local-dev-user";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const userId = resolveUserId(req);
  const credits = getCredits(userId);
  return res.status(200).json({ credits });
}
