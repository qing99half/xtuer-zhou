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
  excerpt: string;
  content: string;
};

const DOCS_ROOT = path.join(process.cwd(), "docs");

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

    return {
      slug: relativePath.replace(/\.md$/, ""),
      title: meta.title || path.basename(entry.name, ".md"),
      category: meta.category || relativePath.split("/")[0] || "未分类",
      status: meta.status === "已审核" ? "已审核" : "待整理",
      source: meta.source || "待补充来源",
      updatedAt: meta.updatedAt || "待更新",
      indexable: meta.indexable !== "false",
      excerpt,
      content,
    } satisfies MarkdownDocument;
  });
}

export function getApprovedMarkdownDocuments(): MarkdownDocument[] {
  return readMarkdownDocuments().filter((document) => document.status === "已审核");
}

export function getApprovedMarkdownDocumentBySlug(slug: string): MarkdownDocument | undefined {
  return getApprovedMarkdownDocuments().find((document) => document.slug === slug);
}
