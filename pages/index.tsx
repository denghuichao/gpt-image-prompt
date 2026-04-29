import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";

const Home: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const content = dict.landing;

  return (
    <>
      <Head>
        <title>{dict.home.title}</title>
        <meta name="description" content={dict.home.description} />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,#22d3ee22,transparent_36%),radial-gradient(circle_at_bottom_left,#34d39918,transparent_45%),linear-gradient(145deg,#0f172a,#111827_45%,#0a0a0a)] p-8 sm:p-12 lg:p-14">
          <div className="absolute -top-24 right-10 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 left-12 h-48 w-48 rounded-full border border-white/10" />

          <p className="relative inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
            {content.badge}
          </p>

          <h1 className="relative mt-5 max-w-4xl text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {content.heroTitleLine1}
            <br className="hidden sm:block" />
            {content.heroTitleLine2}
          </h1>

          <p className="relative mt-5 max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base lg:text-lg">
            {content.heroDesc}
          </p>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <Link
              href="/gallery"
              locale={locale}
              className="rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              {content.ctaGallery}
            </Link>
            <Link
              href="/build"
              locale={locale}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {content.ctaBuild}
            </Link>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {content.valueCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{card.desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{content.workflowLabel}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{content.workflowTitle}</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {content.workflow.map((item) => (
              <div key={item.step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-cyan-200">{item.step}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{content.caseLabel}</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{content.caseTitle}</h2>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {content.caseStudies.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-white/60">{item.scene}</p>

                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">{content.beforeLabel}</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/35 p-2 text-xs text-white/70">
                    {item.before}
                  </pre>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/45">{content.afterLabel}</p>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg border border-cyan-300/20 bg-cyan-400/10 p-2 text-xs text-cyan-100">
                    {item.after}
                  </pre>
                </div>

                <p className="mt-3 text-sm text-emerald-200">{item.impact}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{content.faqLabel}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{content.faqTitle}</h2>
            <div className="mt-5 space-y-3">
              {content.faqs.map((item) => (
                <details key={item.q} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <summary className="cursor-pointer text-sm font-semibold">{item.q}</summary>
                  <p className="mt-2 text-sm text-white/70">{item.a}</p>
                </details>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{content.trustLabel}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{content.trustTitle}</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {content.trustItems.map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs text-white/80">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm text-white/70">{content.trustDesc}</p>
          </article>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-400/10 via-emerald-300/10 to-sky-400/10 p-8 text-center sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">{content.bottomTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75 sm:text-base">{content.bottomDesc}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/gallery"
              locale={locale}
              className="rounded-full border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              {content.bottomCta1}
            </Link>
            <Link
              href="/build"
              locale={locale}
              className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {content.bottomCta2}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
