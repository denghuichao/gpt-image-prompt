const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const matter = require("gray-matter");
const { loadEnvConfig } = require("@next/env");
const { createClient } = require("@supabase/supabase-js");

loadEnvConfig(process.cwd());

function escapeXml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toSitemapLoc(url) {
  return escapeXml(encodeURI(url));
}

function toLastmod(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function buildUrl(loc, options = {}) {
  const changefreq = options.changefreq || "weekly";
  const priority = typeof options.priority === "number" ? options.priority : 0.5;
  const lastmod = options.lastmod ? toLastmod(options.lastmod) : "";
  return [
    "  <url>",
    `    <loc>${toSitemapLoc(loc)}</loc>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority.toFixed(1)}</priority>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    "  </url>",
  ].join("\n");
}

function resolveSiteUrl() {
  const prodUrl = "https://gptimageprompt.xyz";
  const raw = String(
    process.env.SITEMAP_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "",
  ).trim();

  if (!raw) return prodUrl;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) return prodUrl;
  return raw.replace(/\/+$/, "");
}

function localePath(route, locale) {
  if (locale === "zh") return route;
  if (route === "/") return "/en";
  return `/en${route}`;
}

function slugifyTaxonomySegment(input) {
  return String(input || "")
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getTemplateRows() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("[generate_sitemap] fallback templates: missing supabase env");
    return getTemplateRowsFromLocalSources();
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .select("slug,style,tags,updated_at,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[generate_sitemap] fallback templates:", error.message);
      return getTemplateRowsFromLocalSources();
    }
    return (data || []).map((row) => ({
      slug: String(row.slug || "").trim(),
      style: String(row.style || "").trim(),
      tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [],
      updatedAt: String(row.updated_at || row.created_at || "").trim(),
    })).filter((row) => row.slug);
  } catch (err) {
    console.warn(
      "[generate_sitemap] fallback templates:",
      err instanceof Error ? err.message : "unknown error",
    );
    return getTemplateRowsFromLocalSources();
  }
}

function getTemplateRowsFromLocalSources() {
  const fromSqlite = getTemplateRowsFromSqlite();
  if (fromSqlite.length > 0) return fromSqlite;
  return getTemplateRowsFromImportableJson();
}

function getTemplateRowsFromSqlite() {
  const dbPath = path.join(process.cwd(), "data", "app.sqlite");
  if (!fs.existsSync(dbPath)) {
    console.warn("[generate_sitemap] sqlite fallback skipped: db missing");
    return [];
  }

  try {
    const output = execFileSync(
      "sqlite3",
      [
        "-json",
        dbPath,
        "select slug, style, tags, updated_at, created_at from prompt_templates order by created_at desc;",
      ],
      { encoding: "utf8" },
    ).trim();
    if (!output) return [];
    const rows = JSON.parse(output);
    return rows.map((row) => ({
      slug: String(row.slug || "").trim(),
      style: String(row.style || "").trim(),
      tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [],
      updatedAt: String(row.updated_at || row.created_at || "").trim(),
    })).filter((row) => row.slug);
  } catch (err) {
    console.warn(
      "[generate_sitemap] sqlite fallback failed:",
      err instanceof Error ? err.message : "unknown error",
    );
    return [];
  }
}

function getTemplateRowsFromImportableJson() {
  const filePath = path.join(process.cwd(), "trending-prompts.importable.json");
  if (!fs.existsSync(filePath)) {
    console.warn("[generate_sitemap] importable fallback skipped: file missing");
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const templates = Array.isArray(parsed?.templates) ? parsed.templates : [];
    return templates.map((row) => ({
      slug: String(row.slug || "").trim(),
      style: String(row.style || "").trim(),
      tags: Array.isArray(row.tags) ? row.tags.map((tag) => String(tag || "").trim()).filter(Boolean) : [],
      updatedAt: "",
    })).filter((row) => row.slug);
  } catch (err) {
    console.warn(
      "[generate_sitemap] importable fallback failed:",
      err instanceof Error ? err.message : "unknown error",
    );
    return [];
  }
}

function getBlogPosts() {
  const blogDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(blogDir)) return [];
  const files = fs.readdirSync(blogDir).filter((name) => name.endsWith(".md"));
  return files.map((fileName) => {
    const absPath = path.join(blogDir, fileName);
    const raw = fs.readFileSync(absPath, "utf8");
    const parsed = matter(raw);
    const date = parsed.data && parsed.data.date ? String(parsed.data.date) : "";
    const slug = fileName.replace(/\.md$/, "");
    return { slug, date };
  });
}

async function main() {
  const siteUrl = resolveSiteUrl();
  const staticRoutes = [
    { route: "/", changefreq: "daily", priority: 1.0 },
    { route: "/gallery", changefreq: "daily", priority: 0.9 },
    { route: "/pricing", changefreq: "monthly", priority: 0.6 },
    { route: "/blogs", changefreq: "weekly", priority: 0.7 },
    { route: "/privacy", changefreq: "yearly", priority: 0.2 },
    { route: "/terms", changefreq: "yearly", priority: 0.2 },
  ];
  const entries = [];

  for (const item of staticRoutes) {
    entries.push(buildUrl(`${siteUrl}${localePath(item.route, "zh")}`, item));
    entries.push(buildUrl(`${siteUrl}${localePath(item.route, "en")}`, item));
  }

  const templateRows = await getTemplateRows();
  const styleMap = new Map();
  const tagMap = new Map();

  for (const row of templateRows) {
    if (row.style) {
      const slug = slugifyTaxonomySegment(row.style);
      const current = styleMap.get(slug);
      const nextLastmod = toLastmod(row.updatedAt);
      if (!current || (nextLastmod && nextLastmod > current.lastmod)) {
        styleMap.set(slug, { label: row.style, lastmod: nextLastmod || current?.lastmod || "" });
      }
    }
    for (const tag of row.tags) {
      const slug = slugifyTaxonomySegment(tag);
      const current = tagMap.get(slug);
      const nextLastmod = toLastmod(row.updatedAt);
      if (!current || (nextLastmod && nextLastmod > current.lastmod)) {
        tagMap.set(slug, { label: tag, lastmod: nextLastmod || current?.lastmod || "" });
      }
    }
  }

  for (const row of templateRows) {
    const route = `/prompts/${row.slug}`;
    // Keep prompt detail pages in zh sitemap only to reduce duplicate locale signals.
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`, {
      changefreq: "weekly",
      priority: 0.9,
      lastmod: row.updatedAt,
    }));
  }

  for (const { label, lastmod } of styleMap.values()) {
    const route = `/gallery/style/${slugifyTaxonomySegment(label)}`;
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`, {
      changefreq: "weekly",
      priority: 0.7,
      lastmod,
    }));
  }

  for (const { label, lastmod } of tagMap.values()) {
    const route = `/gallery/tag/${slugifyTaxonomySegment(label)}`;
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`, {
      changefreq: "weekly",
      priority: 0.6,
      lastmod,
    }));
  }

  const posts = getBlogPosts();
  for (const post of posts) {
    const route = `/blogs/${post.slug}`;
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`, {
      changefreq: "monthly",
      priority: 0.7,
      lastmod: post.date || undefined,
    }));
  }

  const xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
  fs.writeFileSync(outputPath, xml, "utf8");
  console.log(
    "[generate_sitemap] done",
    JSON.stringify({ outputPath, urlCount: entries.length }),
  );
}

main().catch((err) => {
  console.error(
    "[generate_sitemap] failed",
    err instanceof Error ? err.stack || err.message : "unknown error",
  );
  process.exit(1);
});
