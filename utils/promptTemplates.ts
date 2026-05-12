import fs from "fs";
import path from "path";
import { supabaseAdmin } from "./supabase";

export type ImageModel = "gpt-image-2";
export type PromptTemplateEditMode = "both" | "direct_only";

export interface PromptVariable {
  key: string;
  description: string;
  example: string;
}

export interface PromptTemplateRaw {
  title: string;
  desc: string;
  prompt_template: string;
  images: string[];
  tags: string[];
  author: string;
  source_url: string;
  style?: string;
  final_prompt?: string;
  variables?: PromptVariable[];
  default_model?: ImageModel;
  edit_mode?: PromptTemplateEditMode;
}

export interface PromptTemplate extends PromptTemplateRaw {
  slug: string;
}

export type PromptTemplatesPage = {
  templates: PromptTemplate[];
  nextCursor: number | null;
  hasMore: boolean;
};

export type PromptTemplateFacets = {
  styles: string[];
  tags: string[];
};

type PromptTemplateRow = {
  slug: string;
  title: string;
  description: string;
  prompt_template: string;
  images: string[] | null;
  tags: string[] | null;
  author: string;
  source_url: string;
  style: string | null;
  final_prompt: string | null;
  variables: PromptVariable[] | null;
  default_model: ImageModel | null;
  edit_mode: PromptTemplateEditMode | null;
  created_at: string;
  updated_at: string;
};

let localTemplatesCache: PromptTemplate[] | null = null;

function normalizeRow(row: PromptTemplateRow): PromptTemplate {
  const normalized: PromptTemplate = {
    slug: row.slug,
    title: row.title,
    desc: row.description,
    prompt_template: row.prompt_template,
    images: Array.isArray(row.images) ? row.images : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: row.author,
    source_url: row.source_url,
    variables: Array.isArray(row.variables) ? row.variables : [],
    default_model: row.default_model || "gpt-image-2",
    edit_mode: row.edit_mode || "both",
  };

  if (row.style) normalized.style = row.style;
  if (row.final_prompt) normalized.final_prompt = row.final_prompt;

  return normalized;
}

function readLocalPromptTemplates(): PromptTemplate[] {
  if (localTemplatesCache) return localTemplatesCache;
  const filePath = path.join(process.cwd(), "trending-prompts.importable.json");
  if (!fs.existsSync(filePath)) return [];

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as { templates?: PromptTemplate[] };
    const templates = Array.isArray(parsed.templates) ? parsed.templates : [];
    localTemplatesCache = templates.map((template) => ({
      slug: String(template.slug || "").trim(),
      title: String(template.title || "").trim(),
      desc: String(template.desc || ""),
      prompt_template: String(template.prompt_template || ""),
      images: Array.isArray(template.images) ? template.images.map((item) => String(item || "").trim()).filter(Boolean) : [],
      tags: Array.isArray(template.tags) ? template.tags.map((item) => String(item || "").trim()).filter(Boolean) : [],
      author: String(template.author || "").trim(),
      source_url: String(template.source_url || "").trim(),
      variables: Array.isArray(template.variables) ? template.variables : [],
      default_model: template.default_model || "gpt-image-2",
      edit_mode: template.edit_mode || "both",
      ...(template.style ? { style: String(template.style).trim() } : {}),
      ...(template.final_prompt ? { final_prompt: String(template.final_prompt) } : {}),
    })).filter((template) => template.slug);
    return localTemplatesCache;
  } catch {
    return [];
  }
}

function filterLocalTemplates(input: {
  q?: string;
  style?: string;
  tags?: string[];
  tagsMode?: "or" | "and";
}) {
  const q = sanitizeLikeQuery(input.q || "").toLowerCase();
  const style = String(input.style || "").trim().toLowerCase();
  const tags = Array.isArray(input.tags)
    ? input.tags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
    : [];
  const tagsMode = input.tagsMode === "and" ? "and" : "or";

  return readLocalPromptTemplates().filter((template) => {
    if (style && String(template.style || "").trim().toLowerCase() !== style) {
      return false;
    }

    if (tags.length > 0) {
      const candidateTags = template.tags.map((tag) => tag.toLowerCase());
      const hasTags = tagsMode === "and"
        ? tags.every((tag) => candidateTags.includes(tag))
        : tags.some((tag) => candidateTags.includes(tag));
      if (!hasTags) return false;
    }

    if (!q) return true;
    const haystacks = [
      template.title,
      template.desc,
      template.prompt_template,
      template.final_prompt || "",
      ...template.tags,
    ].map((item) => String(item || "").toLowerCase());
    return haystacks.some((item) => item.includes(q));
  });
}

export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select("slug,title,description,prompt_template,images,tags,author,source_url,style,final_prompt,variables,default_model,edit_mode,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    const local = readLocalPromptTemplates();
    if (local.length > 0) return local;
    throw new Error(`Failed to fetch prompt templates: ${error.message}`);
  }

  return (data || []).map((row) => normalizeRow(row as PromptTemplateRow));
}

function sanitizeLikeQuery(q: string) {
  return q
    .trim()
    .replace(/[,\(\)]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function escapeOrTerm(input: string) {
  return input.replace(/["\\]/g, "");
}

function hasCjkChars(input: string) {
  return /[\u3400-\u9fff]/.test(input);
}

export async function getPromptTemplatesPage(input: {
  cursor?: number;
  limit?: number;
  q?: string;
  style?: string;
  tags?: string[];
  tagsMode?: "or" | "and";
}): Promise<PromptTemplatesPage> {
  const cursor = Number.isFinite(input.cursor) ? Math.max(0, Math.floor(input.cursor as number)) : 0;
  const limit = Number.isFinite(input.limit) ? Math.min(60, Math.max(1, Math.floor(input.limit as number))) : 24;
  const q = sanitizeLikeQuery(input.q || "");
  const style = String(input.style || "").trim().slice(0, 80);
  const tags = Array.isArray(input.tags)
    ? input.tags.map((s) => String(s || "").trim()).filter(Boolean).slice(0, 20)
    : [];
  const tagsMode = input.tagsMode === "and" ? "and" : "or";

  let query = supabaseAdmin
    .from("prompt_templates")
    .select("slug,title,description,prompt_template,images,tags,author,source_url,style,final_prompt,variables,default_model,edit_mode,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (q) {
    const term = escapeOrTerm(q);
    const ilike = `*${term}*`;
    const fuzzyCjkIlike = hasCjkChars(term) && term.length > 1
      ? `*${Array.from(term).join("*")}*`
      : "";
    const canTagMatch = !term.includes(" ");
    const orParts = [
      `title.ilike.${ilike}`,
      `description.ilike.${ilike}`,
      `prompt_template.ilike.${ilike}`,
      `final_prompt.ilike.${ilike}`,
    ];
    if (fuzzyCjkIlike && fuzzyCjkIlike !== ilike) {
      // Keep fuzzy fallback narrow to reduce noisy matches.
      orParts.push(`title.ilike.${fuzzyCjkIlike}`);
    }
    if (canTagMatch) {
      orParts.push(`tags.cs.{"${term}"}`);
    }
    query = query.or(orParts.join(","));
  }

  if (style) {
    query = query.eq("style", style);
  }

  if (tags.length > 0) {
    if (tagsMode === "or") {
      query = query.overlaps("tags", tags);
    } else {
      for (const tag of tags) {
        query = query.contains("tags", [tag]);
      }
    }
  }

  const { data, error } = await query.range(cursor, cursor + limit);
  if (error) {
    const localRows = filterLocalTemplates({ q, style, tags, tagsMode });
    const slice = localRows.slice(cursor, cursor + limit);
    const hasMoreLocal = localRows.length > cursor + limit;
    return {
      templates: slice,
      nextCursor: hasMoreLocal ? cursor + limit : null,
      hasMore: hasMoreLocal,
    };
  }

  const rows = (data || []) as PromptTemplateRow[];
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  return {
    templates: pageRows.map((row) => normalizeRow(row)),
    nextCursor: hasMore ? cursor + limit : null,
    hasMore,
  };
}

export async function getPromptTemplateFacets(): Promise<PromptTemplateFacets> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select("style,tags");

  if (error) {
    const local = readLocalPromptTemplates();
    if (local.length === 0) {
      throw new Error(`Failed to fetch prompt template facets: ${error.message}`);
    }
    return {
      styles: Array.from(new Set(local.map((template) => String(template.style || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
      tags: Array.from(new Set(local.flatMap((template) => template.tags.map((tag) => String(tag || "").trim()).filter(Boolean)))).sort((a, b) => a.localeCompare(b)),
    };
  }

  const styleSet = new Set<string>();
  const tagSet = new Set<string>();

  for (const row of (data || []) as Array<{ style: string | null; tags: string[] | null }>) {
    const style = String(row.style || "").trim();
    if (style) styleSet.add(style);
    const tags = Array.isArray(row.tags) ? row.tags : [];
    for (const tag of tags) {
      const normalized = String(tag || "").trim();
      if (normalized) tagSet.add(normalized);
    }
  }

  return {
    styles: Array.from(styleSet).sort((a, b) => a.localeCompare(b)),
    tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
  };
}

export async function getPromptTemplateBySlug(slug: string): Promise<PromptTemplate | undefined> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select("slug,title,description,prompt_template,images,tags,author,source_url,style,final_prompt,variables,default_model,edit_mode,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    const local = readLocalPromptTemplates().find((template) => template.slug === slug);
    if (local) return local;
    throw new Error(`Failed to fetch prompt template: ${error.message}`);
  }

  if (!data) return undefined;
  return normalizeRow(data as PromptTemplateRow);
}

export async function upsertPromptTemplate(input: PromptTemplate) {
  const payload = {
    slug: input.slug,
    title: input.title,
    description: input.desc,
    prompt_template: input.prompt_template,
    images: input.images,
    tags: input.tags,
    author: input.author,
    source_url: input.source_url,
    style: input.style || null,
    final_prompt: input.final_prompt || null,
    variables: input.variables || [],
    default_model: "gpt-image-2",
    ...(input.edit_mode ? { edit_mode: input.edit_mode } : {}),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("prompt_templates")
    .upsert(payload, { onConflict: "slug" });

  if (error) {
    throw new Error(`Failed to upsert prompt template: ${error.message}`);
  }
}
