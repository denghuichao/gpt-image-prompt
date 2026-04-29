import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";

function ClerkActions({ signInLabel }: { signInLabel: string }) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{
          elements: {
            userButtonTrigger:
              "rounded-full transition hover:opacity-90 focus:shadow-none focus:outline-none",
            avatarBox:
              "h-9 w-9 border border-white/30 bg-slate-700 text-white shadow-[0_0_0_1px_rgba(0,0,0,0.28)]",
            avatarFallback: "bg-slate-700 text-white font-semibold",
            avatarImage: "object-cover",
          },
        }}
      />
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
      >
        {signInLabel}
      </button>
    </SignInButton>
  );
}

export default function SiteHeader() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const isGallery = router.pathname === "/gallery";
  const [search, setSearch] = useState("");

  const navItems = [
    { href: "/", label: dict.nav.home },
    { href: "/gallery", label: dict.nav.gallery },
    { href: "/pricing", label: dict.nav.pricing },
    { href: "/blogs", label: dict.nav.blogs },
  ];

  useEffect(() => {
    if (!isGallery) {
      return;
    }
    const q = typeof router.query.q === "string" ? router.query.q : "";
    setSearch(q);
  }, [isGallery, router.query.q]);

  function updateGallerySearch(nextValue: string) {
    setSearch(nextValue);
    const query = nextValue.trim();

    void router.replace(
      {
        pathname: "/gallery",
        query: query ? { q: query } : {},
      },
      undefined,
      { shallow: true, locale },
    );
  }

  function switchLocale(nextLocale: "zh" | "en") {
    if (nextLocale === locale) {
      return;
    }

    void router.push(
      { pathname: router.pathname, query: router.query },
      router.asPath,
      { locale: nextLocale },
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] border-b border-white/10 bg-black/45 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1960px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" locale={locale} className="text-base font-bold uppercase tracking-[0.16em] text-white sm:text-lg">
            {dict.siteName}
          </Link>
          <nav className="flex items-center gap-3">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname === item.href || router.asPath.startsWith(`${item.href}/`);

              const defaultClass = isActive
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale}
                  className={`rounded-full px-4 py-2 text-sm transition sm:text-base ${defaultClass}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isGallery && (
            <div className="hidden sm:block">
              <label htmlFor="gallery-header-search" className="sr-only">
                {dict.nav.searchTemplates}
              </label>
              <input
                id="gallery-header-search"
                type="text"
                value={search}
                onChange={(event) => updateGallerySearch(event.target.value)}
                placeholder={dict.nav.searchTemplates}
                className="w-64 rounded-full border border-white/20 bg-black/45 px-4 py-2.5 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-white/45 sm:text-base"
              />
            </div>
          )}

          <div className="hidden items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 sm:flex">
            <button
              type="button"
              onClick={() => switchLocale("zh")}
              className={`rounded-full px-2.5 py-1 text-xs transition ${
                locale === "zh" ? "bg-white text-black" : "text-white/75 hover:text-white"
              }`}
            >
              {dict.nav.languageZh}
            </button>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={`rounded-full px-2.5 py-1 text-xs transition ${
                locale === "en" ? "bg-white text-black" : "text-white/75 hover:text-white"
              }`}
            >
              {dict.nav.languageEn}
            </button>
          </div>

          {hasClerkKey ? (
            <ClerkActions signInLabel={dict.nav.signIn} />
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/55">
              {dict.nav.clerkNotConfigured}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
