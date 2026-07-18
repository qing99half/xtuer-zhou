import Link from "next/link";
import { AskPanel } from "@/components/ask-panel";
import { cleanExcerpt } from "@/lib/display";
import { getApprovedMarkdownDocuments } from "@/lib/markdown";
import { getDocumentHref } from "@/lib/routes";
import { getSectionBySlug } from "@/lib/site-data";

export const metadata = {
  title: "常见问答 | xtuer-zhou",
};

export default function QaPage() {
  const qaDocs = getApprovedMarkdownDocuments().filter(
    (doc) =>
      doc.tags.includes("Q&A") ||
      doc.title.includes("Q&A") ||
      doc.title.includes("QA"),
  );

  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">常见问答</span>
      </nav>

      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">常见问答</span>
        <h1>新生高频问题速查</h1>
        <p>汇总报到、校园政策、奖助学金、升学就业四大方向的问答文档；也可以直接在下面的问答框里输入你想问的问题。</p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{qaDocs.length} 篇问答文档</span>
            <h2 style={{ marginTop: 10 }}>直接点卡片查看整理好的答案</h2>
          </div>
        </div>
        {qaDocs.length > 0 ? (
          <div className="grid grid-4">
            {qaDocs.map((doc) => {
              const sectionMeta = getSectionBySlug(doc.primarySection);
              return (
                <article className="library-card clickable-card" key={doc.slug}>
                  <Link
                    aria-label={`查看${doc.title}`}
                    className="card-overlay-link"
                    href={getDocumentHref(doc.slug)}
                  />
                  <span className="status-pill">{sectionMeta ? sectionMeta.title : doc.primarySection}</span>
                  <h3 style={{ marginTop: 12 }}>
                    <Link href={getDocumentHref(doc.slug)}>{doc.title}</Link>
                  </h3>
                  <p>{cleanExcerpt(doc.excerpt)}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>暂无问答类资料</h3>
            <p>后续会补充。</p>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">找不到答案？</span>
            <h2 style={{ marginTop: 10 }}>直接问 AI 助手</h2>
          </div>
        </div>
        <AskPanel />
      </section>
    </>
  );
}
