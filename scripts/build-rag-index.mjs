import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, "docs");
const OUTPUT_DIR = path.join(ROOT, "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "rag-index.json");

function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return {};
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return {};

  return raw
    .slice(3, end)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((meta, line) => {
      const index = line.indexOf(":");
      if (index === -1) return meta;
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      meta[key] = value;
      return meta;
    }, {});
}

function stripFrontmatter(raw) {
  if (!raw.startsWith("---")) return raw;
  const end = raw.indexOf("\n---", 3);
  return end === -1 ? raw : raw.slice(end + 4).trim();
}

function walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function splitIntoChunks(content) {
  const normalized = content
    .replace(/```[\s\S]*?```/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const chunks = [];
  let currentHeading = "正文";
  let buffer = [];

  for (const line of normalized) {
    if (line.startsWith("#")) {
      if (buffer.length > 0) {
        chunks.push({ heading: currentHeading, text: buffer.join("\n") });
        buffer = [];
      }
      currentHeading = line.replace(/^#+\s*/, "");
      continue;
    }

    buffer.push(line);
    if (buffer.join(" ").length >= 260) {
      chunks.push({ heading: currentHeading, text: buffer.join("\n") });
      buffer = [];
    }
  }

  if (buffer.length > 0) {
    chunks.push({ heading: currentHeading, text: buffer.join("\n") });
  }

  return chunks.filter((chunk) => chunk.text.length > 12);
}

const files = walkMarkdownFiles(DOCS_ROOT);
const documents = files.flatMap((filePath) => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const meta = parseFrontmatter(raw);
  if (meta.status !== "已审核" || meta.indexable === "false") return [];

  const relativePath = path.relative(ROOT, filePath).replaceAll("\\", "/");
  const content = stripFrontmatter(raw);

  return splitIntoChunks(content).map((chunk, index) => ({
    id: `${relativePath}#${index + 1}`,
    title: meta.title || path.basename(filePath, ".md"),
    category: meta.category || relativePath.split("/")[1] || "未分类",
    source: meta.source || "待补充来源",
    updatedAt: meta.updatedAt || "待更新",
    path: relativePath,
    heading: chunk.heading,
    text: chunk.text,
  }));
});

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(
  OUTPUT_FILE,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), chunks: documents }, null, 2)}\n`,
  "utf-8",
);

console.log(`RAG index generated: ${documents.length} chunks -> ${path.relative(ROOT, OUTPUT_FILE)}`);
