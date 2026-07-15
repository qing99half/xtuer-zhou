import Link from "next/link";
import { getApprovedMarkdownDocuments } from "@/lib/markdown";
import { libraryCategories } from "@/lib/site-data";

export default function LibraryPage() {
  const documents = getApprovedMarkdownDocuments();

  return (
    <>
      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">资料库</span>
        <h1>沿用本地 docs 目录，先展示已审核资料</h1>
        <p>
          当前腾讯文档导出内容仍在 `docs/99-待整理资料/`，不会直接进入正式资料库或 RAG 索引。
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">分类导航</span>
            <h2 style={{ marginTop: 10 }}>和本地资料目录保持一致</h2>
          </div>
        </div>
        <div className="grid grid-3">
          {libraryCategories.map((category) => (
            <article className="library-card" key={category.path}>
              <span className="status-pill">{category.status}</span>
              <h3 style={{ marginTop: 12 }}>{category.title}</h3>
              <p>{category.description}</p>
              <span className="tag">{category.path}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">已审核资料</span>
            <h2 style={{ marginTop: 10 }}>当前可展示文档</h2>
          </div>
        </div>
        {documents.length > 0 ? (
          <div className="grid">
            {documents.map((document) => (
              <article className="library-card" key={document.slug}>
                <span className="status-pill">{document.status}</span>
                <h3 style={{ marginTop: 12 }}>
                  <Link href={`/library/${document.slug}`}>{document.title}</Link>
                </h3>
                <p>{document.excerpt || "该资料已通过审核，可用于后续知识库展示与 RAG 索引准备。"}</p>
                <div className="tag-list">
                  <span className="tag">{document.category}</span>
                  <span className="tag">更新：{document.updatedAt}</span>
                  <span className="tag">来源：{document.source}</span>
                  <span className="tag">{document.indexable ? "允许索引" : "不索引"}</span>
                </div>
                <div className="card-actions">
                  <Link className="secondary-button" href={`/library/${document.slug}`}>
                    查看全文
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>暂无已审核资料</h3>
            <p>
              已下载的新生攻略仍在待整理区。经用户审核后，再迁移到正式目录并展示在这里。
            </p>
          </div>
        )}
      </section>
    </>
  );
}
