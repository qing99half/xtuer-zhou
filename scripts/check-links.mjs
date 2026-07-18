import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, "docs");

// Match `[text](/library/xxx)` in md; allow spaces inside title but not paren.
const LINK_PATTERN = /\[[^\]]+\]\((\/library\/[^)\s]+)\)/g;

function walkMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "99-待整理资料" || entry.name === "_shared") return [];
      return walkMarkdownFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
  });
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function collectExistingDocs() {
  const set = new Set();
  for (const file of walkMarkdownFiles(DOCS_ROOT)) {
    const relative = path.relative(DOCS_ROOT, file).replaceAll("\\", "/");
    set.add(relative.replace(/\.md$/, ""));
  }
  return set;
}

const existing = collectExistingDocs();
const failures = [];

for (const file of walkMarkdownFiles(DOCS_ROOT)) {
  const raw = fs.readFileSync(file, "utf-8");
  const relativeSource = path.relative(ROOT, file).replaceAll("\\", "/");
  let match;
  while ((match = LINK_PATTERN.exec(raw)) !== null) {
    const rawHref = match[1];
    const [pathnameRaw] = rawHref.split("#");
    const [pathname] = pathnameRaw.split("?");
    // strip leading "/library/"
    const rest = pathname.replace(/^\/library\//, "").replace(/\/$/, "");
    if (!rest) continue;
    const decoded = rest.split("/").map(decodeSegment).join("/");
    if (!existing.has(decoded)) {
      failures.push({ source: relativeSource, href: rawHref, resolved: decoded });
    }
  }
}

if (failures.length > 0) {
  console.error(`\n❌ ${failures.length} broken internal link(s) found:\n`);
  for (const item of failures) {
    console.error(`  ${item.source}`);
    console.error(`    -> ${item.href}`);
    console.error(`    (resolved: docs/${item.resolved}.md — not found)\n`);
  }
  process.exit(1);
}

console.log(`✅ All internal /library/... links resolve. Scanned ${existing.size} docs.`);
