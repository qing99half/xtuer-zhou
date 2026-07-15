import { guideModules } from "@/lib/site-data";

export default function GuidePage() {
  return (
    <>
      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">入学指南</span>
        <h1>统一模板整理四个新生核心模块</h1>
        <p>
          当前页面先完成信息架构骨架。正式内容需要从待整理资料中拆分，经用户审核后再写入对应模块。
        </p>
      </section>

      <section className="section">
        <div className="grid">
          {guideModules.map((module) => (
            <article className="module-card" key={module.slug}>
              <div className="section-heading" style={{ marginBottom: 0 }}>
                <div>
                  <span className="status-pill">统一模板</span>
                  <h2 style={{ marginTop: 10 }}>{module.title}</h2>
                </div>
                <span className="tag">待审核内容填充</span>
              </div>
              <p>{module.summary}</p>
              <div className="grid grid-3" style={{ marginTop: 16 }}>
                <div className="empty-state">
                  <h3>核心问题</h3>
                  {module.questions.map((question) => (
                    <p key={question}>· {question}</p>
                  ))}
                </div>
                <div className="empty-state">
                  <h3>长文指南</h3>
                  <p>等待从已审核 Markdown 资料中写入正文，保持段落短小、标题清晰。</p>
                </div>
                <div className="empty-state">
                  <h3>引用来源</h3>
                  <p>后续展示资料来源、更新时间，并为 RAG 句子级引用做准备。</p>
                </div>
              </div>
              <div className="tag-list">
                {module.highlights.map((tag) => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
