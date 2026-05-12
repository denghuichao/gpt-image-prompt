import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { resolveLocale, t } from "../../utils/i18n";
import { absoluteUrl, safeJsonLd } from "../../utils/seo";
import { getAllBlogSlugs, getBlogPostBySlug, type BlogPost } from "../../utils/blog";

const BlogDetailPage: NextPage<{ post: BlogPost | null }> = ({ post }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const shouldNoindex = locale === "en";
  const dict = t(locale);

  if (!post) {
    return (
      <main className="mx-auto max-w-[1960px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <h1 className="font-display text-3xl font-semibold italic text-night-50">
            {dict.blogs.notFoundTitle}
          </h1>
          <p className="mt-3 text-night-400">{dict.blogs.notFoundDesc}</p>
          <Link
            href="/blogs"
            locale={locale}
            className="mt-6 inline-flex items-center gap-1 text-sm text-glow-300 transition hover:text-glow-200"
          >
            {dict.blogs.backToBlogs}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    );
  }

  const path = `/blogs/${post.slug}`;
  const canonical = absoluteUrl(path, "zh");
  const description = post.excerpt || post.title;
  const ogImage = post.cover
    ? absoluteUrl(post.cover, localeTyped)
    : absoluteUrl("/favicon.png", localeTyped);
  const publishedTime = post.date && !Number.isNaN(Date.parse(post.date))
    ? new Date(post.date).toISOString()
    : "";

  return (
    <>
      <Head>
        <title>{`${post.title} | AI Image Prompt Gallery`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={shouldNoindex ? "noindex,follow" : "index,follow"} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="AI Image Prompt Gallery" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        {publishedTime && <meta property="article:published_time" content={publishedTime} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description,
              image: ogImage,
              datePublished: publishedTime || undefined,
              dateModified: publishedTime || undefined,
              mainEntityOfPage: canonical,
              author: {
                "@type": "Organization",
                name: "AI Image Prompt Gallery",
              },
              publisher: {
                "@type": "Organization",
                name: "AI Image Prompt Gallery",
                logo: {
                  "@type": "ImageObject",
                  url: absoluteUrl("/favicon.png", localeTyped),
                },
              },
            }),
          }}
        />
      </Head>

      <main className="mx-auto max-w-[1960px] px-4 py-8 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-[900px] rounded-2xl border border-night-700/60 bg-night-900/45 p-6 sm:p-8">
          <header>
            {post.date && (
              <p className="font-mono text-[11px] text-night-500">
                {dict.blogs.publishedOn}: {post.date}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl font-semibold italic leading-tight text-night-50 sm:text-4xl">
              {post.title}
            </h1>
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={`${post.slug}-${tag}`}
                    className="rounded-full border border-night-700 bg-night-950/60 px-2 py-0.5 font-mono text-[10px] text-night-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {post.cover && (
            <div className="mt-5 overflow-hidden rounded-xl border border-night-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt={post.title} className="h-auto w-full object-cover" />
            </div>
          )}

          <section
            className="mt-7 max-w-none text-sm leading-relaxed text-night-200 [&_a]:text-glow-300 [&_a]:underline [&_a]:decoration-glow-500/30 [&_blockquote]:border-l-2 [&_blockquote]:border-night-700 [&_blockquote]:pl-4 [&_blockquote]:text-night-400 [&_h1]:mt-8 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:italic [&_h1]:text-night-50 [&_h2]:mt-7 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:italic [&_h2]:text-night-50 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:italic [&_h3]:text-night-100 [&_li]:my-1 [&_ol]:my-3 [&_ol]:pl-5 [&_p]:my-3 [&_pre]:my-4 [&_pre]:overflow-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-night-700 [&_pre]:bg-night-950/60 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <Link
            href="/blogs"
            locale={locale}
            className="mt-8 inline-flex items-center gap-1 text-sm text-glow-300 transition hover:text-glow-200"
          >
            ← {dict.blogs.backToBlogs}
          </Link>
        </article>
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = getAllBlogSlugs();
  const paths = slugs.flatMap((slug) => ([
    { params: { slug }, locale: "zh" },
    { params: { slug }, locale: "en" },
  ]));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug || "");
  const post = getBlogPostBySlug(slug);
  if (!post) return { notFound: true, revalidate: 60 };
  return {
    props: {
      post,
    },
    revalidate: 300,
  };
};

export default BlogDetailPage;
