import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import fs from "fs";
import path from "path";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";
import { pricingConfig } from "../utils/pricingConfig";
import { absoluteUrl, buildHrefLang, safeJsonLd } from "../utils/seo";

const SHUFFLE_BATCH_SIZE = 12;
const SHUFFLE_INTERVAL_MS = 20000;
const SHUFFLE_STAGGER_MS = 70;
const SHUFFLE_TRANSITION_MS = 420;

const Home: NextPage<{ previewImages: string[] }> = ({ previewImages }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const c = dict.landing;
  const isEn = locale === "en";
  const seoDescription = dict.home.seoDescription;
  const seoKeywords = dict.home.seoKeywords;
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/", localeTyped);
  const hreflangs = buildHrefLang("/");
  const ogImage = absoluteUrl("/prompt_images/1.jpeg", localeTyped);
  const [visibleImages, setVisibleImages] = useState<string[]>(previewImages.slice(0, SHUFFLE_BATCH_SIZE));
  const [shuffleState, setShuffleState] = useState<"idle" | "out" | "in-prep" | "in">("idle");

  function pickRandomBatch(source: string[], size: number, previous: string[] = []) {
    if (source.length <= size) return source.slice();
    const pool = source.filter((item) => !previous.includes(item));
    const candidates = pool.length >= size ? pool : source;
    const shuffled = candidates.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  }

  useEffect(() => {
    if (previewImages.length === 0) return;
    setVisibleImages(pickRandomBatch(previewImages, SHUFFLE_BATCH_SIZE));
  }, [previewImages]);

  useEffect(() => {
    if (previewImages.length <= SHUFFLE_BATCH_SIZE) return;
    const outTotal = SHUFFLE_TRANSITION_MS + SHUFFLE_STAGGER_MS * (SHUFFLE_BATCH_SIZE - 1);
    const inTotal = SHUFFLE_TRANSITION_MS + SHUFFLE_STAGGER_MS * (SHUFFLE_BATCH_SIZE - 1);
    let inTimer: number | null = null;

    const interval = window.setInterval(() => {
      setShuffleState("out");
      window.setTimeout(() => {
        setVisibleImages((prev) => pickRandomBatch(previewImages, SHUFFLE_BATCH_SIZE, prev));
        setShuffleState("in-prep");
        window.requestAnimationFrame(() => {
          setShuffleState("in");
          inTimer = window.setTimeout(() => setShuffleState("idle"), inTotal + 40);
        });
      }, outTotal + 30);
    }, SHUFFLE_INTERVAL_MS);
    return () => {
      window.clearInterval(interval);
      if (inTimer) window.clearTimeout(inTimer);
    };
  }, [previewImages]);

  function cardMotion(index: number) {
    const outDelay = index * SHUFFLE_STAGGER_MS;
    const inDelay = (SHUFFLE_BATCH_SIZE - 1 - index) * SHUFFLE_STAGGER_MS;
    const delay = shuffleState === "out" ? outDelay : (shuffleState === "in" ? inDelay : 0);
    const hidden = shuffleState === "out" || shuffleState === "in-prep";
    return {
      className: hidden
        ? "opacity-0 translate-y-2 scale-[0.985] blur-[1px]"
        : "opacity-100 translate-y-0 scale-100 blur-0",
      style: {
        transitionDelay: `${delay}ms`,
        transitionDuration: `${SHUFFLE_TRANSITION_MS}ms`,
      } as CSSProperties,
    };
  }

  return (
    <>
      <Head>
        <title>{dict.home.title}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AI Image Prompt Hub" />
        <meta property="og:title" content={dict.home.title} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={dict.home.title} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AI Image Prompt Hub",
              url: absoluteUrl("/", "zh"),
              inLanguage: ["zh-CN", "en"],
              description: seoDescription,
              keywords: seoKeywords,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "AI Image Prompt Hub",
              url: absoluteUrl("/", "zh"),
              logo: ogImage,
            }),
          }}
        />
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
              <Link
                href="/pricing"
                locale={locale}
                className="inline-flex items-center gap-2 rounded-full border border-night-600 px-7 py-3.5 text-sm font-semibold text-night-200 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50"
              >
                {c.ctaPricing}
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. GALLERY PREVIEW ──────────────────────────────────────── */}
        <section className="pb-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
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
            {visibleImages.map((src, idx) => {
              const motion = cardMotion(idx);
              return (
              <div
                key={`${src}-${idx}`}
                className={`group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-night-700 bg-night-800 transition-[opacity,transform,filter,border-color,box-shadow] ease-out hover:border-glow-500/30 hover:shadow-card-hover ${motion.className}`}
                style={motion.style}
              >
                <div className="relative">
                  <Image
                    src={src}
                    alt={`prompt image ${idx + 1}`}
                    width={600}
                    height={800}
                    className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/70 via-transparent to-transparent" />
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. PROBLEM ──────────────────────────────────────────────── */}
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

        {/* ── 4. FEATURES ─────────────────────────────────────────────── */}
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

        {/* ── 5. HOW IT WORKS ─────────────────────────────────────────── */}
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

        {/* ── 6. PRICING PREVIEW ─────────────────────────────────────── */}
        <section className="pb-24">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
                {c.pricingTitle}
              </h2>
              <p className="mt-2 text-sm text-night-400">
                {c.pricingDesc}
              </p>
            </div>
            <Link
              href="/pricing"
              locale={locale}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-night-600 px-5 py-2.5 text-sm font-semibold text-night-300 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50"
            >
              {c.pricingViewFull}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pricingConfig.plans.map((plan) => {
              const title = isEn ? plan.name_en : plan.name_zh;
              const label = isEn ? plan.label_en : plan.label_zh;
              const features = (isEn ? plan.features_en : plan.features_zh);
              return (
                <article
                  key={plan.key}
                  className={`relative flex flex-col overflow-hidden rounded-2xl p-6 ${
                    plan.highlight
                      ? "border border-glow-500/30 bg-night-900/70 shadow-[0_0_64px_rgba(251,191,36,0.08)]"
                      : "card-glow border border-night-700 bg-night-900/70"
                  }`}
                >
                  {plan.highlight && (
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.07),transparent_60%)]" />
                  )}

                  <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${plan.highlight ? "text-glow-400" : "text-night-500"}`}>
                    {label}
                  </p>
                  {plan.highlight && (
                    <span className="absolute right-4 top-4 rounded-full border border-glow-500/40 bg-glow-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-glow-300">
                      {c.pricingRecommended}
                    </span>
                  )}
                  <h3 className="mt-2 font-display text-2xl font-semibold italic text-night-50">{title}</h3>
                  <p className={`mt-4 font-display text-5xl font-bold italic ${plan.highlight ? "text-glow-400" : "text-night-50"}`}>
                    {plan.price_usd === 0 ? "$0" : `$${plan.price_usd}`}
                  </p>
                  <ul className={`mt-7 flex-1 space-y-3.5 border-t pt-6 ${plan.highlight ? "border-glow-500/20" : "border-night-700/60"}`}>
                    {features.map((feature) => (
                      <li key={`${plan.key}-${feature}`} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-night-200" : "text-night-300"}`}>
                        <span className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${plan.highlight ? "bg-glow-500" : "bg-night-500"}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
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
            <Link
              href="/pricing"
              locale={locale}
              className="inline-flex items-center gap-2 rounded-full border border-night-600 px-8 py-3.5 text-sm font-semibold text-night-200 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50"
            >
              {c.bottomBuyCredits}
            </Link>
          </div>
        </section>

      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const rootDir = path.join(process.cwd(), "public", "prompt_images");
  const exts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
  const collected: string[] = [];

  function walk(dir: string, baseUrl: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const rel = `${baseUrl}/${entry.name}`.replace(/\\/g, "/");
      if (entry.isDirectory()) {
        walk(abs, rel);
        continue;
      }
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        collected.push(rel);
      }
    }
  }

  walk(rootDir, "/prompt_images");

  const previewImages = collected.slice(0, 30);
  return { props: { previewImages } };
};
