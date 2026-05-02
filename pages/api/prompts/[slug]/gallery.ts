import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "../../../../utils/supabase";
import { getPromptTemplateBySlug } from "../../../../utils/promptTemplates";
import type { StoredChatMessage } from "../../../../utils/conversationStore";

type GalleryItem = {
  id: string;
  url: string;
  source: "sample" | "generated";
  createdAt: string;
};

type GalleryResponse = {
  items: GalleryItem[];
  nextCursor: number | null;
  hasMore: boolean;
  error?: string;
};

type ConversationRow = {
  user_id: string;
  messages: StoredChatMessage[] | null;
  updated_at: string;
};

function parseLimit(input: string | string[] | undefined) {
  const raw = Array.isArray(input) ? input[0] : input;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 36;
  return Math.min(100, Math.max(1, Math.floor(n)));
}

function parseCursor(input: string | string[] | undefined) {
  const raw = Array.isArray(input) ? input[0] : input;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function resolveIsPrivate(message: StoredChatMessage) {
  if (typeof message.is_private === "boolean") return message.is_private;
  if (typeof message.is_public === "boolean") return !message.is_public;
  return false;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<GalleryResponse>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      items: [],
      nextCursor: null,
      hasMore: false,
      error: "Method not allowed",
    });
  }

  try {
    const slug = String(req.query.slug || "").trim();
    if (!slug) {
      return res.status(400).json({ items: [], nextCursor: null, hasMore: false, error: "slug is required" });
    }

    const cursor = parseCursor(req.query.cursor);
    const limit = parseLimit(req.query.limit);

    const template = await getPromptTemplateBySlug(slug);
    if (!template) {
      return res.status(404).json({ items: [], nextCursor: null, hasMore: false, error: "template not found" });
    }

    const merged: GalleryItem[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < template.images.length; i += 1) {
      const url = String(template.images[i] || "").trim();
      if (!url || seen.has(url)) continue;
      seen.add(url);
      merged.push({
        id: `sample-${slug}-${i}`,
        url,
        source: "sample",
        createdAt: new Date(0).toISOString(),
      });
    }

    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("user_id,messages,updated_at")
      .eq("template_key", slug)
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    const rows = (data || []) as ConversationRow[];
    for (const row of rows) {
      const messages = Array.isArray(row.messages) ? row.messages : [];
      for (const msg of messages) {
        if (!msg || msg.role !== "assistant" || resolveIsPrivate(msg)) continue;
        const images = Array.isArray(msg.images) ? msg.images : [];
        for (let idx = 0; idx < images.length; idx += 1) {
          const url = String(images[idx] || "").trim();
          if (!url || seen.has(url)) continue;
          seen.add(url);
          merged.push({
            id: `${row.user_id}-${msg.id}-${idx}`,
            url,
            source: "generated",
            createdAt: row.updated_at || new Date(0).toISOString(),
          });
        }
      }
    }

    const sorted = merged.sort((a, b) => {
      if (a.source !== b.source) return a.source === "sample" ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });

    const page = sorted.slice(cursor, cursor + limit);
    const hasMore = cursor + limit < sorted.length;

    res.setHeader("Cache-Control", "public, max-age=15, s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json({
      items: page,
      nextCursor: hasMore ? cursor + limit : null,
      hasMore,
    });
  } catch (err) {
    return res.status(500).json({
      items: [],
      nextCursor: null,
      hasMore: false,
      error: err instanceof Error ? err.message : "Failed to load gallery",
    });
  }
}
