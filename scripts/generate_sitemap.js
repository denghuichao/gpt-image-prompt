const fs = require("fs");
const path = require("path");
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

function buildUrl(loc, lastmod) {
  return [
    "  <url>",
    `    <loc>${toSitemapLoc(loc)}</loc>`,
    "    <changefreq>daily</changefreq>",
    "    <priority>0.7</priority>",
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

async function getTemplateSlugs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("[generate_sitemap] skip templates: missing supabase env");
    return [];
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabaseAdmin
      .from("prompt_templates")
      .select("slug")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("[generate_sitemap] skip templates:", error.message);
      return [];
    }
    return (data || [])
      .map((row) => String(row.slug || "").trim())
      .filter(Boolean);
  } catch (err) {
    console.warn(
      "[generate_sitemap] skip templates:",
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
  const staticRoutes = ["/", "/gallery", "/pricing", "/build", "/blogs", "/privacy", "/terms"];
  const entries = [];

  for (const route of staticRoutes) {
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`));
    entries.push(buildUrl(`${siteUrl}${localePath(route, "en")}`));
  }

  const templateSlugs = await getTemplateSlugs();
  for (const slug of templateSlugs) {
    const route = `/prompts/${slug}`;
    // Keep prompt detail pages in zh sitemap only to reduce duplicate locale signals.
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`));
  }

  const posts = getBlogPosts();
  for (const post of posts) {
    const route = `/blogs/${post.slug}`;
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`, post.date || undefined));
    entries.push(buildUrl(`${siteUrl}${localePath(route, "en")}`, post.date || undefined));
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
