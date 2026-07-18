import { NextResponse } from "next/server";
import { polishAnswerWithDeepSeek } from "@/lib/deepseek";
import { searchRag } from "@/lib/rag";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { question?: string } | null;
  const question = body?.question?.trim() ?? "";

  if (!question) {
    return NextResponse.json(
      {
        covered: false,
        answer: "请先输入一个问题。",
        sources: [],
      },
      { status: 400 },
    );
  }

  const result = searchRag(question);

  if (!result.covered) {
    return NextResponse.json(result);
  }

  const polishedAnswer = await polishAnswerWithDeepSeek(question, result.sources).catch(() => null);

  return NextResponse.json({
    ...result,
    answer: polishedAnswer ?? result.answer,
  });
}
