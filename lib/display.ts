export function formatCategory(category: string): string {
  return category.replace(/^\d+-/, "");
}

export function formatSource(source: string): string {
  if (!source || source === "待补充来源") return "2026 新生攻略";
  return source.replace(/^用户确认入库的《(.+)》.*$/, "$1");
}

export function cleanExcerpt(text: string, maxLength = 150): string {
  const cleaned = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^---[\s\S]*?\n---\s*/m, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1$2")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*>\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\s[-*+]\s+/g, " ")
    .replace(/\s\d+\.\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength)}…`;
}
