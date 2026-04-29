import fs from "fs";
import path from "path";

export type ImageModel = "gemini-2.0-flash-preview-image-generation" | "gpt-image-2";

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

const TEMPLATES_DIR = path.join(process.cwd(), "prompt_templates");

function assertValidTemplate(raw: PromptTemplateRaw, fileName: string) {
  const requiredFields: Array<keyof PromptTemplateRaw> = [
    "title",
    "desc",
    "prompt_template",
    "images",
    "tags",
    "author",
    "source_url",
  ];

  for (const field of requiredFields) {
    if (raw[field] === undefined || raw[field] === null) {
      throw new Error(`Template ${fileName} is missing required field: ${field}`);
    }
  }

  if (!Array.isArray(raw.images) || raw.images.length === 0) {
    throw new Error(`Template ${fileName} must provide a non-empty images array`);
  }

  if (!Array.isArray(raw.tags)) {
    throw new Error(`Template ${fileName} must provide tags as an array`);
  }
}

function parseTemplateFile(filePath: string): PromptTemplate {
  const fileName = path.basename(filePath);
  const slug = fileName.replace(/\.json$/i, "");
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as PromptTemplateRaw;

  assertValidTemplate(raw, fileName);

  return {
    slug,
    ...raw,
  };
}

export function getPromptTemplates(): PromptTemplate[] {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(TEMPLATES_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => parseTemplateFile(path.join(TEMPLATES_DIR, file)));
}

export function getPromptTemplateBySlug(slug: string): PromptTemplate | undefined {
  return getPromptTemplates().find((template) => template.slug === slug);
}
