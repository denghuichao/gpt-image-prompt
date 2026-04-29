import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";

const PricingPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);

  const content =
    locale === "en"
      ? {
          title: "Pricing | AI Image Prompt Hub",
          heading: "Pricing",
          desc: "Browsing prompt templates is free. AI image generation in Build will be a paid feature.",
          freeTitle: "Free",
          freePrice: "$0",
          freeItems: [
            "Browse all prompt templates",
            "Search by tags/title/description/prompt",
            "View template details and sample images",
          ],
          proTitle: "Build Pro",
          proPrice: "Paid (Coming Soon)",
          proItems: [
            "AI image generation in Build",
            "Conversation persistence per user",
            "Advanced rendering controls",
          ],
        }
      : {
          title: "定价 | AI Image Prompt Hub",
          heading: "定价",
          desc: "浏览 Prompt 模板永久免费。Build 生图功能将采用付费模式。",
          freeTitle: "免费版",
          freePrice: "¥0",
          freeItems: [
            "浏览全部 Prompt 模板",
            "按标签/标题/描述/Prompt 搜索",
            "查看模板详情与示例图",
          ],
          proTitle: "Build Pro",
          proPrice: "付费（即将上线）",
          proItems: [
            "Build 中的 AI 生图能力",
            "按用户持久化对话记录",
            "更高级的出图参数控制",
          ],
        };

  return (
    <>
      <Head>
        <title>{content.title}</title>
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-10 text-white sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{content.heading}</h1>
        <p className="mt-3 max-w-3xl text-white/70">{content.desc}</p>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold">{content.freeTitle}</h2>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{content.freePrice}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {content.freeItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-6">
            <h2 className="text-xl font-semibold">{content.proTitle}</h2>
            <p className="mt-2 text-2xl font-bold text-cyan-200">{content.proPrice}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/85">
              {content.proItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </article>
        </section>

        <Link
          href="/gallery"
          locale={locale}
          className="mt-8 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          {dict.common.backToTemplates}
        </Link>
      </main>
    </>
  );
};

export default PricingPage;
