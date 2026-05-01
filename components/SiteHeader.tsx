import { SignInButton, useAuth, useClerk, useUser } from "@clerk/nextjs";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon,
  SparklesIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";

type PromptFacetsResponse = {
  styles?: string[];
  tags?: string[];
  error?: string;
};

function parseCsvParam(input: string | string[] | undefined) {
  const raw = Array.isArray(input) ? input.join(",") : (input || "");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [facetsLoading, setFacetsLoading] = useState(false);
  const [facetTypes, setFacetTypes] = useState<string[]>([]);
  const [facetTags, setFacetTags] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const navItems = [
    { href: "/", label: dict.nav.home },
    { href: "/gallery", label: dict.nav.gallery },
    { href: "/pricing", label: dict.nav.pricing },
    { href: "/blogs", label: dict.nav.blogs },
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
    const type = typeof router.query.type === "string" ? router.query.type : "";
    const tags = parseCsvParam(router.query.tags);
    setSearch(q);
    setSelectedType(type);
    setSelectedTags(tags);
  }, [isGallery, router.query.q, router.query.type, router.query.tags]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.asPath]);

  useEffect(() => {
    if (!isGallery) return;
    let cancelled = false;
    async function loadFacets() {
      setFacetsLoading(true);
      try {
        const res = await fetch("/api/prompts/facets");
        if (!res.ok) return;
        const data = await res.json() as PromptFacetsResponse;
        if (cancelled) return;
        setFacetTypes(Array.isArray(data.styles) ? data.styles : []);
        setFacetTags(Array.isArray(data.tags) ? data.tags : []);
      } catch {
        if (!cancelled) {
          setFacetTypes([]);
          setFacetTags([]);
        }
      } finally {
        if (!cancelled) setFacetsLoading(false);
      }
    }
    void loadFacets();
    return () => {
      cancelled = true;
    };
  }, [isGallery]);

  useEffect(() => {
    if (!filterOpen) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setFilterOpen(false);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [filterOpen]);

  function buildGalleryQuery(next: { q?: string; type?: string; tags?: string[] }) {
    const q = (next.q || "").trim();
    const type = (next.type || "").trim();
    const tags = Array.isArray(next.tags) ? next.tags.map((s) => s.trim()).filter(Boolean) : [];
    const queryObj: Record<string, string> = {};
    if (q) queryObj.q = q;
    if (type) queryObj.type = type;
    if (tags.length > 0) queryObj.tags = tags.join(",");
    return queryObj;
  }

  function updateGallerySearch(nextValue: string) {
    setSearch(nextValue);
    const queryObj = buildGalleryQuery({
      q: nextValue,
      type: selectedType,
      tags: selectedTags,
    });
    void router.replace(
      { pathname: "/gallery", query: queryObj },
      undefined,
      { shallow: true, locale },
    );
  }

  function applyFilters() {
    const queryObj = buildGalleryQuery({
      q: search,
      type: selectedType,
      tags: selectedTags,
    });
    setFilterOpen(false);
    void router.replace(
      { pathname: "/gallery", query: queryObj },
      undefined,
      { shallow: true, locale },
    );
  }

  function resetFilters() {
    setSelectedType("");
    setSelectedTags([]);
    const queryObj = buildGalleryQuery({ q: search, type: "", tags: [] });
    setFilterOpen(false);
    void router.replace(
      { pathname: "/gallery", query: queryObj },
      undefined,
      { shallow: true, locale },
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag]
    ));
  }

  const hasActiveFilters = selectedType.trim().length > 0 || selectedTags.length > 0;

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
      className={`sticky top-0 z-[1000] transition-all duration-300 ${
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
            className="font-brand text-[18px] font-semibold italic leading-[1.02] tracking-[0.01em] text-night-50 transition hover:text-glow-300 sm:text-[22px]"
          >
            {dict.siteName}
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
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
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-night-700 bg-night-900/70 text-night-200 transition hover:border-night-500 hover:text-night-50 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>

          {isGallery && (
            <div className="hidden lg:block">
              <label htmlFor="gallery-header-search" className="sr-only">
                {dict.nav.searchTemplates}
              </label>
              <div className="flex h-10 w-[28rem] items-center overflow-hidden rounded-full border border-night-700 bg-night-900/80 lg:w-[34rem]">
                <input
                  id="gallery-header-search"
                  type="text"
                  value={search}
                  onChange={(e) => updateGallerySearch(e.target.value)}
                  placeholder={dict.nav.searchTemplates}
                  className="header-search-input h-full w-full bg-transparent px-4 text-sm text-night-100 placeholder:text-night-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className={`mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${
                    hasActiveFilters
                      ? "border-glow-500/60 bg-glow-500/15 text-glow-300"
                      : "border-night-700 bg-night-900 text-night-300 hover:border-night-500 hover:text-night-100"
                  }`}
                  aria-label={dict.nav.filter}
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="hidden items-center gap-1 rounded-full border border-night-700 bg-night-900/60 p-1 lg:flex">
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
              creditsLabel={dict.nav.currentCredits}
              buyCreditsLabel={dict.nav.buyCredits}
              createTemplateLabel={dict.nav.newTemplate}
              showCreateTemplate={isAdmin}
            />
          ) : (
            <span className="rounded-full border border-night-700/60 bg-night-900/40 px-3 py-1 text-xs text-night-600">
              {dict.nav.clerkNotConfigured}
            </span>
          )}
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-night-800/70 bg-night-950/95 px-4 pb-4 pt-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname === item.href || router.asPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={`m-${item.href}`}
                  href={item.href}
                  locale={locale}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-glow-500/15 text-glow-300"
                      : "text-night-300 hover:bg-night-800 hover:text-night-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isGallery && (
            <div className="mt-3">
              <label htmlFor="gallery-header-search-mobile" className="sr-only">
                {dict.nav.searchTemplates}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="gallery-header-search-mobile"
                  type="text"
                  value={search}
                  onChange={(e) => updateGallerySearch(e.target.value)}
                  placeholder={dict.nav.searchTemplates}
                  className="header-search-input w-full rounded-xl border border-night-700 bg-night-900/80 px-3 py-2 text-sm text-night-100 placeholder:text-night-500 outline-none transition focus:border-glow-500/50 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.08)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setFilterOpen(true);
                  }}
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                    hasActiveFilters
                      ? "border-glow-500/60 bg-glow-500/15 text-glow-300"
                      : "border-night-700 bg-night-900 text-night-200"
                  }`}
                  aria-label={dict.nav.filter}
                >
                  <FunnelIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-night-700 bg-night-900/70 p-1">
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
        </div>
      )}

      {isGallery && filterOpen && (
        <>
          <button
            type="button"
            aria-label="Close filter"
            onClick={() => setFilterOpen(false)}
            className="fixed inset-0 z-[1090] bg-black/45 backdrop-blur-[1px]"
          />
          <aside className="fixed right-0 top-[72px] z-[1100] h-[calc(100dvh-72px)] w-full max-w-md border-l border-night-700 bg-night-950/95 shadow-[-12px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-night-700 px-4 py-3">
                <h3 className="text-sm font-semibold text-night-50">{dict.nav.filterTitle}</h3>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-night-700 text-night-300 transition hover:border-night-500 hover:text-night-100"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-night-400">
                    {dict.nav.filterType}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedType("")}
                      className={`rounded-full border px-3 py-1.5 text-xs transition ${
                        !selectedType
                          ? "border-glow-500/60 bg-glow-500/15 text-glow-300"
                          : "border-night-700 bg-night-900 text-night-300 hover:border-night-500 hover:text-night-100"
                      }`}
                    >
                      {dict.nav.filterAllTypes}
                    </button>
                    {facetTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          selectedType === type
                            ? "border-glow-500/60 bg-glow-500/15 text-glow-300"
                            : "border-night-700 bg-night-900 text-night-300 hover:border-night-500 hover:text-night-100"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-night-400">
                    {dict.nav.filterTags}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {facetTags.map((tag) => {
                      const active = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-3 py-1.5 text-xs transition ${
                            active
                              ? "border-glow-500/60 bg-glow-500/15 text-glow-300"
                              : "border-night-700 bg-night-900 text-night-300 hover:border-night-500 hover:text-night-100"
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {facetsLoading && (
                  <p className="mt-4 text-xs text-night-500">{dict.gallery.loading}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-night-700 px-4 py-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full border border-night-700 px-4 py-2 text-sm text-night-300 transition hover:border-night-500 hover:text-night-100"
                >
                  {dict.nav.filterReset}
                </button>
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-full border border-glow-500/60 bg-glow-500/15 px-4 py-2 text-sm text-glow-300 transition hover:bg-glow-500/25"
                >
                  {dict.nav.filterApply}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  );
}
