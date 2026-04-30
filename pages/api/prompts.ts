import type { NextApiRequest, NextApiResponse } from "next";
import { createHash, randomUUID } from "crypto";
import {
  getPromptTemplates,
  getPromptTemplatesPage,
  upsertPromptTemplate,
  type PromptVariable,
} from "../../utils/promptTemplates";
import { supabaseAdmin, SUPABASE_PROMPT_IMAGES_BUCKET } from "../../utils/supabase";
import { isAdminRequest } from "../../utils/admin";
import { clearPromptPageCache, getPromptPageCache, setPromptPageCache } from "../../utils/promptPageCache";
import { resolveRequestUserId } from "../../utils/requestAuth";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toStorageSafeSegment(input: string) {
  const normalized = String(input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  const hash = createHash("sha1").update(input).digest("hex").slice(0, 8);
  return (normalized ? normalized.slice(0, 48) : "template") + `-${hash}`;
}

type CreatePromptBody = {
  title: string;
  desc: string;
  prompt_template: string;
  tags: string[];
  author: string;
  source_url: string;
  style?: string;
  final_prompt?: string;
  variables?: PromptVariable[];
  imagesBase64?: string[];
  imageUrls?: string[];
};

async function uploadTemplateImage(base64: string, slug: string, idx: number) {
  const trimmed = base64.trim();
  const match = trimmed.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image base64 format");
  const mime = match[1] || "image/png";
  const raw = match[2] || "";
  const ext = mime.includes("jpeg") || mime.includes("jpg")
    ? "jpg"
    : mime.includes("webp")
      ? "webp"
      : "png";
  const safeSlug = toStorageSafeSegment(slug);
  const path = `templates/${safeSlug}/${Date.now()}_${idx}_${randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabaseAdmin
    .storage
    .from(SUPABASE_PROMPT_IMAGES_BUCKET)
    .upload(path, Buffer.from(raw, "base64"), {
      contentType: mime,
      upsert: false,
    });

  if (error) throw new Error(`Upload template image failed: ${error.message}`);

  const { data } = supabaseAdmin
    .storage
    .from(SUPABASE_PROMPT_IMAGES_BUCKET)
    .getPublicUrl(path);

  if (!data?.publicUrl) throw new Error("Failed to resolve uploaded image URL");
  return data.publicUrl;
}

async function uploadTemplateImageFromUrl(url: string, slug: string, idx: number) {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`Invalid image URL: ${trimmed}`);
  }

  const res = await fetch(trimmed);
  if (!res.ok) {
    throw new Error(`Failed to download image URL (${res.status}): ${trimmed}`);
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const bytes = Buffer.from(await res.arrayBuffer());

  const safeSlug = toStorageSafeSegment(slug);
  const path = `templates/${safeSlug}/${Date.now()}_url_${idx}_${randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabaseAdmin
    .storage
    .from(SUPABASE_PROMPT_IMAGES_BUCKET)
    .upload(path, bytes, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload remote image failed: ${error.message}`);

  const { data } = supabaseAdmin
    .storage
    .from(SUPABASE_PROMPT_IMAGES_BUCKET)
    .getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Failed to resolve remote image URL");
  return data.publicUrl;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const cursorRaw = req.query.cursor;
      const limitRaw = req.query.limit;
      const qRaw = req.query.q;
      const cursor = typeof cursorRaw === "string" ? Number(cursorRaw) : 0;
      const limit = typeof limitRaw === "string" ? Number(limitRaw) : 24;
      const q = typeof qRaw === "string" ? qRaw : "";
      const cacheKey = JSON.stringify({ cursor, limit, q: q.trim().toLowerCase() });
      const cached = getPromptPageCache(cacheKey);
      if (cached) {
        res.setHeader("X-Prompts-Cache", "HIT");
        res.setHeader("Cache-Control", "public, max-age=15, s-maxage=30, stale-while-revalidate=60");
        return res.status(200).json(cached);
      }

      const page = await getPromptTemplatesPage({ cursor, limit, q });
      setPromptPageCache(cacheKey, page);
      res.setHeader("X-Prompts-Cache", "MISS");
      res.setHeader("Cache-Control", "public, max-age=15, s-maxage=30, stale-while-revalidate=60");
      return res.status(200).json(page);
    } catch (err) {
      return res.status(500).json({ error: err instanceof Error ? err.message : "Failed to load templates" });
    }
  }

  if (req.method === "POST") {
    const auth = await resolveRequestUserId(req);
    if (!auth.userId) return res.status(401).json({ error: "Unauthorized" });
    const isAdmin = await isAdminRequest(req);
    if (!isAdmin) return res.status(403).json({ error: "Forbidden: admin only" });

    try {
      const body = req.body as CreatePromptBody;
      if (!body.title?.trim()) return res.status(400).json({ error: "title is required" });
      if (!body.desc?.trim()) return res.status(400).json({ error: "desc is required" });
      if (!body.prompt_template?.trim()) return res.status(400).json({ error: "prompt_template is required" });
      if (!Array.isArray(body.tags)) return res.status(400).json({ error: "tags must be array" });
      if (!body.author?.trim()) return res.status(400).json({ error: "author is required" });
      if (!body.source_url?.trim()) return res.status(400).json({ error: "source_url is required" });

      const slug = slugify(body.title) || `template-${Date.now()}`;
      const imageInputs = Array.isArray(body.imagesBase64) ? body.imagesBase64.filter(Boolean) : [];
      const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.map((s) => s.trim()).filter(Boolean) : [];

      const images: string[] = [];
      for (let i = 0; i < imageInputs.length; i += 1) {
        const url = await uploadTemplateImage(imageInputs[i], slug, i);
        images.push(url);
      }
      for (let i = 0; i < imageUrls.length; i += 1) {
        const url = await uploadTemplateImageFromUrl(imageUrls[i], slug, i);
        images.push(url);
      }

      if (images.length === 0) {
        return res.status(400).json({ error: "At least one image is required" });
      }

      await upsertPromptTemplate({
        slug,
        title: body.title.trim(),
        desc: body.desc.trim(),
        prompt_template: body.prompt_template.trim(),
        images,
        tags: body.tags,
        author: body.author.trim(),
        source_url: body.source_url.trim(),
        style: body.style?.trim() || undefined,
        final_prompt: body.final_prompt?.trim() || undefined,
        variables: Array.isArray(body.variables) ? body.variables : [],
        default_model: "gpt-image-2",
      });
      clearPromptPageCache();

      return res.status(200).json({ ok: true, slug });
    } catch (err) {
      return res.status(500).json({ error: err instanceof Error ? err.message : "Failed to create template" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
