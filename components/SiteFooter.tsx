import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";

function XLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.244 2H21.5l-7.12 8.14L22 22h-5.96l-4.67-6.11L5.88 22H2.62l7.62-8.7L2 2h6.11l4.22 5.56L18.244 2zm-1.14 18h1.65L5.03 3.9H3.26L17.104 20z"
      />
    </svg>
  );
}

export default function SiteFooter() {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@gptimageprompt.xyz";
  const supportXUrl = process.env.NEXT_PUBLIC_SUPPORT_X_URL || "https://x.com/LouwlouAiDev";

  return (
    <footer className="border-t border-night-800/60 bg-night-950/70">
      <div className="mx-auto w-full max-w-[1960px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="px-1 py-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-brand text-[20px] font-semibold italic leading-none tracking-[0.01em] text-night-100">
                {dict.siteName}
              </p>
              <p className="mt-2 text-xs text-night-500">{dict.footer.copyright}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Link href="/" locale={locale} className="text-night-300 transition hover:text-night-100">
                {dict.nav.home}
              </Link>
              <Link href="/gallery" locale={locale} className="text-night-300 transition hover:text-night-100">
                {dict.nav.gallery}
              </Link>
              <Link href="/blogs" locale={locale} className="text-night-300 transition hover:text-night-100">
                {dict.nav.blogs}
              </Link>
              <Link href="/pricing" locale={locale} className="text-night-300 transition hover:text-night-100">
                {dict.nav.pricing}
              </Link>
              <Link href="/privacy" locale={locale} className="text-night-300 transition hover:text-night-100">
                {dict.footer.privacyPolicy}
              </Link>
              <Link href="/terms" locale={locale} className="text-night-300 transition hover:text-night-100">
                {dict.footer.termsOfService}
              </Link>
              <span className="ml-1 text-night-500">{dict.footer.contactMe}</span>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-night-700 bg-night-900/60 text-night-300 transition hover:border-night-500 hover:text-night-100"
                aria-label="Email"
              >
                <EnvelopeIcon className="h-4 w-4" />
              </a>
              <a
                href={supportXUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-night-700 bg-night-900/60 text-night-300 transition hover:border-night-500 hover:text-night-100"
                aria-label={dict.footer.xLabel}
              >
                <XLogoIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
