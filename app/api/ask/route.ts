import { NextResponse } from "next/server";
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

  return NextResponse.json(searchRag(question));
}
