import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import SupportChannels from "../components/SupportChannels";
import { resolveLocale, t } from "../utils/i18n";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const SupportPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/support", localeTyped);
  const hreflangs = buildHrefLang("/support");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@imagepromptbase.xyz";

  return (
    <>
      <Head>
        <title>{dict.supportPage.title} | Image Prompt Base</title>
        <meta name="description" content={dict.supportPage.metaDescription} />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.14),transparent_62%)]" />
        <div className="mx-auto max-w-5xl pt-8">
          <div className="rounded-[32px] border border-night-700/70 bg-night-900/60 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur md:p-12">
            <div>
              <div className="inline-flex rounded-full border border-night-700/70 bg-night-950/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-night-400">
                {dict.supportPage.badge}
              </div>
              <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold italic tracking-tight text-night-50 md:text-5xl">
                {dict.supportPage.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-night-300 md:text-lg">
                {dict.supportPage.introPrefix} <span className="text-night-50">{supportEmail}</span>
                {locale === "zh" ? "。" : "."}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-night-400 md:text-base">
                {dict.supportPage.secondaryText}
              </p>
            </div>

            <div className="mt-12">
              <div className="mb-5">
                <div className="text-sm font-medium text-night-100">
                  {dict.supportPage.channelsTitle}
                </div>
                <div className="mt-1 text-sm text-night-400">
                  {dict.supportPage.channelsDescription}
                </div>
              </div>
              <SupportChannels variant="cards" />
            </div>

            <div className="mt-12 flex justify-start">
              <Link
                href="/"
                locale={locale}
                className="inline-flex items-center rounded-full border border-night-700/70 bg-night-950/40 px-4 py-2 text-sm text-night-100 transition hover:bg-night-900"
              >
                {dict.supportPage.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SupportPage;
