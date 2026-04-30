import { SignInButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import {
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  SparklesIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";

function ClerkActions({
  signInLabel,
  creditsLabel,
  buyCreditsLabel,
  createTemplateLabel,
  showCreateTemplate,
}: {
  signInLabel: string;
  creditsLabel: string;
  buyCreditsLabel: string;
  createTemplateLabel: string;
  showCreateTemplate: boolean;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fallbackText = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
    if (fullName) {
      const words = fullName.split(/\s+/).filter(Boolean);
      if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
      return fullName.slice(0, 2).toUpperCase();
    }
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  }, [user?.firstName, user?.lastName, user?.primaryEmailAddress?.emailAddress]);
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    "User";
  const email = user?.primaryEmailAddress?.emailAddress || "";

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
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
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!isLoaded) {
    return <div className="h-8 w-8 rounded-full bg-night-800 animate-pulse" />;
  }

  if (isSignedIn) {
    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-night-600 bg-amber-500 text-xs font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-glow-500/30"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.imageUrl} alt="User avatar" className="h-full w-full object-cover" />
          ) : (
            <span>{fallbackText}</span>
          )}
        </button>

        {open && (
          <div className="animate-fade-in absolute right-0 z-[1200] mt-3 w-72 overflow-hidden rounded-2xl border border-night-700 bg-night-900/95 shadow-[0_18px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="border-b border-night-700/80 px-3 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-[11px] font-semibold text-white">
                  {user?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt="User avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span>{fallbackText}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-night-50">{displayName}</p>
                  {email && <p className="truncate text-xs text-night-400">{email}</p>}
                </div>
              </div>
            </div>

            <div className="p-2">
              <div className="mb-1.5 flex items-center justify-between rounded-xl border border-night-700 bg-night-800/70 px-3 py-2">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-4 w-4 text-glow-400" />
                  <span className="text-sm text-night-100">{creditsLabel}</span>
                </div>
                <span className="rounded-lg bg-night-900 px-2 py-0.5 font-mono text-xs text-night-100">
                  {creditBalance ?? 0}
                </span>
              </div>

              <Link
                href="/pricing"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-night-100 transition hover:bg-night-800/80"
                onClick={() => setOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-glow-400" />
                  {buyCreditsLabel}
                </span>
                <ChevronRightIcon className="h-4 w-4 text-night-500" />
              </Link>

              {showCreateTemplate && (
                <Link
                  href="/prompts/new"
                  className="mt-1 flex items-center justify-between rounded-xl px-3 py-2 text-sm text-night-100 transition hover:bg-night-800/80"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-glow-400" />
                    {createTemplateLabel}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 text-night-500" />
                </Link>
              )}

              <button
                type="button"
                className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-night-100 transition hover:bg-red-500/15 hover:text-red-300"
                onClick={async () => {
                  setOpen(false);
                  await signOut({ redirectUrl: "/" });
                }}
              >
                <span className="flex items-center gap-2">
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Sign Out
                </span>
                <ChevronRightIcon className="h-4 w-4 text-night-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="rounded-full border border-night-600 bg-night-800 px-4 py-1.5 text-sm text-night-200 transition hover:border-night-500 hover:text-night-50"
      >
        {signInLabel}
      </button>
    </SignInButton>
  );
}

export default function SiteHeader() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const isGallery = router.pathname === "/gallery";
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const navItems = [
    { href: "/", label: dict.nav.home },
    { href: "/gallery", label: dict.nav.gallery },
    { href: "/pricing", label: dict.nav.pricing },
  ];

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) return;
        const data = await res.json() as { isAdmin?: boolean };
        if (!cancelled) setIsAdmin(Boolean(data.isAdmin));
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }
    void checkAdmin();
    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isGallery) return;
    const q = typeof router.query.q === "string" ? router.query.q : "";
    setSearch(q);
  }, [isGallery, router.query.q]);

  function updateGallerySearch(nextValue: string) {
    setSearch(nextValue);
    const query = nextValue.trim();
    void router.replace(
      { pathname: "/gallery", query: query ? { q: query } : {} },
      undefined,
      { shallow: true, locale },
    );
  }

  function switchLocale(nextLocale: "zh" | "en") {
    if (nextLocale === locale) return;
    void router.push(
      { pathname: router.pathname, query: router.query },
      router.asPath,
      { locale: nextLocale },
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
        scrolled
          ? "border-b border-night-700 bg-night-950/90 backdrop-blur-xl shadow-[0_1px_24px_rgba(0,0,0,0.4)]"
          : "border-b border-night-800/60 bg-night-950/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1960px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            locale={locale}
            className="font-display text-xl font-semibold italic text-night-50 transition hover:text-glow-300"
          >
            {dict.siteName}
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname === item.href || router.asPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  locale={locale}
                  className={`rounded-full px-4 py-1.5 text-base transition ${
                    isActive
                      ? "bg-glow-500/15 text-glow-300 shadow-[0_0_0_1px_rgba(251,191,36,0.2)]"
                      : "text-night-400 hover:bg-night-800 hover:text-night-200"
                  }`}
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
                onChange={(e) => updateGallerySearch(e.target.value)}
                placeholder={dict.nav.searchTemplates}
                className="w-56 rounded-full border border-night-700 bg-night-900/80 px-4 py-2 text-sm text-night-100 placeholder:text-night-500 outline-none transition focus:border-glow-500/50 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.08)] lg:w-64"
              />
            </div>
          )}

          <div className="hidden items-center gap-1 rounded-full border border-night-700 bg-night-900/60 p-1 sm:flex">
            <button
              type="button"
              onClick={() => switchLocale("zh")}
              className={`rounded-full px-3 py-1 text-xs transition ${
                locale === "zh"
                  ? "bg-glow-500 text-night-950 font-semibold shadow-glow-sm"
                  : "text-night-400 hover:text-night-200"
              }`}
            >
              {dict.nav.languageZh}
            </button>
            <button
              type="button"
              onClick={() => switchLocale("en")}
              className={`rounded-full px-3 py-1 text-xs transition ${
                locale === "en"
                  ? "bg-glow-500 text-night-950 font-semibold shadow-glow-sm"
                  : "text-night-400 hover:text-night-200"
              }`}
            >
              {dict.nav.languageEn}
            </button>
          </div>

          {hasClerkKey ? (
            <ClerkActions
              signInLabel={dict.nav.signIn}
              creditsLabel={locale === "en" ? "Current Credits" : "当前积分"}
              buyCreditsLabel={locale === "en" ? "Buy Credits" : "购买积分"}
              createTemplateLabel={locale === "en" ? "New Template" : "新建模版"}
              showCreateTemplate={isAdmin}
            />
          ) : (
            <span className="rounded-full border border-night-700/60 bg-night-900/40 px-3 py-1 text-xs text-night-600">
              {dict.nav.clerkNotConfigured}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
