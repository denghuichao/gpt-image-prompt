import Link from "next/link";
import { useRouter } from "next/router";
import BrandMark from "./BrandMark";
import SupportChannels from "./SupportChannels";
import { resolveLocale, t } from "../utils/i18n";

export default function SiteFooter() {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const isLandingPage = router.pathname === "/";
  const displaySiteName = isLandingPage ? "Image Prompt Base" : dict.siteName;
  const displayCopyright = isLandingPage ? "© Image Prompt Base" : dict.footer.copyright;
  const supportGitHubUrl = process.env.NEXT_PUBLIC_SUPPORT_GITHUB_URL || "https://github.com/denghuichao/gpt-image-2-prompts";
  const productLinks = [
    { label: dict.nav.home, href: "/" },
    { label: dict.nav.gallery, href: "/gallery" },
    { label: dict.nav.build, href: "/build" },
    { label: dict.nav.pricing, href: "/pricing" },
    { label: "问叶", href: "https://askleaf.xyz", external: true },
    { label: dict.footer.nicheGraphLabel, href: "https://nichegraph.xyz", external: true },
  ];
  const resourceLinks = [
    { label: dict.nav.blogs, href: "/blogs" },
    { label: dict.footer.githubLabel, href: supportGitHubUrl, external: true },
    { label: dict.footer.support, href: "/support" },
  ];
  const legalLinks = [
    { label: dict.footer.privacyPolicy, href: "/privacy" },
    { label: dict.footer.termsOfService, href: "/terms" },
  ];

  const renderLink = ({
    label,
    href,
    external = false,
  }: {
    label: string;
    href: string;
    external?: boolean;
  }) => {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-night-400 transition hover:text-night-100"
        >
          {label}
        </a>
      );
    }

    return (
      <Link href={href} locale={locale} className="text-sm text-night-400 transition hover:text-night-100">
        {label}
      </Link>
    );
  };

  return (
    <footer className="border-t border-night-800/60 bg-night-950/70 backdrop-blur">
      <div className="mx-auto w-full max-w-[1960px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:pr-8">
            <Link href="/" locale={locale} className="inline-flex items-center gap-3">
              <BrandMark
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-night-700 bg-night-900/80 text-night-100 shadow-card"
                iconClassName="h-4.5 w-4.5"
              />
              <span className="font-brand text-[20px] font-semibold italic leading-none tracking-[0.01em] text-night-100">
                {displaySiteName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-night-400">
              {dict.footer.description}
            </p>
            <div className="mt-5">
              <SupportChannels variant="compact" />
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-night-100">
              {dict.footer.product}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-night-100">
              {dict.footer.resources}
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-night-100">
              {dict.footer.legal}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-night-800/70 pt-6">
          <p className="text-sm text-night-500">{displayCopyright}</p>
        </div>
      </div>
    </footer>
  );
}
