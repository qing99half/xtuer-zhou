import fs from "node:fs";
import path from "node:path";

export type RagChunk = {
  id: string;
  title: string;
  category: string;
  source: string;
  updatedAt: string;
  path: string;
  heading: string;
  text: string;
};

export type RagAnswer = {
  answer: string;
  sources: RagChunk[];
  covered: boolean;
};

type ScoredChunk = {
  chunk: RagChunk;
  score: number;
  matchedTokens: number;
};

const INDEX_PATH = path.join(process.cwd(), "data", "rag-index.json");

function tokenize(input: string): string[] {
  const normalized = input.toLowerCase().replace(/[，。！？、；：,.!?;:()（）【】\[\]"']/g, " ");
  const latinTokens = normalized.split(/\s+/).filter((token) => token.length >= 2);
  const cjkTokens = Array.from(normalized.matchAll(/[一-龥]{2,}/g)).flatMap((match) => {
    const text = match[0];
    const grams = new Set<string>();
    for (let size = 2; size <= Math.min(4, text.length); size += 1) {
      for (let index = 0; index <= text.length - size; index += 1) {
        grams.add(text.slice(index, index + size));
      }
    }
    return Array.from(grams);
  });

  return Array.from(new Set([...latinTokens, ...cjkTokens]));
}

function getSnippet(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}…`;
}

function formatSourceLine(source: RagChunk, index: number): string {
  return `${index + 1}. ${source.title} · ${source.heading}\n   ${getSnippet(source.text)}`;
}

export function loadRagChunks(): RagChunk[] {
  if (!fs.existsSync(INDEX_PATH)) return [];
  const raw = fs.readFileSync(INDEX_PATH, "utf-8");
  const parsed = JSON.parse(raw) as { chunks?: RagChunk[] };
  return Array.isArray(parsed.chunks) ? parsed.chunks : [];
}

export function searchRag(question: string): RagAnswer {
  const chunks = loadRagChunks();
  const queryTokens = tokenize(question);

  if (!question.trim() || queryTokens.length === 0 || chunks.length === 0) {
    return {
      covered: false,
      answer: "这个问题暂时还没整理进指南。你可以换一种问法，或通过加群咨询补充信息。",
      sources: [],
    };
  }

  const scored: ScoredChunk[] = chunks
    .map((chunk) => {
      const title = chunk.title.toLowerCase();
      const category = chunk.category.toLowerCase();
      const heading = chunk.heading.toLowerCase();
      const text = chunk.text.toLowerCase();
      let matchedTokens = 0;
      const score = queryTokens.reduce((sum, token) => {
        if (title.includes(token)) {
          matchedTokens += 1;
          return sum + 5;
        }
        if (heading.includes(token)) {
          matchedTokens += 1;
          return sum + 4;
        }
        if (category.includes(token)) {
          matchedTokens += 1;
          return sum + 3;
        }
        if (text.includes(token)) {
          matchedTokens += 1;
          return sum + 1;
        }
        return sum;
      }, 0);
      return { chunk, score, matchedTokens };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.matchedTokens - a.matchedTokens)
    .slice(0, 3);

  if (scored.length === 0) {
    return {
      covered: false,
      answer: "这个问题暂时还没整理进指南。当前问答只会参考已整理内容，不会编造答案。建议查看资料库或加群咨询。",
      sources: [],
    };
  }

  const sources = scored.map((item) => item.chunk);
  const answer = [
    `根据当前已审核资料，找到 ${sources.length} 条相关内容：`,
    ...sources.map(formatSourceLine),
    "提示：回答会优先参考已整理的新生攻略内容。若问题涉及最新政策、具体时间或个人情况，请以学校官方通知或人工咨询为准。",
  ].join("\n\n");

  return { covered: true, answer, sources };
}
