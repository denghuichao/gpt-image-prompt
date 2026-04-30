import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import CopyButton from "../../components/CopyButton";
import { resolveLocale, t } from "../../utils/i18n";
import {
  getPromptTemplateBySlug,
  type PromptTemplate,
} from "../../utils/promptTemplates";
import { absoluteUrl, buildHrefLang, safeJsonLd } from "../../utils/seo";

function normalizePromptText(input: string) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n");
}

const PromptDetailPage: NextPage<{ template: PromptTemplate }> = ({ template }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const dict = t(locale);
  const images = template.images;
  const path = `/prompts/${template.slug}`;
  const canonical = absoluteUrl(path, localeTyped);
  const hreflangs = buildHrefLang(path);
  const ogImage = template.images[0] || absoluteUrl("/prompt_images/1.jpeg", localeTyped);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

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

  return (
    <>
      <Head>
        <title>{`${template.title} ${dict.promptDetail.titleSuffix}`}</title>
        <meta name="description" content={template.desc} />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
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
              image: template.images,
              author: { "@type": "Person", name: template.author },
              keywords: template.tags.join(", "),
            }),
          }}
        />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Left: metadata & prompts — flat layout, no nested cards */}
          <section className="flex flex-col gap-6 rounded-2xl border border-night-700/55 bg-night-900/45 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            {/* Title block */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-night-500">
                {template.style || dict.common.uncategorized}
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight text-night-50 sm:text-4xl">
                {template.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-night-400">{template.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span
                    key={`${template.slug}-${tag}`}
                    className="rounded-full border border-night-700/60 bg-night-900/60 px-2.5 py-0.5 font-mono text-[10px] text-night-400"
                  >
                    #{tag}
                  </span>
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

            {/* Prompt template */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
                {dict.promptDetail.promptTemplate}
              </p>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-night-300">
                {normalizePromptText(template.prompt_template)}
              </pre>
            </div>

            {/* Variables */}
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

            {/* Actions */}
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

          {/* Right: masonry image gallery */}
          <section className="rounded-2xl border border-night-700/55 bg-night-900/45 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-night-500">
              {dict.common.sampleImages}
            </p>
            <div className="columns-1 gap-3 sm:columns-2">
              {images.map((imageUrl, idx) => (
                <figure
                  key={`${template.slug}-${imageUrl}`}
                  className="group mb-3 cursor-zoom-in overflow-hidden rounded-xl border border-night-700 break-inside-avoid"
                  onClick={() => openLightbox(idx)}
                >
                  {/* Use native img so right-click copy keeps original source URL. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`${template.title} sample ${idx + 1}`}
                    loading="lazy"
                    className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04] group-hover:brightness-90"
                  />
                </figure>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-night-950/90 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close preview"
            onClick={closeLightbox}
          />
          <div className="relative z-[121] max-h-[92vh] max-w-[92vw]">
            <button
              type="button"
              onClick={() => { void handleDownloadImage(images[lightboxIndex]); }}
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
            {images.length > 1 && (
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
            <img src={images[lightboxIndex]} alt={`${template.title} sample ${lightboxIndex + 1}`} className="max-h-[92vh] max-w-[92vw] rounded-xl border border-night-700 object-contain" />
            {images.length > 1 && (
              <p className="mt-2 text-center text-xs text-night-300">
                {lightboxIndex + 1} / {images.length}
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
      // Ensure all optional fields are JSON-serializable for Next.js SSR props.
      template: JSON.parse(JSON.stringify(template)),
    },
  };
};
