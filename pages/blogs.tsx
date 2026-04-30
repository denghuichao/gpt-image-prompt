import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../utils/i18n";
import { getAllPublishedBlogPosts, type BlogPostMeta } from "../utils/blog";
import { absoluteUrl, buildHrefLang } from "../utils/seo";

const BlogsPage: NextPage<{ posts: BlogPostMeta[] }> = ({ posts }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const dict = t(locale);
  const canonical = absoluteUrl("/blogs", localeTyped);
  const hreflangs = buildHrefLang("/blogs");

  return (
    <>
      <Head>
        <title>{dict.blogs.title}</title>
        <meta name="description" content={dict.blogs.desc} />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold italic text-night-50 sm:text-4xl">
            {dict.blogs.heading}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-night-400">
            {dict.blogs.desc}
          </p>
        </header>

        {posts.length === 0 ? (
          <section className="rounded-2xl border border-night-700 bg-night-900/50 p-6 text-night-300">
            {dict.blogs.empty}
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="overflow-hidden rounded-2xl border border-night-700 bg-night-900/55 transition hover:border-glow-500/35"
              >
                {post.cover && (
                  <div className="overflow-hidden border-b border-night-700/80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-44 w-full object-cover transition duration-300 hover:scale-[1.02]"
                    />
                  </div>
                )}
                <div className="p-5">
                {post.date && (
                  <p className="font-mono text-[11px] text-night-500">
                    {dict.blogs.publishedOn}: {post.date}
                  </p>
                )}
                <h2 className="mt-2 line-clamp-2 font-display text-xl font-semibold italic text-night-50">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-night-300">
                    {post.excerpt}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={`${post.slug}-${tag}`}
                        className="rounded-full border border-night-700 bg-night-950/60 px-2 py-0.5 font-mono text-[10px] text-night-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href={`/blogs/${post.slug}`}
                  locale={locale}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-glow-300 transition hover:text-glow-200"
                >
                  {dict.blogs.readMore}
                  <span aria-hidden="true">→</span>
                </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {
      posts: getAllPublishedBlogPosts(),
    },
    revalidate: 300,
  };
};

export default BlogsPage;
