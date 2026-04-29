import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";
import { getPromptTemplates, type PromptTemplate } from "../utils/promptTemplates";

const Home: NextPage<{ previewTemplates: PromptTemplate[] }> = ({ previewTemplates }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const c = dict.landing;

  return (
    <>
      <Head>
        <title>{dict.home.title}</title>
        <meta name="description" content={dict.home.description} />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 sm:px-6 lg:px-8">

        {/* ── 1. HERO ─────────────────────────────────────────────────── */}
        <section className="relative pb-20 pt-28 lg:pt-40">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-glow-500">{c.heroEyebrow}</p>
            <h1 className="mt-5 font-display text-5xl font-semibold italic leading-[1.06] tracking-tight text-night-50 sm:text-6xl lg:text-7xl xl:text-[80px]">
              {c.heroTitle}
              <br />
              <span className="text-glow-300">{c.heroTitleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-night-400 lg:text-lg">
              {c.heroDesc}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/gallery"
                locale={locale}
                className="inline-flex items-center gap-2 rounded-full bg-glow-500 px-7 py-3.5 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400 hover:shadow-glow-md"
              >
                {c.ctaGallery}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. PROBLEM ──────────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-night-500">{c.problemLabel}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
                {c.problemTitle}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-night-400">{c.problemDesc}</p>
            </div>
            <div className="space-y-3">
              {c.problems.map((p, i) => (
                <div key={i} className="flex gap-4 rounded-2xl border border-night-700/60 bg-night-900/50 p-5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-night-800 font-mono text-[10px] text-night-500">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-night-100">{p.title}</p>
                    <p className="mt-1 text-sm text-night-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. FEATURES ─────────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="mb-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-glow-500">{c.solutionLabel}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
              {c.solutionTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-night-400">{c.solutionDesc}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {c.features.map((f, i) => (
              <div key={i} className="card-glow rounded-2xl border border-night-700 bg-night-900/60 p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-glow-500">{f.eyebrow}</p>
                <h3 className="mt-3 font-display text-xl font-semibold italic text-night-50">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-night-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="pb-24">
          <div className="mb-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-night-500">{c.howLabel}</p>
            <h2 className="mt-3 font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
              {c.howTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-night-400">{c.howDesc}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {c.steps.map((step, i) => (
              <div key={i} className="relative rounded-2xl border border-night-700 bg-night-900/60 p-6">
                {i < c.steps.length - 1 && (
                  <span className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 text-night-700 xl:block">→</span>
                )}
                <p className="font-display text-5xl font-bold italic text-night-800">{step.step}</p>
                <h3 className="mt-4 text-sm font-semibold text-night-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-night-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. GALLERY PREVIEW ──────────────────────────────────────── */}
        <section className="pb-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-night-500">{c.galleryLabel}</p>
              <h2 className="mt-3 font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
                {c.galleryTitle}
              </h2>
              <p className="mt-2 text-sm text-night-400">{c.galleryDesc}</p>
            </div>
            <Link
              href="/gallery"
              locale={locale}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-night-600 px-5 py-2.5 text-sm font-semibold text-night-300 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50"
            >
              {c.galleryCtaLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
            {previewTemplates.map((template) => (
              <Link
                key={template.slug}
                href={`/prompts/${template.slug}`}
                locale={locale}
                className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-night-700 bg-night-800 transition-all hover:border-glow-500/30 hover:shadow-card-hover"
              >
                <div className="relative">
                  <Image
                    src={template.images[0]}
                    alt={template.title}
                    width={600}
                    height={800}
                    className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-night-100">{template.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 7. BOTTOM CTA ───────────────────────────────────────────── */}
        <section className="mb-24 overflow-hidden rounded-3xl border border-glow-500/20 bg-night-900/80 px-8 py-20 text-center shadow-[0_0_80px_rgba(251,191,36,0.06)] backdrop-blur-sm sm:px-12">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold italic text-night-50 sm:text-4xl lg:text-5xl">
            {c.bottomTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-night-400">
            {c.bottomDesc}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/gallery"
              locale={locale}
              className="inline-flex items-center gap-2 rounded-full bg-glow-500 px-8 py-3.5 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400 hover:shadow-glow-md"
            >
              {c.bottomCta1}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async () => {
  const all = getPromptTemplates();
  const previewTemplates = all.slice(0, 15);
  return { props: { previewTemplates } };
};
