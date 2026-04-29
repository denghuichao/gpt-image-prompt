import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { isAdminRequest } from "../../../utils/admin";
import { clearPromptPageCache } from "../../../utils/promptPageCache";
import { upsertPromptTemplate, type PromptTemplate, type PromptVariable } from "../../../utils/promptTemplates";
import { supabaseAdmin, SUPABASE_PROMPT_IMAGES_BUCKET } from "../../../utils/supabase";

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
};

type ImportTemplateItem = {
  slug?: string;
  title: string;
  desc: string;
  prompt_template: string;
  images?: string[];
  image_urls?: string[];
  tags: string[];
  author: string;
  source_url: string;
  style?: string;
  final_prompt?: string;
  variables?: PromptVariable[];
};

type ImportBody = {
  templates?: ImportTemplateItem[];
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadBinary(bytes: Buffer, contentType: string, slug: string, label: string, idx: number) {
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
        ? "gif"
        : "jpg";

  const storagePath = `templates/${slug}/${Date.now()}_${label}_${idx}_${randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabaseAdmin
    .storage
    .from(SUPABASE_PROMPT_IMAGES_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload image failed: ${error.message}`);

  const { data } = supabaseAdmin
    .storage
    .from(SUPABASE_PROMPT_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  if (!data?.publicUrl) throw new Error("Failed to resolve uploaded image URL");
  return data.publicUrl;
}

async function uploadFromDataUrl(dataUrl: string, slug: string, idx: number) {
  const match = dataUrl.trim().match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL image");
  const mime = match[1] || "image/png";
  const raw = match[2] || "";
  return uploadBinary(Buffer.from(raw, "base64"), mime, slug, "data", idx);
}

async function uploadFromHttpUrl(url: string, slug: string, idx: number) {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`Invalid image URL: ${trimmed}`);
  }
  const res = await fetch(trimmed);
  if (!res.ok) {
    throw new Error(`Failed to download image (${res.status}): ${trimmed}`);
  }
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const bytes = Buffer.from(await res.arrayBuffer());
  return uploadBinary(bytes, contentType, slug, "url", idx);
}

async function uploadFromLocalPublicPath(imagePath: string, slug: string, idx: number) {
  const normalized = imagePath.trim();
  if (!normalized.startsWith("/")) {
    throw new Error(`Unsupported local image path: ${imagePath}`);
  }
  const rel = normalized.replace(/^\/+/, "");
  const abs = path.join(process.cwd(), "public", rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`Local image not found: ${normalized}`);
  }
  const ext = path.extname(abs).toLowerCase();
  const contentType = ext === ".png"
    ? "image/png"
    : ext === ".webp"
      ? "image/webp"
      : ext === ".gif"
        ? "image/gif"
        : "image/jpeg";
  const bytes = fs.readFileSync(abs);
  return uploadBinary(bytes, contentType, slug, "local", idx);
}

function validateTemplate(item: ImportTemplateItem) {
  if (!item.title?.trim()) throw new Error("title is required");
  if (!item.desc?.trim()) throw new Error("desc is required");
  if (!item.prompt_template?.trim()) throw new Error("prompt_template is required");
  if (!Array.isArray(item.tags)) throw new Error("tags must be array");
  if (!item.author?.trim()) throw new Error("author is required");
  if (!item.source_url?.trim()) throw new Error("source_url is required");
}

async function processImages(item: ImportTemplateItem, slug: string) {
  const sources = [
    ...(Array.isArray(item.images) ? item.images : []),
    ...(Array.isArray(item.image_urls) ? item.image_urls : []),
  ]
    .map((s) => String(s || "").trim())
    .filter(Boolean);

  if (sources.length === 0) {
    throw new Error("images/image_urls requires at least one item");
  }

  const uploaded: string[] = [];
  for (let i = 0; i < sources.length; i += 1) {
    const src = sources[i];
    if (src.startsWith("data:image/")) {
      uploaded.push(await uploadFromDataUrl(src, slug, i));
      continue;
    }
    if (/^https?:\/\//i.test(src)) {
      uploaded.push(await uploadFromHttpUrl(src, slug, i));
      continue;
    }
    if (src.startsWith("/")) {
      uploaded.push(await uploadFromLocalPublicPath(src, slug, i));
      continue;
    }
    throw new Error(`Unsupported image source: ${src}`);
  }

  return uploaded;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const isAdmin = await isAdminRequest(req);
  if (!isAdmin) return res.status(403).json({ error: "Forbidden: admin only" });

  try {
    const body = req.body as ImportBody | ImportTemplateItem[];
    const templates = Array.isArray(body)
      ? body
      : (Array.isArray((body as ImportBody)?.templates) ? (body as ImportBody).templates || [] : []);

    if (!Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({ error: "templates array is required" });
    }

    const result: Array<{ slug: string; ok: boolean; error?: string }> = [];

    for (let i = 0; i < templates.length; i += 1) {
      const item = templates[i];
      try {
        validateTemplate(item);
        const baseSlug = item.slug?.trim() || slugify(item.title) || `template-${Date.now()}-${i}`;
        const slug = `${baseSlug}-${i}`;
        const images = await processImages(item, slug);

        const payload: PromptTemplate = {
          slug,
          title: item.title.trim(),
          desc: item.desc.trim(),
          prompt_template: item.prompt_template.trim(),
          images,
          tags: item.tags,
          author: item.author.trim(),
          source_url: item.source_url.trim(),
          style: item.style?.trim() || undefined,
          final_prompt: item.final_prompt?.trim() || undefined,
          variables: Array.isArray(item.variables) ? item.variables : [],
          default_model: "gpt-image-2",
        };

        await upsertPromptTemplate(payload);
        result.push({ slug, ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown error";
        result.push({ slug: item.slug || item.title || `row-${i}`, ok: false, error: message });
      }
    }

    clearPromptPageCache();

    const successCount = result.filter((r) => r.ok).length;
    const failedCount = result.length - successCount;

    return res.status(200).json({
      ok: failedCount === 0,
      total: result.length,
      successCount,
      failedCount,
      result,
    });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "Import failed" });
  }
}
