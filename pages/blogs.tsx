import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";

const BlogsPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);

  return (
    <>
      <Head>
        <title>{dict.blogs.title}</title>
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-10 text-white sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">{dict.blogs.heading}</h1>
        <p className="mt-3 max-w-3xl text-white/70">{dict.blogs.desc}</p>
        <Link
          href="/"
          locale={locale}
          className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
        >
          {dict.common.backToHome}
        </Link>
      </main>
    </>
  );
};

export default BlogsPage;
