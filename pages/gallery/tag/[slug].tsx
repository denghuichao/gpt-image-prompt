import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import PromptTaxonomyLandingPage from "../../../components/PromptTaxonomyLandingPage";
import { resolveLocale } from "../../../utils/i18n";
import { getPromptTemplateFacets, getPromptTemplatesPage } from "../../../utils/promptTemplates";
import { findTaxonomyValueBySlug, getStyleGalleryPath, getTagGalleryPath, slugifyTaxonomySegment } from "../../../utils/taxonomy";

const PAGE_SIZE = 24;

type TagPageProps = {
  tag: string;
  initialTemplates: Awaited<ReturnType<typeof getPromptTemplatesPage>>["templates"];
  initialNextCursor: number | null;
  initialHasMore: boolean;
  relatedStyles: Array<{ label: string; href: string }>;
  relatedTags: Array<{ label: string; href: string }>;
};

const TagPage: NextPage<TagPageProps> = (props) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  return (
    <PromptTaxonomyLandingPage
      kind="tag"
      term={props.tag}
      locale={locale}
      initialTemplates={props.initialTemplates}
      initialNextCursor={props.initialNextCursor}
      initialHasMore={props.initialHasMore}
      canonicalPath={getTagGalleryPath(props.tag)}
      relatedStyles={props.relatedStyles}
      relatedTags={props.relatedTags}
    />
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const facets = await getPromptTemplateFacets();
  const paths = facets.tags.flatMap((tag) => ([
    { params: { slug: slugifyTaxonomySegment(tag) }, locale: "zh" },
    { params: { slug: slugifyTaxonomySegment(tag) }, locale: "en" },
  ]));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<TagPageProps> = async ({ params }) => {
  const slug = String(params?.slug || "");
  const facets = await getPromptTemplateFacets();
  const tag = findTaxonomyValueBySlug(facets.tags, slug);
  if (!tag) return { notFound: true, revalidate: 60 };

  const initialPage = await getPromptTemplatesPage({
    cursor: 0,
    limit: PAGE_SIZE,
    tags: [tag],
    tagsMode: "and",
  });

  return {
    props: {
      tag,
      initialTemplates: initialPage.templates,
      initialNextCursor: initialPage.nextCursor,
      initialHasMore: initialPage.hasMore,
      relatedStyles: facets.styles.slice(0, 12).map((item) => ({ label: item, href: getStyleGalleryPath(item) })),
      relatedTags: facets.tags
        .filter((item) => item !== tag)
        .slice(0, 12)
        .map((item) => ({ label: item, href: getTagGalleryPath(item) })),
    },
    revalidate: 300,
  };
};

export default TagPage;
