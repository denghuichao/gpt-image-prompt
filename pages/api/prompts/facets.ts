import type { NextApiRequest, NextApiResponse } from "next";
import { getPromptTemplateFacets } from "../../../utils/promptTemplates";

type FacetsCache = {
  expiresAt: number;
  payload: { styles: string[]; tags: string[] };
} | null;

let facetsCache: FacetsCache = null;
const TTL_MS = 2 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const now = Date.now();
    if (facetsCache && facetsCache.expiresAt > now) {
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
      return res.status(200).json(facetsCache.payload);
    }

    const payload = await getPromptTemplateFacets();
    facetsCache = { expiresAt: now + TTL_MS, payload };
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120, stale-while-revalidate=300");
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to load prompt facets",
    });
  }
}
