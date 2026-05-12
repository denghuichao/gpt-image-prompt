import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownTrayIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useRouter } from "next/router";
import CopyButton from "../../components/CopyButton";
import ProgressiveMediaCard from "../../components/ProgressiveMediaCard";
import { resolveLocale, t } from "../../utils/i18n";
import { tryFormatJsonPrompt } from "../../utils/jsonPrompt";
import {
  getPromptTemplateBySlug,
  type PromptTemplate,
} from "../../utils/promptTemplates";
import { absoluteUrl, safeJsonLd } from "../../utils/seo";
import { getStyleGalleryPath, getTagGalleryPath } from "../../utils/taxonomy";

function normalizePromptText(input: string) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n");
}

type TemplateGalleryItem = {
  id: string;
  url: string;
  source: "sample" | "generated";
  createdAt: string;
};

type TemplateGalleryResponse = {
  items: TemplateGalleryItem[];
  nextCursor: number | null;
  hasMore: boolean;
  error?: string;
};

const PromptDetailPage: NextPage<{ template: PromptTemplate }> = ({ template }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const shouldNoindex = locale === "en";
  const dict = t(locale);
  const path = `/prompts/${template.slug}`;
  const canonical = absoluteUrl(path, "zh");
  const ogImage = template.images[0] || absoluteUrl("/prompt_images/1.jpeg", localeTyped);
  const formattedJsonPrompt = tryFormatJsonPrompt(template.prompt_template);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [galleryItems, setGalleryItems] = useState<TemplateGalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const visibleGalleryItems = useMemo<TemplateGalleryItem[]>(() => {
    if (galleryItems.length > 0) return galleryItems;
    return template.images.map((url, idx) => ({
      id: `sample-local-${idx}`,
      url,
      source: "sample",
      createdAt: new Date(0).toISOString(),
    }));
  }, [galleryItems, template.images]);

  const lightboxImages = useMemo(
    () => visibleGalleryItems.map((item) => item.url).filter(Boolean),
    [visibleGalleryItems],
  );

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + lightboxImages.length) % lightboxImages.length));
  }, [lightboxImages.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % lightboxImages.length));
  }, [lightboxImages.length]);

  async function handleDownloadImage(src: string) {
    if (!src || isDownloadingImage) return;
    setIsDownloadingImage(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const ext = blob.type.includes("jpeg") || blob.type.includes("jpg")
        ? "jpg"
        : blob.type.includes("webp")
          ? "webp"
          : "png";
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `template-sample-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setIsDownloadingImage(false);
    }
  }

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, prev, next]);

  useEffect(() => {
    let cancelled = false;
    setGalleryItems([]);
    setGalleryLoading(true);

    async function loadAll() {
      const merged: TemplateGalleryItem[] = [];
      const seen = new Set<string>();
      let cursor: number | null = 0;
      let page = 0;

      while (cursor !== null && page < 60) {
        const params = new URLSearchParams();
        params.set("cursor", String(cursor));
        params.set("limit", "100");
        params.set("slug", template.slug);
        const res = await fetch(`/api/prompt-gallery?${params.toString()}`);
        const data = await res.json() as TemplateGalleryResponse;
        if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
        for (const item of data.items || []) {
          if (!item.url || seen.has(item.url)) continue;
          seen.add(item.url);
          merged.push(item);
        }
        cursor = data.hasMore ? data.nextCursor : null;
        page += 1;
      }

      if (!cancelled) setGalleryItems(merged);
    }

    void loadAll()
      .catch(() => {
        if (!cancelled) setGalleryItems([]);
      })
      .finally(() => {
        if (!cancelled) setGalleryLoading(false);
      });

    return () => { cancelled = true; };
  }, [template.slug]);

  return (
    <>
      <Head>
        <title>{`${template.title} ${dict.promptDetail.titleSuffix}`}</title>
        <meta name="description" content={template.desc} />
        <meta name="robots" content={shouldNoindex ? "noindex,follow" : "index,follow"} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${template.title} ${dict.promptDetail.titleSuffix}`} />
        <meta property="og:description" content={template.desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${template.title} ${dict.promptDetail.titleSuffix}`} />
        <meta name="twitter:description" content={template.desc} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: template.title,
              description: template.desc,
              url: canonical,
              image: visibleGalleryItems.map((item) => item.url),
              author: { "@type": "Person", name: template.author },
              keywords: template.tags.join(", "),
            }),
          }}
        />
      </Head>

      <main className="relative mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        {!showTemplateGallery ? (
          <button
            type="button"
            onClick={() => setShowTemplateGallery(true)}
            className="fixed right-3 top-20 z-[1200] inline-flex h-10 w-10 items-center justify-center rounded-full border border-night-600 bg-night-900/85 text-night-100 shadow-lg backdrop-blur transition hover:border-night-400 hover:bg-night-800 sm:right-5 sm:top-24"
            aria-label="Browse template gallery"
            title="Browse gallery"
          >
            <ArrowsPointingOutIcon className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowTemplateGallery(false)}
            className="fixed right-3 top-20 z-[1200] inline-flex h-10 w-10 items-center justify-center rounded-full border border-night-600 bg-night-900/85 text-night-100 shadow-lg backdrop-blur transition hover:border-night-400 hover:bg-night-800 sm:right-5 sm:top-24"
            aria-label="Close template gallery"
            title="Close gallery"
          >
            <ArrowsPointingInIcon className="h-5 w-5" />
          </button>
        )}

        {!showTemplateGallery && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <section className="flex flex-col gap-6 rounded-2xl border border-night-700/55 bg-night-900/45 p-5 shadow-sm backdrop-blur-sm sm:p-6">
              <div>
                {template.style ? (
                  <Link
                    href={getStyleGalleryPath(template.style)}
                    locale={locale}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-glow-400 transition hover:text-glow-300"
                  >
                    {template.style}
                  </Link>
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-night-500">
                    {dict.common.uncategorized}
                  </p>
                )}
                <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight text-night-50 sm:text-4xl">
                  {template.title}
                </h1>
                <div className="mt-3 max-w-none text-sm leading-relaxed text-night-300 [&_a]:text-glow-300 [&_a]:underline [&_a]:decoration-glow-500/30 [&_blockquote]:border-l-2 [&_blockquote]:border-night-700 [&_blockquote]:pl-4 [&_blockquote]:text-night-400 [&_code]:rounded [&_code]:bg-night-900 [&_code]:px-1 [&_code]:py-0.5 [&_h1]:mt-5 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:italic [&_h1]:text-night-50 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-xl [&_h2]:italic [&_h2]:text-night-50 [&_h3]:mt-4 [&_h3]:font-display [&_h3]:text-lg [&_h3]:italic [&_h3]:text-night-100 [&_li]:my-1 [&_ol]:my-3 [&_ol]:pl-5 [&_p]:my-2 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {template.desc || ""}
                  </ReactMarkdown>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {template.tags.map((tag) => (
                    <Link
                      key={`${template.slug}-${tag}`}
                      href={getTagGalleryPath(tag)}
                      locale={locale}
                      className="rounded-full border border-night-700/60 bg-night-900/60 px-2.5 py-0.5 font-mono text-[10px] text-night-400 transition hover:border-glow-500/35 hover:text-glow-200"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-night-800 pt-4">
                  <span className="flex items-baseline gap-2 text-xs">
                    <span className="text-night-600 uppercase tracking-wider">{dict.promptDetail.author}</span>
                    <span className="text-night-300">{template.author}</span>
                  </span>
                  <span className="flex items-baseline gap-2 text-xs min-w-0">
                    <span className="shrink-0 text-night-600 uppercase tracking-wider">{dict.promptDetail.sourceUrl}</span>
                    <a
                      href={template.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-glow-400 underline decoration-glow-500/30 transition hover:decoration-glow-400"
                    >
                      {template.source_url}
                    </a>
                  </span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
                  {dict.promptDetail.promptTemplate}
                </p>
                {formattedJsonPrompt ? (
                  <pre className="overflow-x-auto whitespace-pre rounded-xl border border-night-700 bg-night-950/60 p-4 font-mono text-xs leading-relaxed text-night-300">
                    {formattedJsonPrompt}
                  </pre>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-night-300">
                    {normalizePromptText(template.prompt_template)}
                  </pre>
                )}
              </div>

              {(template.variables || []).length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
                    {dict.promptDetail.variables}
                  </p>
                  <div className="space-y-2">
                    {(template.variables || []).map((variable) => (
                      <div
                        key={`${template.slug}-${variable.key}`}
                        className="rounded-xl border border-night-700/60 bg-night-900/40 px-4 py-3"
                      >
                        <p className="font-mono text-xs font-semibold text-glow-300">{`{${variable.key}}`}</p>
                        {variable.description && (
                          <p className="mt-1 text-xs text-night-400">{variable.description}</p>
                        )}
                        {variable.example && (
                          <p className="mt-0.5 text-[11px] text-night-600">{dict.promptDetail.example}: {variable.example}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <CopyButton text={normalizePromptText(template.final_prompt || template.prompt_template)} />
                <Link
                  href={{ pathname: "/build", query: { template: template.slug } }}
                  locale={locale}
                  className="inline-flex items-center gap-2 rounded-full bg-glow-500 px-5 py-2.5 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400 hover:shadow-glow-md"
                >
                  {dict.promptDetail.buildButton}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-night-700/55 bg-night-900/45 p-5 shadow-sm backdrop-blur-sm sm:p-6">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-night-500">
                {dict.promptDetail.gallery}
              </p>
              <div className="columns-1 gap-3 sm:columns-2">
                {visibleGalleryItems.map((item, idx) => (
                  <figure
                    key={`${template.slug}-${item.id}`}
                    className="group relative mb-3 cursor-zoom-in overflow-hidden rounded-xl border border-night-700 break-inside-avoid"
                    onClick={() => openLightbox(idx)}
                  >
                    <ProgressiveMediaCard
                      src={item.url}
                      alt={`${template.title} sample ${idx + 1}`}
                      aspectClassName="aspect-[4/5]"
                      loadingLabel="Loading gallery image"
                      errorLabel="Gallery image unavailable"
                      imageClassName="group-hover:scale-[1.04] group-hover:brightness-90"
                    />
                  </figure>
                ))}
              </div>
              {galleryLoading && (
                <div className="pt-2 text-xs text-night-500">{dict.gallery.loading}</div>
              )}
            </section>
          </div>
        )}

        {showTemplateGallery && (
          <section>
            <div className="columns-2 gap-3 sm:columns-3 xl:columns-4 2xl:columns-5">
              {visibleGalleryItems.map((item, idx) => (
                <article
                  key={item.id}
                  className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-night-700 bg-night-800 transition-all duration-300 hover:border-glow-500/30"
                >
                  <button type="button" onClick={() => openLightbox(idx)} className="block w-full text-left">
                    <ProgressiveMediaCard
                      src={item.url}
                      alt={`${template.title} gallery ${idx + 1}`}
                      aspectClassName="aspect-[4/5]"
                      loadingLabel="Loading gallery image"
                      errorLabel="Gallery image unavailable"
                      imageClassName="group-hover:scale-[1.03]"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-night-950/85 to-transparent" />
                  </button>
                </article>
              ))}
            </div>

            {galleryLoading && (
              <div className="py-5 text-center">
                <span className="inline-flex items-center gap-2 text-xs text-night-500">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-night-500 border-t-transparent" />
                  {dict.gallery.loading}
                </span>
              </div>
            )}
          </section>
        )}
      </main>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-night-950/90 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close preview"
            onClick={closeLightbox}
          />
          <div className="relative z-[121] max-h-[92vh] max-w-[92vw]">
            <button
              type="button"
              onClick={() => { void handleDownloadImage(lightboxImages[lightboxIndex]); }}
              className="absolute right-12 top-2 rounded-full border border-night-600 bg-night-900/80 px-2.5 py-0.5 text-xs text-night-100 transition hover:border-night-400 disabled:opacity-60"
              disabled={isDownloadingImage}
              aria-label={dict.build.downloadImageAria}
            >
              <span className="inline-flex items-center gap-1">
                <ArrowDownTrayIcon className="h-3 w-3" />
                {isDownloadingImage ? dict.build.downloading : dict.build.download}
              </span>
            </button>
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-2 top-2 rounded-full border border-night-600 bg-night-900/80 px-2 py-0.5 text-sm text-night-200 transition hover:border-night-400"
              aria-label="Close preview"
            >
              ×
            </button>
            {lightboxImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-night-600 bg-night-900/85 px-3 py-1.5 text-sm text-night-100 transition hover:border-night-400"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-night-600 bg-night-900/85 px-3 py-1.5 text-sm text-night-100 transition hover:border-night-400"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImages[lightboxIndex]} alt={`${template.title} sample ${lightboxIndex + 1}`} className="max-h-[92vh] max-w-[92vw] rounded-xl border border-night-700 object-contain" />
            {lightboxImages.length > 1 && (
              <p className="mt-2 text-center text-xs text-night-300">
                {lightboxIndex + 1} / {lightboxImages.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PromptDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug = String(context.params?.slug || "");
  const template = await getPromptTemplateBySlug(slug);

  if (!template) {
    return { notFound: true };
  }

  return {
    props: {
      template: JSON.parse(JSON.stringify(template)),
    },
  };
};
