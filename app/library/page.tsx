import Link from "next/link";
import { cleanExcerpt } from "@/lib/display";
import { getApprovedMarkdownDocuments, getDocumentsByPrimarySection } from "@/lib/markdown";
import { getDocumentHref, getSectionHref } from "@/lib/routes";
import { sections } from "@/lib/site-data";

export default function LibraryPage() {
  const allDocs = getApprovedMarkdownDocuments();

  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">资料库</span>
      </nav>

      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">新生指南资料库</span>
        <h1>按主题浏览你需要的入学信息</h1>
        <p>
          8 个主题覆盖新生从暑期录取到大一整年的核心问题。点击主题卡进入分类页；也可以在下方直接翻阅全部资料。
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">主题导航</span>
            <h2 style={{ marginTop: 10 }}>8 个主题入口</h2>
          </div>
        </div>
        <div className="grid grid-4">
          {sections
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((section) => {
              const docs = getDocumentsByPrimarySection(section.slug);
              return (
                <article className="library-card clickable-card" key={section.slug}>
                  <Link
                    aria-label={`查看${section.title}`}
                    className="card-overlay-link"
                    href={getSectionHref(section.slug)}
                  />
                  <span className="status-pill">
                    {section.emoji ? <>{section.emoji} </> : null}
                    {section.title}
                  </span>
                  <h3 style={{ marginTop: 12 }}>
                    <Link href={getSectionHref(section.slug)}>{section.title}</Link>
                  </h3>
                  <p>{section.description}</p>
                  <div className="tag-list">
                    <span className="tag">{docs.length} 篇</span>
                  </div>
                </article>
              );
            })}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">全部资料</span>
            <h2 style={{ marginTop: 10 }}>共 {allDocs.length} 篇</h2>
          </div>
        </div>
        <div className="grid grid-3">
          {allDocs.map((doc) => (
            <article className="library-card clickable-card" key={doc.slug}>
              <Link
                aria-label={`查看${doc.title}`}
                className="card-overlay-link"
                href={getDocumentHref(doc.slug)}
              />
              <span className="status-pill">
                {sections.find((s) => s.slug === doc.primarySection)?.title ?? doc.primarySection}
              </span>
              <h3 style={{ marginTop: 12 }}>
                <Link href={getDocumentHref(doc.slug)}>{doc.title}</Link>
              </h3>
              <p>{cleanExcerpt(doc.excerpt)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
