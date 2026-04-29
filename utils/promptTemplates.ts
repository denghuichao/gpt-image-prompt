import { supabaseAdmin } from "./supabase";

export type ImageModel = "gpt-image-2";

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
}

export interface PromptTemplate extends PromptTemplateRaw {
  slug: string;
}

export type PromptTemplatesPage = {
  templates: PromptTemplate[];
  nextCursor: number | null;
  hasMore: boolean;
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
  created_at: string;
  updated_at: string;
};

function normalizeRow(row: PromptTemplateRow): PromptTemplate {
  return {
    slug: row.slug,
    title: row.title,
    desc: row.description,
    prompt_template: row.prompt_template,
    images: Array.isArray(row.images) ? row.images : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    author: row.author,
    source_url: row.source_url,
    style: row.style || undefined,
    final_prompt: row.final_prompt || undefined,
    variables: Array.isArray(row.variables) ? row.variables : [],
    default_model: row.default_model || "gpt-image-2",
  };
}

export async function getPromptTemplates(): Promise<PromptTemplate[]> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select("slug,title,description,prompt_template,images,tags,author,source_url,style,final_prompt,variables,default_model,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
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

export async function getPromptTemplatesPage(input: {
  cursor?: number;
  limit?: number;
  q?: string;
}): Promise<PromptTemplatesPage> {
  const cursor = Number.isFinite(input.cursor) ? Math.max(0, Math.floor(input.cursor as number)) : 0;
  const limit = Number.isFinite(input.limit) ? Math.min(60, Math.max(1, Math.floor(input.limit as number))) : 24;
  const q = sanitizeLikeQuery(input.q || "");

  let query = supabaseAdmin
    .from("prompt_templates")
    .select("slug,title,description,prompt_template,images,tags,author,source_url,style,final_prompt,variables,default_model,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (q) {
    const term = escapeOrTerm(q);
    const ilike = `*${term}*`;
    const canTagMatch = !term.includes(" ");
    const orParts = [
      `title.ilike.${ilike}`,
      `description.ilike.${ilike}`,
      `prompt_template.ilike.${ilike}`,
      `final_prompt.ilike.${ilike}`,
    ];
    if (canTagMatch) {
      orParts.push(`tags.cs.{"${term}"}`);
    }
    query = query.or(orParts.join(","));
  }

  const { data, error } = await query.range(cursor, cursor + limit);
  if (error) {
    throw new Error(`Failed to fetch prompt templates page: ${error.message}`);
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

export async function getPromptTemplateBySlug(slug: string): Promise<PromptTemplate | undefined> {
  const { data, error } = await supabaseAdmin
    .from("prompt_templates")
    .select("slug,title,description,prompt_template,images,tags,author,source_url,style,final_prompt,variables,default_model,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
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
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from("prompt_templates")
    .upsert(payload, { onConflict: "slug" });

  if (error) {
    throw new Error(`Failed to upsert prompt template: ${error.message}`);
  }
}
