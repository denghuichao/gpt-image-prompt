export function previewBlogImage(src: string | undefined) {
  if (!src || !src.startsWith("/blog_images/") || src.startsWith("/blog_images/preview/")) {
    return src || "";
  }
  return src.replace("/blog_images/", "/blog_images/preview/");
}

