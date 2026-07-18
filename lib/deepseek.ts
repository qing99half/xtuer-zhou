import type { RagChunk } from "@/lib/rag";

type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const DEFAULT_API_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";

function buildSourceText(sources: RagChunk[]) {
  return sources
    .map((source, index) => {
      const text = source.text.replace(/\s+/g, " ").trim();
      return `${index + 1}.《${source.title}》-${source.heading}：${text}`;
    })
    .join("\n");
}

function buildMessages(question: string, sources: RagChunk[]): DeepSeekMessage[] {
  return [
    {
      role: "system",
      content:
        "你是湘潭大学新生指南助手。请只根据用户提供的参考内容回答，不要编造参考内容之外的事实。表达要自然、口语化、像学长学姐给新生解释，语气友好但不要夸张。答案控制在 2-4 段，可以适当分点。若内容涉及群聊、政策、时间或个人选择，要提醒以学校官方通知或实际咨询为准。不要输出'根据资料1'这类生硬编号。",
    },
    {
      role: "user",
      content: `新生问题：${question}\n\n参考内容：\n${buildSourceText(sources)}\n\n请把答案整理成一段适合新生阅读的口语化回答。`,
    },
  ];
}

export async function polishAnswerWithDeepSeek(question: string, sources: RagChunk[]) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || sources.length === 0) return null;

  const response = await fetch(process.env.DEEPSEEK_API_URL || DEFAULT_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      messages: buildMessages(question, sources),
      temperature: 0.7,
      max_tokens: 700,
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as DeepSeekResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  return content || null;
}
