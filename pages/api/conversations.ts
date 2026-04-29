import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { getConversation, upsertConversation, type StoredChatMessage } from "../../utils/conversationStore";

function normalizeTemplateKey(input: unknown): string {
  if (typeof input !== "string") {
    return "default";
  }
  const key = input.trim();
  return key || "default";
}

function resolveUserId(req: NextApiRequest): string | null {
  const hasClerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  if (!hasClerkConfigured) {
    return "local-dev-user";
  }

  const { userId } = getAuth(req);
  return userId || null;
}

function isValidMessageArray(value: unknown): value is StoredChatMessage[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }
    const candidate = item as StoredChatMessage;
    return (
      typeof candidate.id === "string" &&
      (candidate.role === "system" || candidate.role === "user" || candidate.role === "assistant") &&
      typeof candidate.content === "string"
    );
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const templateKey = normalizeTemplateKey(req.query.templateKey);
    const conversation = getConversation(userId, templateKey);

    if (!conversation) {
      return res.status(404).json({ conversation: null });
    }

    return res.status(200).json({ conversation });
  }

  if (req.method === "POST") {
    const templateKey = normalizeTemplateKey(req.body?.templateKey);
    const messages = req.body?.messages;

    if (!isValidMessageArray(messages)) {
      return res.status(400).json({ error: "Invalid messages payload" });
    }

    const conversation = upsertConversation(userId, templateKey, messages);
    return res.status(200).json({ conversation });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
