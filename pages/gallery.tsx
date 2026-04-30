import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";
import type { PromptTemplate } from "../utils/promptTemplates";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const PAGE_SIZE = 24;

type PromptsPageResponse = {
  templates: PromptTemplate[];
  nextCursor: number | null;
  hasMore: boolean;
  error?: string;
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${title} sample image`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setIdx((prev) => (prev + 1 < candidates.length ? prev + 1 : prev))}
      className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04]"
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

const GalleryPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/gallery", localeTyped);
  const hreflangs = buildHrefLang("/gallery");
  const dict = t(locale);
  const query = typeof router.query.q === "string" ? router.query.q : "";
  const normalizedQuery = useMemo(() => query.trim(), [query]);

  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const inFlightRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (cursor: number, replace: boolean) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("cursor", String(cursor));
      params.set("limit", String(PAGE_SIZE));
      if (normalizedQuery) params.set("q", normalizedQuery);

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
  }, [normalizedQuery]);

  useEffect(() => {
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
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        {noResults ? (
          <section className="py-20 text-center">
            <p className="font-display text-xl italic text-night-400">
              {dict.gallery.noResults}{" "}
              <span className="text-night-200">"{query}"</span>
            </p>
          </section>
        ) : (
          <>
            <section className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
              {templates.map((template) => (
                <article
                  key={template.slug}
                  className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-night-700 bg-night-800 shadow-card transition-all duration-300 hover:border-glow-500/30 hover:shadow-card-hover"
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
