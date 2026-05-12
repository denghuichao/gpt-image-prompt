import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import PromptTaxonomyLandingPage from "../../../components/PromptTaxonomyLandingPage";
import { resolveLocale } from "../../../utils/i18n";
import { getPromptTemplateFacets, getPromptTemplatesPage } from "../../../utils/promptTemplates";
import { findTaxonomyValueBySlug, getStyleGalleryPath, getTagGalleryPath, slugifyTaxonomySegment } from "../../../utils/taxonomy";

const PAGE_SIZE = 24;

type StylePageProps = {
  style: string;
  initialTemplates: Awaited<ReturnType<typeof getPromptTemplatesPage>>["templates"];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  relatedStyles: Array<{ label: string; href: string }>;
  relatedTags: Array<{ label: string; href: string }>;
};

const StylePage: NextPage<StylePageProps> = (props) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  return (
    <PromptTaxonomyLandingPage
      kind="style"
      term={props.style}
      locale={locale}
      initialTemplates={props.initialTemplates}
      initialNextCursor={props.initialNextCursor}
      initialHasMore={props.initialHasMore}
      canonicalPath={getStyleGalleryPath(props.style)}
      relatedStyles={props.relatedStyles}
      relatedTags={props.relatedTags}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const facets = await getPromptTemplateFacets();
  const paths = facets.styles.flatMap((style) => ([
    { params: { slug: slugifyTaxonomySegment(style) }, locale: "zh" },
    { params: { slug: slugifyTaxonomySegment(style) }, locale: "en" },
  ]));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<StylePageProps> = async ({ params }) => {
  const slug = String(params?.slug || "");
  const facets = await getPromptTemplateFacets();
  const style = findTaxonomyValueBySlug(facets.styles, slug);
  if (!style) return { notFound: true, revalidate: 60 };

  const initialPage = await getPromptTemplatesPage({
    cursor: 0,
    limit: PAGE_SIZE,
    style,
  });

  return {
    props: {
      style,
      initialTemplates: initialPage.templates,
      initialNextCursor: initialPage.nextCursor,
      initialHasMore: initialPage.hasMore,
      relatedStyles: facets.styles
        .filter((item) => item !== style)
        .slice(0, 12)
        .map((item) => ({ label: item, href: getStyleGalleryPath(item) })),
      relatedTags: facets.tags.slice(0, 12).map((item) => ({ label: item, href: getTagGalleryPath(item) })),
    },
    revalidate: 300,
  };
};

export default StylePage;
