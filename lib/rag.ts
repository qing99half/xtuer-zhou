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
      answer: "资料库暂未覆盖这个问题。你可以换一种问法，或通过加群咨询补充资料。",
      sources: [],
    };
  }

  const scored = chunks
    .map((chunk) => {
      const title = chunk.title.toLowerCase();
      const category = chunk.category.toLowerCase();
      const heading = chunk.heading.toLowerCase();
      const text = chunk.text.toLowerCase();
      const score = queryTokens.reduce((sum, token) => {
        if (title.includes(token)) return sum + 5;
        if (heading.includes(token)) return sum + 4;
        if (category.includes(token)) return sum + 3;
        if (text.includes(token)) return sum + 1;
        return sum;
      }, 0);
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (scored.length === 0) {
    return {
      covered: false,
      answer: "资料库暂未覆盖这个问题。当前本地问答只会基于已审核资料回答，不会编造答案。建议查看资料库或加群咨询。",
      sources: [],
    };
  }

  const sources = scored.map((item) => item.chunk);
  const answer = [
    "根据当前已审核资料，找到以下相关内容：",
    ...sources.map((source, index) => `${index + 1}. ${source.title} · ${source.heading}：${source.text.slice(0, 220)}`),
    "以上回答来自本地资料索引，可点击来源查看完整资料。",
  ].join("\n\n");

  return { covered: true, answer, sources };
}
