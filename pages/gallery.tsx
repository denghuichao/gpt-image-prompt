import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProgressiveMediaCard from "../components/ProgressiveMediaCard";
import { resolveLocale, t } from "../utils/i18n";
import { getPromptTemplatesPage, type PromptTemplate } from "../utils/promptTemplates";
import { absoluteUrl, buildHrefLang, safeJsonLd } from "../utils/seo";

const PAGE_SIZE = 24;

function parseCsvParam(input: string | string[] | undefined) {
  const raw = Array.isArray(input) ? input.join(",") : (input || "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

type PromptsPageResponse = {
  templates: PromptTemplate[];
  nextCursor: number | null;
  hasMore: boolean;
  error?: string;
};

type GalleryPageProps = {
  initialTemplates: PromptTemplate[];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  isFiltered: boolean;
};

function TemplateCardImage({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const candidates = useMemo(
    () => images.map((s) => String(s || "").trim()).filter(Boolean),
    [images],
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [candidates.join("|")]);

  const src = candidates[idx] || "/prompt_images/1.jpeg";

  return (
    <ProgressiveMediaCard
      src={src}
      alt={`${title} sample image`}
      aspectClassName="aspect-[4/5]"
      loadingLabel="Loading preview"
      errorLabel="Preview unavailable"
      imgProps={{ referrerPolicy: "no-referrer" }}
      onError={() => setIdx((prev) => (prev + 1 < candidates.length ? prev + 1 : prev))}
      imageClassName="group-hover:scale-[1.04]"
    />
  );
}

function mergeBySlug(prev: PromptTemplate[], next: PromptTemplate[]) {
  const map = new Map<string, PromptTemplate>();
  for (const item of prev) map.set(item.slug, item);
  for (const item of next) map.set(item.slug, item);
  return Array.from(map.values());
}

function normalizePromptText(input: string) {
  return input.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
}

function resolveShareImage(src: string | undefined, locale: "zh" | "en") {
  if (!src) return absoluteUrl("/prompt_images/1.jpeg", locale);
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return absoluteUrl(src, locale);
}

const GalleryPage: NextPage<GalleryPageProps> = ({
  initialTemplates,
  initialNextCursor,
  initialHasMore,
  isFiltered,
}) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/gallery", localeTyped);
  const hreflangs = buildHrefLang("/gallery");
  const dict = t(locale);
  const query = typeof router.query.q === "string" ? router.query.q : "";
  const typeFilter = typeof router.query.type === "string" ? router.query.type : "";
  const tagFilters = useMemo(() => parseCsvParam(router.query.tags), [router.query.tags]);
  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const ogImage = resolveShareImage(initialTemplates[0]?.images[0], localeTyped);

  const [templates, setTemplates] = useState<PromptTemplate[]>(initialTemplates);
  const [nextCursor, setNextCursor] = useState<number | null>(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(true);

  const inFlightRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedRef = useRef(false);

  const loadPage = useCallback(async (cursor: number, replace: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("cursor", String(cursor));
      params.set("limit", String(PAGE_SIZE));
      if (normalizedQuery) params.set("q", normalizedQuery);
      if (typeFilter.trim()) params.set("style", typeFilter.trim());
      if (tagFilters.length > 0) params.set("tags", tagFilters.join(","));

      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json() as PromptsPageResponse;
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setTemplates((prev) => (replace ? data.templates : mergeBySlug(prev, data.templates)));
      setNextCursor(data.nextCursor);
      setHasMore(Boolean(data.hasMore));
    } catch {
      if (replace) setTemplates([]);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
      setHasLoadedOnce(true);
    }
  }, [normalizedQuery, typeFilter, tagFilters]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }
    setTemplates([]);
    setNextCursor(0);
    setHasMore(true);
    setHasLoadedOnce(false);
    void loadPage(0, true);
  }, [loadPage]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (!first?.isIntersecting) return;
      if (inFlightRef.current) return;
      if (!hasMore) return;
      if (nextCursor == null) return;
      void loadPage(nextCursor, false);
    }, {
      root: null,
      rootMargin: "520px 0px",
      threshold: 0,
    });

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadPage]);

  const noResults = hasLoadedOnce && !isLoading && templates.length === 0;

  return (
    <>
      <Head>
        <title>{dict.gallery.title}</title>
        <meta name="description" content={dict.gallery.description} />
        <meta name="robots" content={isFiltered ? "noindex,follow" : "index,follow"} />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Image Prompt Base" />
        <meta property="og:title" content={dict.gallery.title} />
        <meta property="og:description" content={dict.gallery.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={dict.gallery.title} />
        <meta name="twitter:description" content={dict.gallery.description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: dict.gallery.title,
              description: dict.gallery.description,
              url: canonical,
              inLanguage: locale === "en" ? "en" : "zh-CN",
              mainEntity: {
                "@type": "ItemList",
                itemListElement: initialTemplates.slice(0, 12).map((template, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  url: absoluteUrl(`/prompts/${template.slug}`, localeTyped),
                  name: template.title,
                })),
              },
            }),
          }}
        />
      </Head>

      <main className="mx-auto max-w-[1960px] px-3 py-6 sm:px-5 lg:px-6">
        {noResults ? (
          <section className="py-20 text-center">
            <p className="font-display text-xl italic text-night-400">
              {dict.gallery.noResults}{" "}
              <span className="text-night-200">"{query}"</span>
            </p>
          </section>
        ) : (
          <>
            <section className="columns-2 gap-3 sm:columns-3 xl:columns-4 2xl:columns-5">
              {templates.map((template) => (
                <article
                  key={template.slug}
                  className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-night-700 bg-night-800 shadow-card transition-all duration-300 hover:border-glow-500/30 hover:shadow-card-hover"
                >
                  <Link href={`/prompts/${template.slug}`} locale={locale} className="block">
                    <div className="relative">
                      <TemplateCardImage images={template.images} title={template.title} />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/20 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 px-3 py-4 transition-opacity duration-300 group-hover:opacity-0">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-night-400">
                          {template.style || dict.common.uncategorized}
                        </p>
                        <h2 className="mt-1.5 font-display text-xl font-semibold italic leading-tight text-night-50">
                          {template.title}
                        </h2>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span
                              key={`${template.slug}-${tag}`}
                              className="rounded-full border border-night-600/60 bg-night-950/70 px-2.5 py-0.5 font-mono text-[10px] text-night-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="absolute inset-0 flex flex-col justify-end rounded-2xl bg-night-950/92 px-3 py-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="w-full rounded-xl bg-night-600/45 px-2.5 py-3 backdrop-blur-[1px]">
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-night-300">
                            {template.style || dict.common.uncategorized}
                          </p>
                          <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold italic leading-tight text-night-50">
                            {template.title}
                          </h3>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {template.tags.slice(0, 6).map((tag) => (
                              <span
                                key={`${template.slug}-hover-${tag}`}
                                className="rounded-full border border-night-500/60 bg-night-900/70 px-2 py-0.5 font-mono text-[10px] text-night-200"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <p className="mt-3 line-clamp-5 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-night-100">
                            {normalizePromptText(template.final_prompt || template.prompt_template)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </section>

            <div ref={sentinelRef} className="h-10" aria-hidden="true" />

            {isLoading && (
              <div className="py-5 text-center">
                <span className="inline-flex items-center gap-2 text-xs text-night-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-night-500 border-t-transparent" />
                  {dict.gallery.loading}
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default GalleryPage;

export const getServerSideProps: GetServerSideProps<GalleryPageProps> = async (context) => {
  const query = typeof context.query.q === "string" ? context.query.q : "";
  const typeFilter = typeof context.query.type === "string" ? context.query.type : "";
  const tagFilters = parseCsvParam(context.query.tags);
  const initialPage = await getPromptTemplatesPage({
    cursor: 0,
    limit: PAGE_SIZE,
    q: query.trim(),
    style: typeFilter.trim(),
    tags: tagFilters,
  });

  return {
    props: {
      initialTemplates: initialPage.templates,
      initialNextCursor: initialPage.nextCursor,
      initialHasMore: initialPage.hasMore,
      isFiltered: Boolean(query.trim() || typeFilter.trim() || tagFilters.length > 0),
    },
  };
};
