import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { deductCredit, getCredits } from "../../utils/creditsStore";
import {
  supabaseAdmin,
  SUPABASE_GENERATED_IMAGES_BUCKET,
} from "../../utils/supabase";

function resolveUserId(req: NextApiRequest): string | null {
  const hasClerk = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
  if (!hasClerk) return "local-dev-user";
  try {
    const { userId } = getAuth(req);
    return userId ?? null;
  } catch {
    return "local-dev-user";
  }
}

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

type GenerateRequest = {
  prompt: string;
  ratio: string;
  referenceImageBase64?: string;
};

type GenerateResponse =
  | { images: string[]; credits?: { balance: number } }
  | { error: string };

function resolveOpenAiTimeoutMs(): number {
  const raw = Number(process.env.OPENAI_IMAGE_TIMEOUT_MS ?? "180000");
  if (!Number.isFinite(raw)) return 180000;
  return Math.min(Math.max(Math.floor(raw), 10000), 600000);
}

async function generateWithGpt(
  prompt: string,
  ratio: string,
  referenceImageBase64?: string,
): Promise<string[]> {
  const startedAt = Date.now();
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const url = `${baseUrl}/v1/images/generations`;
  const body: Record<string, unknown> = {
    model: "gpt-image-2",
    prompt,
    n: 1,
    aspect_ratio: ratio,
  };
  if (referenceImageBase64) {
    // Gateway-verified format: image[] expects data URL (data:image/...;base64,...)
    body.image = [referenceImageBase64];
  }

  // eslint-disable-next-line no-console
  console.log("[/api/generate] request -> provider", JSON.stringify({
    url,
    model: body.model,
    aspect_ratio: body.aspect_ratio,
    has_reference_image: Boolean(referenceImageBase64),
    prompt_length: prompt.length,
  }));

  const timeoutMs = resolveOpenAiTimeoutMs();
  const genController = new AbortController();
  const genTimer = setTimeout(() => genController.abort(), timeoutMs);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: genController.signal,
  });
  clearTimeout(genTimer);
  // eslint-disable-next-line no-console
  console.log("[/api/generate] response <- provider", JSON.stringify({
    status: res.status,
    ok: res.ok,
    elapsed_ms: Date.now() - startedAt,
  }));
  if (!res.ok) {
    const text = await res.text();
    // eslint-disable-next-line no-console
    console.error("[/api/generate] provider error body", text);
    throw new Error(`GPT Image API error ${res.status}: ${text}`);
  }
  const json = await res.json() as {
    data?: Array<{ b64_json?: string; url?: string }>;
    output?: Array<{ b64_json?: string; url?: string }>;
    result?: Array<{ b64_json?: string; url?: string }>;
    images?: Array<{ b64_json?: string; url?: string }>;
  };

  // Debug raw provider response so frontend rendering mismatches can be diagnosed quickly.
  try {
    // eslint-disable-next-line no-console
    console.log("[/api/generate] GPT raw response:", JSON.stringify(json));
  } catch {
    // ignore stringify errors
  }

  const candidates =
    json.data ??
    json.output ??
    json.result ??
    json.images ??
    [];

  const stats = {
    candidates: candidates.length,
    with_url: candidates.filter((d) => Boolean(d?.url && d.url.trim())).length,
    with_b64: candidates.filter((d) => Boolean(d?.b64_json && d.b64_json.trim())).length,
  };
  // eslint-disable-next-line no-console
  console.log("[/api/generate] parsed provider payload", JSON.stringify(stats));

  async function persistBase64Image(input: string, idx: number): Promise<string> {
    let mime = "image/png";
    let raw = input.trim();
    const dataUrlMatch = raw.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUrlMatch) {
      mime = dataUrlMatch[1] || mime;
      raw = dataUrlMatch[2] || "";
    }
    const ext = mime.includes("jpeg") || mime.includes("jpg")
      ? "jpg"
      : mime.includes("webp")
        ? "webp"
        : "png";
    const filePath = `${new Date().toISOString().slice(0, 10)}/gen_${Date.now()}_${idx}_${randomUUID().slice(0, 8)}.${ext}`;
    const bytes = Buffer.from(raw, "base64");
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(SUPABASE_GENERATED_IMAGES_BUCKET)
      .upload(filePath, bytes, {
        contentType: mime,
        upsert: false,
      });
    if (uploadError) {
      throw new Error(`Failed to upload generated image: ${uploadError.message}`);
    }
    const { data } = supabaseAdmin
      .storage
      .from(SUPABASE_GENERATED_IMAGES_BUCKET)
      .getPublicUrl(filePath);
    if (!data?.publicUrl) {
      throw new Error("Failed to resolve generated image public URL");
    }
    return data.publicUrl;
  }

  const results: string[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    const item = candidates[i];
    if (item?.url && item.url.trim()) {
      results.push(item.url.trim());
      continue;
    }
    if (item?.b64_json && item.b64_json.trim()) {
      try {
        const localUrl = await persistBase64Image(item.b64_json, i);
        results.push(localUrl);
      } catch {
        results.push(`data:image/png;base64,${item.b64_json}`);
      }
    }
  }
  // eslint-disable-next-line no-console
  console.log("[/api/generate] resolved images", JSON.stringify({
    count: results.length,
    sample: results.slice(0, 2),
  }));
  return results.filter(Boolean);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt, ratio, referenceImageBase64 } = req.body as GenerateRequest;

  if (!prompt?.trim()) return res.status(400).json({ error: "prompt is required" });

  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const credits = await getCredits(userId);
  if (!credits || credits.balance < 1) {
    return res.status(402).json({
      error:
        "Insufficient credits. Please purchase a credit pack on /pricing.",
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "OPENAI_API_KEY not configured" });
    }
    const images = await generateWithGpt(prompt, ratio, referenceImageBase64);

    if (images.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("[/api/generate] no images after parsing provider response");
      return res.status(502).json({ error: "No images returned from model" });
    }

    const updated = await deductCredit(userId, 1, "image_generation", { model: "gpt-image-2", ratio });
    // eslint-disable-next-line no-console
    console.log("[/api/generate] success", JSON.stringify({
      userId,
      ratio,
      images_count: images.length,
      credits_balance: updated.balance,
    }));
    return res.status(200).json({ images, credits: { balance: updated.balance } });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      const timeoutMs = resolveOpenAiTimeoutMs();
      // eslint-disable-next-line no-console
      console.error("[/api/generate] timeout", JSON.stringify({ timeoutMs }));
      return res.status(504).json({
        error: `Image generation timeout after ${Math.round(timeoutMs / 1000)}s`,
      });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    // eslint-disable-next-line no-console
    console.error("[/api/generate] failed", message);
    return res.status(502).json({ error: message });
  }
}
