import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";

export default function SiteFooter() {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@gptimageprompt.xyz";
  const supportXUrl = process.env.NEXT_PUBLIC_SUPPORT_X_URL || "https://x.com/LouwlouAiDev";

  return (
    <footer className="border-t border-night-800/70 bg-night-950/70">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col gap-3 px-4 py-5 text-xs text-night-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <p>{dict.footer.copyright}</p>
          <div className="flex items-center gap-2 text-night-400">
            <span>{dict.footer.contactMe}</span>
            <a
              href={`mailto:${supportEmail}`}
              className="transition hover:text-night-200"
            >
              {supportEmail}
            </a>
            <span>·</span>
            <a
              href={supportXUrl}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-night-200"
            >
              {dict.footer.xLabel}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/privacy" locale={locale} className="text-night-400 transition hover:text-night-200">
            {dict.footer.privacyPolicy}
          </Link>
          <Link href="/terms" locale={locale} className="text-night-400 transition hover:text-night-200">
            {dict.footer.termsOfService}
          </Link>
        </div>
      </div>
    </footer>
  );
}
