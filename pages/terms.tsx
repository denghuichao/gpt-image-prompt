import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { resolveLocale } from "../utils/i18n";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const TermsPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const isEn = locale === "en";
  const localeTyped = isEn ? "en" : "zh";
  const canonical = absoluteUrl("/terms", localeTyped);
  const hreflangs = buildHrefLang("/terms");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@gptimageprompt.xyz";

  return (
    <>
      <Head>
        <title>{isEn ? "Terms of Service | AI Image Prompt Hub" : "服务条款 | AI Image Prompt Hub"}</title>
        <meta
          name="description"
          content={isEn ? "Terms of Service for AI Image Prompt Hub." : "AI Image Prompt Hub 的服务条款。"}
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
                {isEn ? "Legal" : "法律文档"}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold italic text-night-50">
                {isEn ? "Terms of Service" : "服务条款"}
              </h1>
              <p className="mt-3 text-xs text-night-500">
                {isEn ? "Last updated: April 30, 2026" : "最后更新：2026年4月30日"}
              </p>
            </div>

            <div className="space-y-7 text-sm leading-7 text-night-300">
              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "Acceptance of Terms" : "条款接受"}
                </h2>
                <p>
                  {isEn
                    ? "By using AI Image Prompt Hub, you agree to comply with these terms and all applicable laws."
                    : "使用 AI Image Prompt Hub 即表示你同意遵守本条款及适用法律法规。"}
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "Credits & Billing" : "积分与计费"}
                </h2>
                <ul className="list-disc space-y-1 pl-5 marker:text-night-500">
                  <li>
                    {isEn
                      ? "Prompt template browsing is free."
                      : "Prompt 模板浏览免费。"}
                  </li>
                  <li>
                    {isEn
                      ? "Image generation may require credits."
                      : "生图功能可能需要积分。"}
                  </li>
                  <li>
                    {isEn
                      ? "Credit packs are one-time purchases."
                      : "积分包为一次性购买。"}
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "Allowed Use" : "使用规范"}
                </h2>
                <p>
                  {isEn
                    ? "Credits are consumed per generation request according to product rules. Misuse, abuse, or illegal content generation is prohibited."
                    : "积分按产品规则在生图请求时扣减。禁止滥用服务或生成违法违规内容。"}
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "Service Changes" : "服务变更"}
                </h2>
                <p>
                  {isEn
                    ? "We may suspend accounts that violate these terms. Service functionality may change over time."
                    : "如违反条款，我们可能暂停账户。服务功能可能随时间调整。"}
                </p>
              </section>

              <section className="rounded-2xl border border-night-700/70 bg-night-950/40 p-4">
                <h2 className="mb-1 text-base font-semibold text-night-100">
                  {isEn ? "Contact" : "联系我们"}
                </h2>
                <p>
                  {isEn
                    ? `For support, contact: ${supportEmail}`
                    : `如需支持，请联系：${supportEmail}`}
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default TermsPage;
