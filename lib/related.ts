import { getApprovedMarkdownDocuments, type MarkdownDocument } from "./markdown";

export type RelatedDocument = MarkdownDocument & {
  reason: "same-section" | "shared-tag" | "cross-section" | "back-link";
  score: number;
};

const INTERNAL_LINK_PATTERN = /\[[^\]]+\]\((\/library\/[^)\s]+)\)/g;

function normalizeInternalHref(href: string): string {
  return href
    .split("#")[0]
    .split("?")[0]
    .replace(/\/$/, "");
}

function extractInternalLinks(content: string): string[] {
  const matches = content.matchAll(INTERNAL_LINK_PATTERN);
  return Array.from(new Set(Array.from(matches, (match) => normalizeInternalHref(match[1]))));
}

function documentHrefCandidates(doc: MarkdownDocument): string[] {
  const slugWithoutSectionPrefix = doc.slug.split("/").slice(1).join("/");
  const bare = doc.slug.split("/").pop() ?? doc.slug;
  const encoded = (value: string) =>
    value.split("/").map(encodeURIComponent).join("/");

  const candidates = new Set<string>();
  candidates.add(`/library/${doc.slug}`);
  candidates.add(`/library/${encoded(doc.slug)}`);
  if (slugWithoutSectionPrefix) {
    candidates.add(`/library/${doc.primarySection}/${slugWithoutSectionPrefix}`);
    candidates.add(`/library/${doc.primarySection}/${encoded(slugWithoutSectionPrefix)}`);
  }
  candidates.add(`/library/${doc.primarySection}/${bare}`);
  candidates.add(`/library/${doc.primarySection}/${encodeURIComponent(bare)}`);
  return Array.from(candidates);
}

type BackLinkIndex = Map<string, MarkdownDocument[]>;

let backLinkIndexCache: BackLinkIndex | null = null;

export function buildBackLinkIndex(force = false): BackLinkIndex {
  if (backLinkIndexCache && !force) return backLinkIndexCache;

  const docs = getApprovedMarkdownDocuments();
  const bySlug = new Map<string, MarkdownDocument>();
  const hrefToDoc = new Map<string, MarkdownDocument>();

  for (const doc of docs) {
    bySlug.set(doc.slug, doc);
    for (const href of documentHrefCandidates(doc)) {
      hrefToDoc.set(href, doc);
    }
  }

  const backLinks: BackLinkIndex = new Map();
  for (const source of docs) {
    const outgoing = extractInternalLinks(source.content);
    for (const href of outgoing) {
      const target = hrefToDoc.get(href);
      if (!target || target.slug === source.slug) continue;
      const bucket = backLinks.get(target.slug) ?? [];
      if (!bucket.some((existing) => existing.slug === source.slug)) {
        bucket.push(source);
      }
      backLinks.set(target.slug, bucket);
    }
  }

  backLinkIndexCache = backLinks;
  return backLinks;
}

export function getBackLinks(slug: string): MarkdownDocument[] {
  return buildBackLinkIndex().get(slug) ?? [];
}

function sharedCount<T>(a: T[], b: T[]): number {
  const setB = new Set(b);
  let count = 0;
  for (const item of a) {
    if (setB.has(item)) count += 1;
  }
  return count;
}

export function getRelatedDocuments(
  current: MarkdownDocument,
  limit = 6,
): RelatedDocument[] {
  const all = getApprovedMarkdownDocuments().filter((doc) => doc.slug !== current.slug);
  const backLinkSet = new Set(getBackLinks(current.slug).map((doc) => doc.slug));
  const scored = new Map<string, RelatedDocument>();

  for (const doc of all) {
    const sharedSectionsCount = sharedCount(doc.sections, current.sections);
    const sharedTagsCount = sharedCount(doc.tags, current.tags);
    const isBackLink = backLinkSet.has(doc.slug);
    if (sharedSectionsCount === 0 && sharedTagsCount === 0 && !isBackLink) continue;

    let score = 0;
    let reason: RelatedDocument["reason"] = "cross-section";

    if (doc.primarySection === current.primarySection) {
      score += 4;
      reason = "same-section";
    } else if (sharedSectionsCount > 0) {
      score += 2;
      reason = "cross-section";
    }

    if (sharedTagsCount > 0) {
      score += sharedTagsCount * 2;
      if (reason === "cross-section" && doc.primarySection !== current.primarySection) {
        reason = "shared-tag";
      }
    }

    if (isBackLink) {
      score += 3;
      reason = "back-link";
    }

    score += Math.min(doc.weight, 100) / 20;

    scored.set(doc.slug, { ...doc, reason, score });
  }

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getPrevNextInSection(
  current: MarkdownDocument,
): { prev?: MarkdownDocument; next?: MarkdownDocument } {
  const siblings = getApprovedMarkdownDocuments()
    .filter((doc) => doc.primarySection === current.primarySection)
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.title.localeCompare(b.title, "zh-Hans-CN");
    });

  const index = siblings.findIndex((doc) => doc.slug === current.slug);
  if (index === -1) return {};

  return {
    prev: index > 0 ? siblings[index - 1] : undefined,
    next: index < siblings.length - 1 ? siblings[index + 1] : undefined,
  };
}
