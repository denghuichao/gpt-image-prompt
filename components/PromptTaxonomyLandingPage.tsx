import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import PromptMasonryGrid from "./PromptMasonryGrid";
import { absoluteUrl, safeJsonLd } from "../utils/seo";
import type { PromptTemplate } from "../utils/promptTemplates";

type TaxonomyKind = "style" | "tag";

type RelatedLink = {
  label: string;
  href: string;
};

type PromptTaxonomyLandingPageProps = {
  kind: TaxonomyKind;
  term: string;
  locale: "zh" | "en";
  initialTemplates: PromptTemplate[];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  canonicalPath: string;
  relatedStyles?: RelatedLink[];
  relatedTags?: RelatedLink[];
};

const PAGE_SIZE = 24;

function buildDescription(kind: TaxonomyKind, term: string, locale: "zh" | "en") {
  const isEn = locale === "en";
  if (kind === "style") {
    return isEn
      ? `Browse AI image prompts in the ${term} style.`
      : `浏览 ${term} 风格的 AI 图像提示词。`;
  }
  return isEn
    ? `Browse AI image prompts tagged ${term}.`
    : `浏览带有 ${term} 标签的 AI 图像提示词。`;
}

export default function PromptTaxonomyLandingPage({
  kind,
  term,
  locale,
  initialTemplates,
  initialNextCursor,
  initialHasMore,
  canonicalPath,
  relatedStyles = [],
  relatedTags = [],
}: PromptTaxonomyLandingPageProps) {
  const canonical = absoluteUrl(canonicalPath, "zh");
  const ogImage = absoluteUrl(initialTemplates[0]?.images[0] || "/prompt_images/1.jpeg", locale);
  const description = buildDescription(kind, term, locale);
  const title = locale === "en"
    ? `${term} ${kind === "style" ? "Style" : "Tag"} Prompts | Image Prompt Base`
    : `${term}${kind === "style" ? "风格" : "标签"}提示词 | Image Prompt Base`;

  const [templates, setTemplates] = useState<PromptTemplate[]>(initialTemplates);
  const [nextCursor, setNextCursor] = useState<number | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const inFlightRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (cursor: number) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("cursor", String(cursor));
      params.set("limit", String(PAGE_SIZE));
      if (kind === "style") params.set("style", term);
      if (kind === "tag") params.set("tags", term);
      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json() as { templates?: PromptTemplate[]; nextCursor: number | null; hasMore: boolean; error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setTemplates((prev) => Array.from(new Map([...prev, ...(data.templates || [])].map((item) => [item.slug, item])).values()));
      setNextCursor(data.nextCursor);
      setHasMore(Boolean(data.hasMore));
    } catch {
      setHasMore(false);
      setNextCursor(null);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [kind, term]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (!first?.isIntersecting) return;
      if (inFlightRef.current) return;
      if (!hasMore) return;
      if (nextCursor == null) return;
      void loadPage(nextCursor);
    }, { root: null, rootMargin: "520px 0px", threshold: 0 });
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadPage]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={locale === "en" ? "noindex,follow" : "index,follow"} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Image Prompt Base" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: title,
              description,
              url: canonical,
              inLanguage: locale === "en" ? "en" : "zh-CN",
              mainEntity: {
                "@type": "ItemList",
                itemListElement: templates.slice(0, 12).map((template, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: absoluteUrl(`/prompts/${template.slug}`, locale),
                  name: template.title,
                })),
              },
            }),
          }}
        />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-night-500">
            {kind === "style" ? (locale === "en" ? "Style landing page" : "风格落地页") : (locale === "en" ? "Tag landing page" : "标签落地页")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
            {term}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-night-400">
            {description}
          </p>
        </header>

        {relatedStyles.length > 0 && (
          <section className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
              {locale === "en" ? "Related styles" : "相关风格"}
            </p>
            <div className="flex flex-wrap gap-2">
              {relatedStyles.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale}
                  className="rounded-full border border-night-700 bg-night-900/60 px-3 py-1.5 text-xs text-night-200 transition hover:border-glow-500/35 hover:text-glow-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedTags.length > 0 && (
          <section className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
              {locale === "en" ? "Related tags" : "相关标签"}
            </p>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale}
                  className="rounded-full border border-night-700 bg-night-900/60 px-3 py-1.5 text-xs text-night-200 transition hover:border-glow-500/35 hover:text-glow-200"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <PromptMasonryGrid
          templates={templates}
          locale={locale}
          onLoadMoreSentinelRef={sentinelRef}
          isLoading={isLoading}
        />
      </main>
    </>
  );
}
