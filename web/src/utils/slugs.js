export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function contentSlug(item) {
  return item?.slug || slugify(item?.title) || String(item?.id || "");
}
