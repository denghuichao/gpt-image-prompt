import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import CopyButton from "../../components/CopyButton";
import { resolveLocale, t } from "../../utils/i18n";
import {
  getPromptTemplateBySlug,
  type PromptTemplate,
} from "../../utils/promptTemplates";

const PromptDetailPage: NextPage<{ template: PromptTemplate }> = ({ template }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const images = template.images;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

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
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* Left: metadata & prompts — flat layout, no nested cards */}
          <section className="flex flex-col gap-6">
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
              <pre className="whitespace-pre-wrap rounded-xl border border-night-700 bg-night-950/60 p-4 font-mono text-xs leading-relaxed text-night-300">
                {template.prompt_template}
              </pre>
            </div>

            {/* Final prompt */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-glow-500">
                {dict.promptDetail.finalPrompt}
              </p>
              <pre className="whitespace-pre-wrap rounded-xl border border-glow-500/20 bg-glow-500/5 p-4 font-mono text-xs leading-relaxed text-night-200">
                {template.final_prompt || template.prompt_template}
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
              <CopyButton text={template.final_prompt || template.prompt_template} />
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
          <section>
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
                  <Image
                    src={imageUrl}
                    alt={`${template.title} sample ${idx + 1}`}
                    width={1200}
                    height={1600}
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
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-night-950/92 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-night-600 bg-night-900/80 p-3 text-night-200 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50 sm:left-8"
            aria-label="Previous"
          >
            ←
          </button>

          <div
            className="relative mx-16 max-h-[90vh] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${template.title} sample ${lightboxIndex + 1}`}
              width={1200}
              height={1600}
              className="max-h-[90vh] w-auto rounded-2xl object-contain shadow-[0_0_80px_rgba(0,0,0,0.8)]"
            />
            <p className="mt-3 text-center font-mono text-[11px] text-night-500">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-night-600 bg-night-900/80 p-3 text-night-200 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50 sm:right-8"
            aria-label="Next"
          >
            →
          </button>

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full border border-night-600 bg-night-900/80 px-3 py-1.5 text-xs text-night-400 transition hover:text-night-50 sm:right-8"
          >
            esc
          </button>
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

  return { props: { template } };
};
