import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import type { ComponentType, PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import "../styles/index.css";

type AnyProps = PropsWithChildren<Record<string, unknown>>;
const SafeClerkProvider = ClerkProvider as unknown as ComponentType<AnyProps>;

const clerkAppearance = {
  variables: {
    colorPrimary: "#fbbf24",
    colorBackground: "#111827",
    colorInputBackground: "#1f2937",
    colorInputText: "#f8fafc",
    colorText: "#f8fafc",
    colorTextSecondary: "#cbd5e1",
    colorNeutral: "#334155",
    colorDanger: "#f87171",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-slate-900 border border-slate-600 shadow-card text-slate-100",
    cardBox: "shadow-none",
    headerTitle: "text-slate-50",
    headerSubtitle: "text-slate-300",
    formFieldLabel: "text-slate-200",
    formButtonPrimary:
      "bg-glow-500 text-night-950 hover:bg-glow-400 shadow-glow-sm",
    formFieldInput:
      "bg-slate-800 border-slate-600 text-slate-100 placeholder:text-slate-400",
    footerAction: "text-slate-300",
    footerActionLink: "text-amber-300 hover:text-amber-200",
    socialButtonsBlockButton:
      "bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700",
    dividerLine: "bg-slate-600",
    dividerText: "text-slate-400",
    userButtonPopoverCard: "bg-slate-900 border border-slate-600 shadow-card",
    userButtonPopoverActions: "bg-slate-900",
    userButtonPopoverActionButton:
      "text-slate-100 hover:bg-slate-700 hover:text-slate-50",
    userButtonPopoverActionButtonText: "text-slate-100",
    userButtonPopoverFooter: "border-slate-700 bg-slate-900",
    userPreviewMainIdentifier: "text-slate-100",
    userPreviewSecondaryIdentifier: "text-slate-400",
  },
};

function AppLayout({ Component, pageProps }: AppProps) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <div className="min-h-0 flex-1">
        <Component {...pageProps} />
      </div>
      <SiteFooter />
    </div>
  );
}

function BuildOverlayLayout({ Component, pageProps }: AppProps) {
  const [canHoverReveal, setCanHoverReveal] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      const canHover = mql.matches;
      setCanHoverReveal(canHover);
      setShowHeader(!canHover);
      setShowFooter(!canHover);
    };
    update();
    const add = mql.addEventListener ? mql.addEventListener.bind(mql) : mql.addListener.bind(mql);
    const remove = mql.removeEventListener ? mql.removeEventListener.bind(mql) : mql.removeListener.bind(mql);
    add("change", update as EventListener);
    return () => remove("change", update as EventListener);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="min-h-0 flex-1">
        <Component {...pageProps} />
      </div>

      {canHoverReveal && (
        <>
          <div
            className="fixed inset-x-0 top-0 z-[1400] h-7"
            onMouseEnter={() => setShowHeader(true)}
            onMouseLeave={() => setShowHeader(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[1400] h-8"
            onMouseEnter={() => setShowFooter(true)}
            onMouseLeave={() => setShowFooter(false)}
          />
        </>
      )}

      <div
        className={`fixed inset-x-0 top-0 z-[1300] transition-transform duration-200 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
        onMouseEnter={() => setShowHeader(true)}
        onMouseLeave={() => canHoverReveal && setShowHeader(false)}
      >
        <SiteHeader />
      </div>
      <div
        className={`fixed inset-x-0 bottom-0 z-[1300] transition-transform duration-200 ${showFooter ? "translate-y-0" : "translate-y-full"}`}
        onMouseEnter={() => setShowFooter(true)}
        onMouseLeave={() => canHoverReveal && setShowFooter(false)}
      >
        <SiteFooter />
      </div>
    </div>
  );
}

export default function MyApp({ Component, pageProps, router }: AppProps) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isBuildPage = router.pathname === "/build";

  const renderLayout = () => {
    if (isBuildPage) {
      return <BuildOverlayLayout Component={Component} pageProps={pageProps} router={router} />;
    }
    return <AppLayout Component={Component} pageProps={pageProps} router={router} />;
  };

  if (!hasClerkKey) {
    return renderLayout();
  }

  return (
    <SafeClerkProvider
      {...(pageProps as Record<string, unknown>)}
      appearance={clerkAppearance}
    >
      {renderLayout()}
    </SafeClerkProvider>
  );
}
