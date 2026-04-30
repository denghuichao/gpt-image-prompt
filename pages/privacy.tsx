import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { resolveLocale } from "../utils/i18n";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const PrivacyPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const isEn = locale === "en";
  const localeTyped = isEn ? "en" : "zh";
  const canonical = absoluteUrl("/privacy", localeTyped);
  const hreflangs = buildHrefLang("/privacy");
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@gptimageprompt.xyz";

  return (
    <>
      <Head>
        <title>{isEn ? "Privacy Policy | AI Image Prompt Hub" : "隐私政策 | AI Image Prompt Hub"}</title>
        <meta
          name="description"
          content={isEn ? "Privacy Policy for AI Image Prompt Hub." : "AI Image Prompt Hub 的隐私政策。"}
        />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.12),transparent_62%)]" />
        <section className="mx-auto w-full max-w-4xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-night-700/70 bg-night-900/60 p-6 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8">
            <div className="mb-8 border-b border-night-700/70 pb-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-night-500">
                {isEn ? "Legal" : "法律文档"}
              </p>
              <h1 className="mt-2 font-display text-4xl font-semibold italic text-night-50">
                {isEn ? "Privacy Policy" : "隐私政策"}
              </h1>
              <p className="mt-3 text-xs text-night-500">
                {isEn ? "Last updated: April 30, 2026" : "最后更新：2026年4月30日"}
              </p>
            </div>

            <div className="space-y-7 text-sm leading-7 text-night-300">
              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "What We Collect" : "我们收集的信息"}
                </h2>
                <ul className="list-disc space-y-1 pl-5 marker:text-night-500">
                  <li>
                    {isEn
                      ? "Account information (such as your email from Clerk)"
                      : "账户信息（如来自 Clerk 的邮箱）"}
                  </li>
                  <li>
                    {isEn
                      ? "Usage data for template browsing and image generation"
                      : "模板浏览与生图使用数据"}
                  </li>
                  <li>
                    {isEn
                      ? "Transaction-related records for credit purchases"
                      : "积分购买相关交易记录"}
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "How We Use Data" : "数据使用方式"}
                </h2>
                <p>
                  {isEn
                    ? "We use this data to provide authentication, template management, image generation, payment confirmation, and account credit balance display."
                    : "这些数据用于身份验证、模板管理、生图服务、支付确认以及账户积分余额展示。"}
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "Third-Party Services" : "第三方服务"}
                </h2>
                <p>
                  {isEn
                    ? "Template images and generated images may be stored in Supabase Storage. Payment processing is handled by Creem. Authentication is handled by Clerk."
                    : "模板图片和生成图片可能存储在 Supabase Storage。支付由 Creem 处理，身份认证由 Clerk 处理。"}
                </p>
              </section>

              <section>
                <h2 className="mb-2 text-base font-semibold text-night-100">
                  {isEn ? "Policy Updates" : "政策更新"}
                </h2>
                <p>
                  {isEn
                    ? "We do not sell your personal information. We may update this policy from time to time."
                    : "我们不会出售你的个人信息。我们可能会不时更新本政策。"}
                </p>
              </section>

              <section className="rounded-2xl border border-night-700/70 bg-night-950/40 p-4">
                <h2 className="mb-1 text-base font-semibold text-night-100">
                  {isEn ? "Contact" : "联系我们"}
                </h2>
                <p>
                  {isEn
                    ? `If you have questions, contact us at: ${supportEmail}`
                    : `如有问题，请联系：${supportEmail}`}
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default PrivacyPage;
