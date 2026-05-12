import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PromptTemplate } from "../utils/promptTemplates";
import { resolveLocale, t } from "../utils/i18n";
import ProgressiveMediaCard from "./ProgressiveMediaCard";
import type { RefObject } from "react";

function normalizePromptText(input: string) {
  return String(input || "").replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
}

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

type PromptMasonryGridProps = {
  templates: PromptTemplate[];
  locale: "zh" | "en";
  onLoadMoreSentinelRef?: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDesc?: string;
  linkBuilder?: (slug: string) => string;
};

export default function PromptMasonryGrid({
  templates,
  locale,
  onLoadMoreSentinelRef,
  isLoading = false,
  emptyTitle,
  emptyDesc,
  linkBuilder,
}: PromptMasonryGridProps) {
  const dict = t(locale);
  const linkToPrompt = linkBuilder || ((slug: string) => `/prompts/${slug}`);

  if (templates.length === 0) {
    return (
      <section className="py-20 text-center">
        <p className="font-display text-xl italic text-night-400">
          {emptyTitle || dict.gallery.noResults}
        </p>
        {emptyDesc && (
          <p className="mt-2 text-sm text-night-500">{emptyDesc}</p>
        )}
      </section>
    );
  }

  return (
    <>
      <section className="columns-2 gap-3 sm:columns-3 xl:columns-4 2xl:columns-5">
        {templates.map((template) => (
          <article
            key={template.slug}
            className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl border border-night-700 bg-night-800 shadow-card transition-all duration-300 hover:border-glow-500/30 hover:shadow-card-hover"
          >
            <Link href={linkToPrompt(template.slug)} locale={locale} className="block">
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

      {onLoadMoreSentinelRef && <div ref={onLoadMoreSentinelRef} className="h-10" aria-hidden="true" />}

      {isLoading && (
        <div className="py-5 text-center">
          <span className="inline-flex items-center gap-2 text-xs text-night-500">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-night-500 border-t-transparent" />
            {dict.gallery.loading}
          </span>
        </div>
      )}
    </>
  );
}
