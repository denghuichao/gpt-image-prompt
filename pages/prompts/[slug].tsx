import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import CopyButton from "../../components/CopyButton";
import { resolveLocale, t } from "../../utils/i18n";
import {
  getPromptTemplateBySlug,
  getPromptTemplates,
  type PromptTemplate,
} from "../../utils/promptTemplates";

const PromptDetailPage: NextPage<{ template: PromptTemplate }> = ({ template }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);

  return (
    <>
      <Head>
        <title>{`${template.title} ${dict.promptDetail.titleSuffix}`}</title>
        <meta name="description" content={template.desc} />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/"
            locale={locale}
            className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10"
          >
            {dict.common.backToTemplates}
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {template.style || dict.common.uncategorized}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
              {template.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75">{template.desc}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <span
                  key={`${template.slug}-${tag}`}
                  className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/90"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {dict.promptDetail.author}
                </dt>
                <dd className="text-white/85">{template.author}</dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {dict.promptDetail.sourceUrl}
                </dt>
                <dd className="text-white/85 break-all">
                  <a href={template.source_url} target="_blank" rel="noreferrer" className="underline decoration-white/30 hover:decoration-white">
                    {template.source_url}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {dict.promptDetail.promptTemplate}
                </dt>
                <dd>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-white/90">
                    {template.prompt_template}
                  </pre>
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {dict.promptDetail.finalPrompt}
                </dt>
                <dd>
                  <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/60 p-4 text-xs leading-relaxed text-white/95">
                    {template.final_prompt || template.prompt_template}
                  </pre>
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {dict.promptDetail.variables}
                </dt>
                <dd className="space-y-2">
                  {(template.variables || []).map((variable) => (
                    <div
                      key={`${template.slug}-${variable.key}`}
                      className="rounded-lg border border-white/10 bg-black/30 p-3"
                    >
                      <p className="text-xs font-semibold text-white">{`{${variable.key}}`}</p>
                      <p className="mt-1 text-xs text-white/70">{variable.description}</p>
                      <p className="mt-1 text-xs text-white/55">{dict.promptDetail.example}: {variable.example}</p>
                    </div>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <CopyButton text={template.final_prompt || template.prompt_template} />
              <Link
                href={{
                  pathname: "/build",
                  query: { template: template.slug },
                }}
                locale={locale}
                className="rounded-lg border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                {dict.promptDetail.buildButton}
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {dict.common.sampleImages}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {template.images.map((imageUrl, idx) => (
                <figure key={`${template.slug}-${imageUrl}`} className="overflow-hidden rounded-xl">
                  <Image
                    src={imageUrl}
                    alt={`${template.title} sample ${idx + 1}`}
                    width={1200}
                    height={1600}
                    className="h-auto w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default PromptDetailPage;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: getPromptTemplates().flatMap((template) => [
      { params: { slug: template.slug }, locale: "zh" },
      { params: { slug: template.slug }, locale: "en" },
    ]),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const slug = String(context.params?.slug || "");
  const template = getPromptTemplateBySlug(slug);

  if (!template) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      template,
    },
  };
};
