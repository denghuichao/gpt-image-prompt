import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { resolveLocale, t } from "../utils/i18n";
import { getPromptTemplates, type PromptTemplate } from "../utils/promptTemplates";

function buildSearchText(template: PromptTemplate): string {
  return [
    template.title,
    template.desc,
    template.prompt_template,
    template.final_prompt || "",
    template.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

const GalleryPage: NextPage<{ templates: PromptTemplate[] }> = ({ templates }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const query = typeof router.query.q === "string" ? router.query.q : "";

  const filteredTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return templates;
    return templates.filter((template) => buildSearchText(template).includes(normalized));
  }, [query, templates]);

  return (
    <>
      <Head>
        <title>{dict.gallery.title}</title>
        <meta name="description" content={dict.gallery.description} />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        {filteredTemplates.length === 0 ? (
          <section className="rounded-2xl border border-night-700 bg-night-900/60 p-16 text-center">
            <p className="font-display text-2xl italic text-night-500">
              {dict.gallery.noResults}{" "}
              <span className="text-night-200">"{query}"</span>
            </p>
          </section>
        ) : (
          <section className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
            {filteredTemplates.map((template) => (
              <article
                key={template.slug}
                className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-night-700 bg-night-800 shadow-card transition-all duration-300 hover:border-glow-500/30 hover:shadow-card-hover"
              >
                <Link href={`/prompts/${template.slug}`} locale={locale} className="block">
                  <div className="relative">
                    <Image
                      src={template.images[0]}
                      alt={`${template.title} sample image`}
                      width={1200}
                      height={1600}
                      className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/90 via-night-950/20 to-transparent" />

                    {/* Default info — fades out on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 group-hover:opacity-0">
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

                    {/* Hover overlay — full prompt preview */}
                    <div className="absolute inset-0 flex flex-col justify-end rounded-2xl bg-night-950/94 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-night-500">
                        {dict.common.finalPromptPreview}
                      </p>
                      <p className="line-clamp-8 font-mono text-[11px] leading-relaxed text-night-200">
                        {template.final_prompt || template.prompt_template}
                      </p>
                      <div className="mt-4 flex items-center gap-2 border-t border-night-700/60 pt-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-glow-500" />
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-glow-400">
                          View Template →
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default GalleryPage;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      templates: getPromptTemplates(),
    },
  };
};
