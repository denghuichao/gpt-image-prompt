import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import type { ComponentType, PropsWithChildren } from "react";
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
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 pt-[72px]">
        <Component {...pageProps} />
      </div>
      <SiteFooter />
    </div>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerkKey) {
    return <AppLayout Component={Component} pageProps={pageProps} router={undefined as never} />;
  }

  return (
    <SafeClerkProvider
      {...(pageProps as Record<string, unknown>)}
      appearance={clerkAppearance}
    >
      <AppLayout Component={Component} pageProps={pageProps} router={undefined as never} />
    </SafeClerkProvider>
  );
}
