import type { NextPage } from "next";
import Head from "next/head";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";
import { pricingConfig } from "../utils/pricingConfig";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const PricingPage: NextPage = () => {
  const router = useRouter();
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { isLoaded, isSignedIn } = useAuth();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/pricing", localeTyped);
  const hreflangs = buildHrefLang("/pricing");
  const dict = t(locale);
  const isEn = locale === "en";
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [buyError, setBuyError] = useState("");
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<
    "idle" | "confirming" | "confirmed" | "already" | "error"
  >("idle");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showSuccessNotice, setShowSuccessNotice] = useState(false);
  const confirmStartedRef = useRef(false);

  const success = router.query.success === "1";
  const successPlan = router.query.plan as string | undefined;
  const canceled = router.query.canceled === "1";
  const querySignature = typeof router.query.signature === "string" ? router.query.signature : "";
  const queryCheckoutId = typeof router.query.checkout_id === "string" ? router.query.checkout_id : "";

  useEffect(() => {
    let cancelled = false;
    async function loadCredits() {
      try {
        const res = await fetch("/api/credits");
        if (!res.ok) return;
        const data = await res.json() as { credits?: { balance?: number } };
        if (!cancelled) setCreditBalance(data.credits?.balance ?? 0);
      } catch {
        // ignore
      }
    }
    void loadCredits();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!router.isReady || !success || !isLoaded) return;
    if (confirmStartedRef.current) return;
    confirmStartedRef.current = true;

    if (!querySignature || !queryCheckoutId) {
      setConfirmState("error");
      setConfirmMessage(
        isEn
          ? "Missing callback signature or checkout id, cannot confirm payment."
          : "缺少回调签名或 checkout id，无法确认支付。",
      );
      return;
    }

    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(router.query)) {
      if (typeof value === "string") payload[key] = value;
    }

    async function confirmCheckout() {
      setConfirmState("confirming");
      setConfirmMessage("");

      try {
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json() as {
          error?: string;
          alreadyProcessed?: boolean;
          credits?: { balance?: number };
        };
        if (!res.ok) {
          setConfirmState("error");
          setConfirmMessage(
            data.error
              ? `${isEn ? "Payment confirmation failed" : "支付确认失败"}: ${data.error}`
              : (isEn ? "Payment confirmation failed." : "支付确认失败。"),
          );
          return;
        }
        if (typeof data.credits?.balance === "number") {
          setCreditBalance(data.credits.balance);
        }
        try {
          const latest = await fetch("/api/credits", { cache: "no-store" });
          if (latest.ok) {
            const latestData = await latest.json() as { credits?: { balance?: number } };
            if (typeof latestData.credits?.balance === "number") {
              setCreditBalance(latestData.credits.balance);
            }
          }
        } catch {
          // ignore refresh failure
        }
        if (data.alreadyProcessed) {
          setConfirmState("already");
          setShowSuccessNotice(true);
          setConfirmMessage(
            isEn
              ? "Purchase successful."
              : "购买成功。",
          );
        } else {
          setConfirmState("confirmed");
          setShowSuccessNotice(true);
          setConfirmMessage(
            isEn
              ? "Purchase successful."
              : "购买成功。",
          );
        }
      } catch {
        setConfirmState("error");
        setConfirmMessage(isEn ? "Network error during payment confirmation." : "支付确认网络异常。");
      }
    }

    void confirmCheckout();
  }, [
    router.isReady,
    success,
    isLoaded,
    isEn,
    querySignature,
    queryCheckoutId,
  ]);

  useEffect(() => {
    if (confirmState !== "confirmed" && confirmState !== "already") return;
    const timer = window.setTimeout(() => {
      setShowSuccessNotice(false);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [confirmState]);

  async function handleBuy(planKey: string) {
    setLoadingPlan(planKey);
    setBuyError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        setBuyError(data.error ?? "Failed to create checkout");
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setBuyError(isEn ? "Network error, please try again" : "网络错误，请稍后重试");
    } finally {
      setLoadingPlan(null);
    }
  }

  const tiers = pricingConfig.plans.map((plan) => ({
    key: plan.key,
    label: isEn ? plan.label_en : plan.label_zh,
    title: isEn ? plan.name_en : plan.name_zh,
    price: plan.price_usd === 0 ? "$0" : `$${plan.price_usd}`,
    highlight: plan.highlight,
    creem_product_id: plan.creem_product_id,
    items: (isEn ? plan.features_en : plan.features_zh) && (isEn ? plan.features_en : plan.features_zh).length > 0
      ? (isEn ? plan.features_en : plan.features_zh)
      : (isEn ? ["Plan features to be configured"] : ["请在 pricing 配置中设置套餐功能"]),
  }));

  return (
    <>
      <Head>
        <title>{isEn ? "Pricing | AI Image Prompt Hub" : "定价 | AI Image Prompt Hub"}</title>
        <meta
          name="description"
          content={isEn ? "Buy one-time credit packs for AI image generation. Prompt browsing remains free." : "购买一次性积分包用于 AI 生图。Prompt 模板浏览永久免费。"}
        />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-16 sm:px-6 lg:px-8">
        {showSuccessNotice && (confirmState === "confirmed" || confirmState === "already") && (
          <div className="mx-auto mb-10 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-emerald-500/35 bg-emerald-500/10 px-6 py-4 text-center">
            <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-semibold text-emerald-300">
              {confirmMessage || (isEn ? "Purchase successful." : "购买成功。")}
              {successPlan && (
                <span className="ml-1 text-emerald-400">
                  ({pricingConfig.plans.find((p) => p.key === successPlan)?.[isEn ? "name_en" : "name_zh"]})
                </span>
              )}
            </p>
          </div>
        )}

        {confirmState === "error" && (
          <div className="mx-auto mb-10 max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center">
            <p className="text-sm font-semibold text-red-300">
              {confirmMessage || (isEn ? "Payment confirmation failed." : "支付确认失败。")}
            </p>
          </div>
        )}

        {canceled && (
          <div className="mx-auto mb-10 max-w-xl rounded-2xl border border-night-700 bg-night-900/70 px-6 py-4 text-center">
            <p className="text-sm font-semibold text-night-300">
              {isEn ? "Checkout canceled." : "已取消支付。"}
            </p>
          </div>
        )}

        <div className="mb-16 text-center">
          <h1 className="font-display text-4xl font-semibold italic text-night-50 sm:text-5xl lg:text-6xl">
            {isEn ? "Pricing" : "定价"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-night-400">
            {isEn
              ? "Template browsing is free. Buy credits once and use 1 credit per image generation in Build."
              : "模板浏览永久免费。一次性购买积分，Build 每次生图消耗 1 积分。"}
          </p>
          {creditBalance != null && (
            <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-glow-500/25 bg-glow-500/8 px-3 py-1 text-xs font-semibold text-glow-300">
              {isEn ? "Current credits" : "当前积分"}: {creditBalance}
            </p>
          )}
        </div>

        <div className="mx-auto grid max-w-[1680px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((tier) => (
            <article
              key={tier.key}
              className={`relative flex flex-col overflow-hidden rounded-2xl p-8 ${
                tier.highlight
                  ? "border border-glow-500/30 bg-night-900/70 shadow-[0_0_64px_rgba(251,191,36,0.08)]"
                  : "card-glow border border-night-700 bg-night-900/70"
              }`}
            >
              {tier.highlight && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.07),transparent_60%)]" />
              )}

              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-mono text-[10px] uppercase tracking-[0.16em] ${tier.highlight ? "text-glow-500" : "text-night-500"}`}>
                    {tier.label}
                  </p>
                  {tier.highlight && (
                    <span className="rounded-full border border-glow-500/40 bg-glow-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-glow-300">
                      {isEn ? "Recommended" : "推荐"}
                    </span>
                  )}
                </div>
                <h2 className={`mt-3 font-display text-2xl font-semibold italic ${tier.highlight ? "text-night-50" : "text-night-100"}`}>
                  {tier.title}
                </h2>
                <div className="mt-5 flex items-end gap-1.5">
                  <span className={`font-display text-5xl font-bold italic leading-none ${tier.highlight ? "text-glow-400" : "text-night-50"}`}>
                    {tier.price}
                  </span>
                </div>
              </div>

              <ul className={`relative mt-8 flex-1 space-y-3.5 border-t pt-7 ${tier.highlight ? "border-glow-500/20" : "border-night-700/60"}`}>
                {tier.items.map((item) => (
                  <li key={item} className={`flex items-start gap-3 text-sm ${tier.highlight ? "text-night-200" : "text-night-300"}`}>
                    <span className={`mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full ${tier.highlight ? "bg-glow-500" : "bg-night-500"}`} />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="relative mt-10">
                {tier.key === "free" ? (
                  <Link
                    href="/gallery"
                    locale={locale}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-night-600 px-5 py-3 text-sm font-semibold text-night-200 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50"
                  >
                    {dict.common.backToTemplates}
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : hasClerkKey && isLoaded && !isSignedIn ? (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                        tier.highlight
                          ? "bg-glow-500 text-night-950 shadow-glow-sm hover:bg-glow-400 hover:shadow-glow-md"
                          : "border border-night-600 bg-night-800 text-night-200 hover:border-night-500 hover:text-night-50"
                      }`}
                    >
                      {isEn ? "Buy Credits" : "购买积分"}
                    </button>
                  </SignInButton>
                ) : (
                  <button
                    type="button"
                    onClick={() => { void handleBuy(tier.key); }}
                    disabled={loadingPlan === tier.key}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      tier.highlight
                        ? "bg-glow-500 text-night-950 shadow-glow-sm hover:bg-glow-400 hover:shadow-glow-md"
                        : "border border-night-600 bg-night-800 text-night-200 hover:border-night-500 hover:text-night-50"
                    }`}
                  >
                    {loadingPlan === tier.key
                      ? (isEn ? "Redirecting..." : "跳转中...")
                      : (isEn ? "Buy Credits" : "购买积分")}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {buyError && (
          <p className="mt-6 text-center text-sm text-red-400">{buyError}</p>
        )}

        <p className="mt-10 text-center text-xs text-night-600">
          {isEn ? "Free plan stays free for prompt browsing." : "免费方案可持续用于模板浏览。"}
        </p>
      </main>
    </>
  );
};

export default PricingPage;
