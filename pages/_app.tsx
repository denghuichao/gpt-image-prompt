import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import type { ComponentType, PropsWithChildren } from "react";
import SiteHeader from "../components/SiteHeader";
import "../styles/index.css";

type AnyProps = PropsWithChildren<Record<string, unknown>>;
const SafeClerkProvider = ClerkProvider as unknown as ComponentType<AnyProps>;

function AppLayout({ Component, pageProps }: AppProps) {
  return (
    <>
      <SiteHeader />
      <div className="pt-[72px]">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default function MyApp({ Component, pageProps }: AppProps) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!hasClerkKey) {
    return <AppLayout Component={Component} pageProps={pageProps} router={undefined as never} />;
  }

  return (
    <SafeClerkProvider {...(pageProps as Record<string, unknown>)}>
      <AppLayout Component={Component} pageProps={pageProps} router={undefined as never} />
    </SafeClerkProvider>
  );
}
