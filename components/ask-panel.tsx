"use client";

import { FormEvent, useState } from "react";

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

export function AskPanel() {
  const examples = ["新生群是什么？", "学在湘大有哪些内容？", "校园生活包括什么？"];
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
      <span className="status-pill">本地 RAG · 已接入</span>
      <h2>先问一个新生问题</h2>
      <form className="ask-form" onSubmit={handleSubmit}>
        <input
          className="ask-input"
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="例如：新生群是什么？选课有哪些主题？"
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
      <p>当前只基于已审核资料进行关键词检索；资料不足时不会编造答案。</p>
      {error ? <p className="error-text">{error}</p> : null}
      {result ? (
        <section className="answer-panel">
          <span className={result.covered ? "status-pill" : "eyebrow"}>
            {result.covered ? "找到相关资料" : "资料暂未覆盖"}
          </span>
          <pre>{result.answer}</pre>
          {result.sources.length > 0 ? (
            <div className="source-list">
              <h3>引用来源</h3>
              {result.sources.map((source) => (
                <article className="source-card" key={source.id}>
                  <a href={`/library/${source.path.replace(/^docs\//, "").replace(/\.md$/, "")}?highlight=${encodeURIComponent(source.text.slice(0, 80))}#${encodeURIComponent(source.heading)}`}>
                    <strong>{source.title}</strong>
                  </a>
                  <span>{source.heading}</span>
                  <small>
                    {source.path} · {source.updatedAt} · {source.source}
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
