import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const TermsPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/terms", localeTyped);
  const hreflangs = buildHrefLang("/terms");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@imagepromptbase.xyz";

  return (
    <>
      <Head>
        <title>{dict.termsPage.title} | AI Image Prompt Gallery</title>
        <meta
          name="description"
          content={dict.termsPage.metaDescription}
        />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_62%)]" />
        <section className="mx-auto w-full max-w-4xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-night-700/70 bg-night-900/60 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
            <div className="mb-8 border-b border-night-700/70 pb-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-night-500">
                {dict.termsPage.legalBadge}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold italic text-night-50">
                {dict.termsPage.title}
              </h1>
              <p className="mt-3 text-xs text-night-500">
                {dict.termsPage.lastUpdated}
              </p>
            </div>

            <div className="space-y-7 text-sm leading-7 text-night-300">
              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {dict.termsPage.sectionAcceptanceTitle}
                </h2>
                <p>{dict.termsPage.sectionAcceptanceBody}</p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {dict.termsPage.sectionBillingTitle}
                </h2>
                <ul className="list-disc space-y-1 pl-5 marker:text-night-500">
                  {dict.termsPage.billingItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {dict.termsPage.sectionAllowedUseTitle}
                </h2>
                <p>{dict.termsPage.sectionAllowedUseBody}</p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {dict.termsPage.sectionChangesTitle}
                </h2>
                <p>{dict.termsPage.sectionChangesBody}</p>
              </section>

              <section className="rounded-2xl border border-night-700/70 bg-night-950/40 p-4">
                <h2 className="mb-1 text-base font-semibold text-night-100">
                  {dict.termsPage.contactTitle}
                </h2>
                <p>{dict.termsPage.contactBodyPrefix}{supportEmail}</p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default TermsPage;
