import fs from "node:fs";
import path from "node:path";

export type MarkdownDocument = {
  slug: string;
  title: string;
  category: string;
  status: "已审核" | "待整理";
  source: string;
  updatedAt: string;
  indexable: boolean;
  completeness: "complete" | "partial";
  completenessNote: string;
  primarySection: string;
  sections: string[];
  phase: string[];
  tags: string[];
  weight: number;
  excerpt: string;
  content: string;
};

export function normalizeDocumentSlug(slug: string): string {
  return slug
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");
}

const DOCS_ROOT = path.join(process.cwd(), "docs");

function parseArrayField(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  const body = trimmed.startsWith("[") && trimmed.endsWith("]")
    ? trimmed.slice(1, -1)
    : trimmed;
  return body
    .split(",")
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function parseFrontmatter(raw: string): Record<string, string> {
  if (!raw.startsWith("---")) {
    return {};
  }

  const end = raw.indexOf("\n---", 3);
  if (end === -1) {
    return {};
  }

  return raw
    .slice(3, end)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((meta, line) => {
      const index = line.indexOf(":");
      if (index === -1) {
        return meta;
      }

      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
      meta[key] = value;
      return meta;
    }, {});
}

function stripFrontmatter(raw: string): string {
  if (!raw.startsWith("---")) {
    return raw;
  }

  const end = raw.indexOf("\n---", 3);
  return end === -1 ? raw : raw.slice(end + 4).trim();
}

function inferPrimarySection(
  metaPrimary: string,
  metaSectionsRaw: string,
  relativePath: string,
): string {
  if (metaPrimary) return metaPrimary;
  const sectionsList = parseArrayField(metaSectionsRaw);
  if (sectionsList.length > 0) return sectionsList[0];
  const firstSegment = relativePath.split("/")[0] || "";
  return firstSegment.replace(/^\d+-/, "").replace(/[^a-z0-9-]/gi, "") || "misc";
}

function readMarkdownDocuments(): MarkdownDocument[] {
  if (!fs.existsSync(DOCS_ROOT)) {
    return [];
  }

  const files = fs
    .readdirSync(DOCS_ROOT, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  return files.map((entry) => {
    const fullPath = path.join(entry.parentPath, entry.name);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const meta = parseFrontmatter(raw);
    const relativePath = path.relative(DOCS_ROOT, fullPath).replaceAll("\\", "/");
    const content = stripFrontmatter(raw);
    const excerpt = content
      .replace(/^#\s+.+$/m, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    const primarySection = inferPrimarySection(
      meta.primarySection || "",
      meta.sections || "",
      relativePath,
    );
    const sectionsList = parseArrayField(meta.sections || "");
    const sections = sectionsList.length > 0
      ? Array.from(new Set([primarySection, ...sectionsList]))
      : [primarySection];
    const phase = parseArrayField(meta.phase || "");
    const tags = parseArrayField(meta.tags || "");
    const weightRaw = Number.parseInt(meta.weight || "0", 10);
    const weight = Number.isNaN(weightRaw) ? 0 : weightRaw;

    return {
      slug: relativePath.replace(/\.md$/, ""),
      title: meta.title || path.basename(entry.name, ".md"),
      category: meta.category || relativePath.split("/")[0] || "未分类",
      status: meta.status === "已审核" ? "已审核" : "待整理",
      source: meta.source || "待补充来源",
      updatedAt: meta.updatedAt || "待更新",
      indexable: meta.indexable !== "false",
      completeness: meta.completeness === "partial" ? "partial" : "complete",
      completenessNote: meta.completenessNote || "",
      primarySection,
      sections,
      phase,
      tags,
      weight,
      excerpt,
      content,
    } satisfies MarkdownDocument;
  });
}

export function getApprovedMarkdownDocuments(): MarkdownDocument[] {
  return readMarkdownDocuments().filter((document) => {
    if (document.status !== "已审核") return false;
    if (document.slug.startsWith("_shared/")) return false;
    if (document.primarySection === "_shared") return false;
    return true;
  });
}

export function getApprovedMarkdownDocumentBySlug(slug: string): MarkdownDocument | undefined {
  const normalizedSlug = normalizeDocumentSlug(slug);
  return getApprovedMarkdownDocuments().find((document) => document.slug === normalizedSlug);
}

function sortByWeight(a: MarkdownDocument, b: MarkdownDocument): number {
  if (b.weight !== a.weight) return b.weight - a.weight;
  return a.title.localeCompare(b.title, "zh-Hans-CN");
}

export function getDocumentsBySection(sectionSlug: string): MarkdownDocument[] {
  return getApprovedMarkdownDocuments()
    .filter((document) => document.sections.includes(sectionSlug))
    .sort(sortByWeight);
}

export function getDocumentsByPrimarySection(sectionSlug: string): MarkdownDocument[] {
  return getApprovedMarkdownDocuments()
    .filter((document) => document.primarySection === sectionSlug)
    .sort(sortByWeight);
}

export function getDocumentsByPhase(phaseSlug: string): MarkdownDocument[] {
  return getApprovedMarkdownDocuments()
    .filter((document) => document.phase.includes(phaseSlug))
    .sort(sortByWeight);
}

export function getDocumentsByTag(tag: string): MarkdownDocument[] {
  return getApprovedMarkdownDocuments()
    .filter((document) => document.tags.includes(tag))
    .sort(sortByWeight);
}
