import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  cover?: string;
  published: boolean;
};

export type BlogPost = BlogPostMeta & {
  markdown: string;
  html: string;
};

function normalizeMeta(slug: string, data: Record<string, unknown>): BlogPostMeta {
  const title = typeof data.title === "string" ? data.title : slug;
  const excerpt = typeof data.excerpt === "string" ? data.excerpt : "";
  const date = typeof data.date === "string" ? data.date : "";
  const tags = Array.isArray(data.tags) ? data.tags.map((t) => String(t)).filter(Boolean) : [];
  const cover = typeof data.cover === "string" ? data.cover : "";
  const published = typeof data.published === "boolean" ? data.published : true;
  return {
    slug,
    title,
    excerpt,
    date,
    tags,
    cover: cover || undefined,
    published,
  };
}

function readMarkdownFiles() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((name) => name.endsWith(".md"));
}

export function getAllBlogSlugs() {
  return readMarkdownFiles().map((filename) => filename.replace(/\.md$/, ""));
}

export function getAllPublishedBlogPosts(): BlogPostMeta[] {
  const posts = readMarkdownFiles()
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const fullPath = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(raw);
      return normalizeMeta(slug, data as Record<string, unknown>);
    })
    .filter((post) => post.published)
    .sort((a, b) => {
      const ta = a.date ? Date.parse(a.date) : 0;
      const tb = b.date ? Date.parse(b.date) : 0;
      return tb - ta;
    });

  return posts;
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);
  const meta = normalizeMeta(slug, data as Record<string, unknown>);
  if (!meta.published) return null;

  const html = marked.parse(content) as string;
  return {
    ...meta,
    markdown: content,
    html,
  };
}
