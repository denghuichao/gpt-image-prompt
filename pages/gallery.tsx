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
    if (!normalized) {
      return templates;
    }

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
          <section className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/75">
            {dict.gallery.noResults} "{query}".
          </section>
        ) : (
          <section className="columns-1 gap-5 sm:columns-2 xl:columns-3 2xl:columns-4">
            {filteredTemplates.map((template) => (
              <article
                key={template.slug}
                className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-highlight"
              >
                <Link href={`/prompts/${template.slug}`} locale={locale} className="block">
                  <div className="relative">
                    <Image
                      src={template.images[0]}
                      alt={`${template.title} sample image`}
                      width={1200}
                      height={1600}
                      className="h-auto w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 opacity-90" />

                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                        {template.style || dict.common.uncategorized}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold leading-tight">{template.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm text-white/75">{template.desc}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${template.slug}-${tag}`}
                            className="rounded-full border border-white/25 bg-black/30 px-2.5 py-1 text-xs text-white/85"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-end bg-black/85 p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
                          {dict.common.finalPromptPreview}
                        </p>
                        <p className="line-clamp-6 text-sm leading-relaxed text-white/90">
                          {template.final_prompt || template.prompt_template}
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
