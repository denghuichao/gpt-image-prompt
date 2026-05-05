import type { GetServerSideProps } from "next";
import { getPromptTemplates } from "../utils/promptTemplates";
import { getAllPublishedBlogPosts } from "../utils/blog";
import { getSiteUrl, localePath } from "../utils/seo";

const SitemapXml = () => null;

export default SitemapXml;

function buildUrl(loc: string, lastmod?: string) {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <changefreq>daily</changefreq>`,
    `    <priority>0.7</priority>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    "  </url>",
  ].join("\n");
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = getSiteUrl();
  const staticRoutes = ["/", "/gallery", "/pricing", "/build", "/blogs", "/privacy", "/terms"];

  const entries: string[] = [];

  for (const route of staticRoutes) {
    entries.push(buildUrl(`${siteUrl}${localePath(route, "zh")}`));
    entries.push(buildUrl(`${siteUrl}${localePath(route, "en")}`));
  }

  const templates = await getPromptTemplates();
  for (const item of templates) {
    const path = `/prompts/${item.slug}`;
    entries.push(buildUrl(`${siteUrl}${localePath(path, "zh")}`));
  }

  const posts = getAllPublishedBlogPosts();
  for (const post of posts) {
    const path = `/blogs/${post.slug}`;
    entries.push(buildUrl(`${siteUrl}${localePath(path, "zh")}`, post.date || undefined));
    entries.push(buildUrl(`${siteUrl}${localePath(path, "en")}`, post.date || undefined));
  }

  const xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ...entries,
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=28800, stale-while-revalidate=3600");
  res.write(xml);
  res.end();

  return { props: {} };
};
