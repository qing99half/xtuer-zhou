import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanExcerpt } from "@/lib/display";
import { getDocumentsByPrimarySection, getDocumentsBySection } from "@/lib/markdown";
import { getDocumentHref, getSectionHref } from "@/lib/routes";
import { getSectionBySlug, sections } from "@/lib/site-data";

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({ params }: SectionPageProps) {
  const { section } = await params;
  const meta = getSectionBySlug(section);
  return {
    title: meta ? `${meta.title} | xtuer-zhou 资料库` : "分类页 | xtuer-zhou",
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section } = await params;
  const meta = getSectionBySlug(section);
  if (!meta) {
    notFound();
  }

  const primary = getDocumentsByPrimarySection(section);
  const shared = getDocumentsBySection(section).filter(
    (doc) => doc.primarySection !== section,
  );

  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <Link href="/library">资料库</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{meta.title}</span>
      </nav>

      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">主题分类</span>
        <h1>
          {meta.emoji ? <span aria-hidden="true">{meta.emoji} </span> : null}
          {meta.title}
        </h1>
        <p>{meta.description}</p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">本主题资料</span>
            <h2 style={{ marginTop: 10 }}>共 {primary.length} 篇</h2>
          </div>
        </div>
        {primary.length > 0 ? (
          <div className="grid grid-3">
            {primary.map((doc) => (
              <article className="library-card clickable-card" key={doc.slug}>
                <Link
                  aria-label={`查看${doc.title}`}
                  className="card-overlay-link"
                  href={getDocumentHref(doc.slug)}
                />
                <h3 style={{ marginTop: 4 }}>
                  <Link href={getDocumentHref(doc.slug)}>{doc.title}</Link>
                </h3>
                <p>{cleanExcerpt(doc.excerpt)}</p>
                <div className="tag-list">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <span className="tag" key={tag}>#{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>本主题暂无资料</h3>
            <p>后续会补充这个方向的内容，欢迎通过加群咨询提供你想看的话题。</p>
          </div>
        )}
      </section>

      {shared.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">来自其他主题</span>
              <h2 style={{ marginTop: 10 }}>也和「{meta.title}」相关</h2>
            </div>
          </div>
          <div className="grid grid-3">
            {shared.map((doc) => {
              const originSection = getSectionBySlug(doc.primarySection);
              return (
                <article className="library-card clickable-card" key={doc.slug}>
                  <Link
                    aria-label={`查看${doc.title}`}
                    className="card-overlay-link"
                    href={getDocumentHref(doc.slug)}
                  />
                  {originSection ? (
                    <span className="status-pill">主题：{originSection.title}</span>
                  ) : null}
                  <h3 style={{ marginTop: 12 }}>
                    <Link href={getDocumentHref(doc.slug)}>{doc.title}</Link>
                  </h3>
                  <p>{cleanExcerpt(doc.excerpt)}</p>
                  {originSection ? (
                    <div className="card-actions">
                      <Link className="secondary-button" href={getSectionHref(originSection.slug)}>
                        查看主题「{originSection.title}」
                      </Link>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
