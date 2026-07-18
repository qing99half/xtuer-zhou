"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getSourceDocumentHref } from "@/lib/routes";

type Source = {
  id: string;
  title: string;
  category: string;
  source: string;
  updatedAt: string;
  path: string;
  heading: string;
  text: string;
};

type AskResponse = {
  answer: string;
  covered: boolean;
  sources: Source[];
};

function sourceHref(source: Source) {
  const baseHref = getSourceDocumentHref(source.path);
  const highlight = encodeURIComponent(source.text.slice(0, 80));
  const heading = encodeURIComponent(source.heading);
  return `${baseHref}?highlight=${highlight}#${heading}`;
}

export function AskPanel() {
  const examples = ["新生群是什么？", "报到前要准备什么？", "校园生活有哪些常用工具？"];
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) {
      setError("请先输入一个问题。");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = (await response.json()) as AskResponse;
      setResult(data);
    } catch {
      setError("问答接口暂时不可用，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="ask-box card">
      <span className="status-pill">智能问答助手</span>
      <h2>新生问题先问这里</h2>
      <form className="ask-form" onSubmit={handleSubmit}>
        <input
          className="ask-input"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="例如：新生群是什么？报到前要准备什么？"
          value={question}
        />
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "检索中" : "提问"}
        </button>
      </form>
      <div className="example-list" aria-label="示例问题">
        {examples.map((example) => (
          <button className="example-button" key={example} onClick={() => setQuestion(example)} type="button">
            {example}
          </button>
        ))}
      </div>
      <p>答案会优先参考已整理的新生攻略内容。找不到时，会提醒你去加群咨询。</p>
      {error ? <p className="error-text">{error}</p> : null}
      {result ? (
        <section className="answer-panel">
          <span className={result.covered ? "status-pill" : "eyebrow"}>
            {result.covered ? "找到相关指南" : "暂时没找到"}
          </span>
          <pre>{result.answer}</pre>
          {result.sources.length > 0 ? (
            <div className="source-list">
              <div className="source-heading">
                <h3>参考内容</h3>
                <span>{result.sources.length} 条相关指南</span>
              </div>
              {result.sources.map((source, index) => (
                <article className="source-card" key={source.id}>
                  <Link href={sourceHref(source)}>
                    <strong>{index + 1}. {source.title}</strong>
                  </Link>
                  <span>{source.heading}</span>
                  <p>{source.text.replace(/\s+/g, " ").slice(0, 120)}{source.text.length > 120 ? "…" : ""}</p>
                  <small>
                    {source.updatedAt} · {source.source}
                  </small>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </aside>
  );
}
