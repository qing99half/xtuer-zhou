export function getDocumentHref(slug: string): string {
  return `/library/${slug.split("/").map(encodeURIComponent).join("/")}`;
}

export function getSectionHref(sectionSlug: string): string {
  return `/library/${encodeURIComponent(sectionSlug)}`;
}

export function getPhaseHref(phaseSlug: string): string {
  return `/guide/${encodeURIComponent(phaseSlug)}`;
}

export function getSourceDocumentHref(mdPath: string): string {
  const clean = mdPath.replace(/^docs\//, "").replace(/\.md$/, "");
  return getDocumentHref(clean);
}
