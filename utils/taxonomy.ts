export function slugifyTaxonomySegment(input: string) {
  return String(input || "")
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getStyleGalleryPath(style: string) {
  return `/gallery/style/${slugifyTaxonomySegment(style)}`;
}

export function getTagGalleryPath(tag: string) {
  return `/gallery/tag/${slugifyTaxonomySegment(tag)}`;
}

export function findTaxonomyValueBySlug(values: string[], slug: string) {
  const target = String(slug || "").trim().toLowerCase();
  return values.find((value) => slugifyTaxonomySegment(value) === target);
}
