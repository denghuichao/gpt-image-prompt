export const SUPPORTED_LOCALES = ["zh", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "zh";

function stripTrailingSlash(input: string) {
  return input.endsWith("/") ? input.slice(0, -1) : input;
}

export function getSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return stripTrailingSlash(fromEnv);
}

export function localePath(pathname: string, locale: AppLocale) {
  const clean = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export function absoluteUrl(pathname: string, locale: AppLocale) {
  return `${getSiteUrl()}${localePath(pathname, locale)}`;
}

export function buildHrefLang(pathname: string) {
  const zh = absoluteUrl(pathname, "zh");
  const en = absoluteUrl(pathname, "en");
  return [
    { locale: "zh-CN", href: zh },
    { locale: "en", href: en },
    { locale: "x-default", href: zh },
  ];
}

export function safeJsonLd(input: unknown) {
  return JSON.stringify(input).replace(/</g, "\\u003c");
}
