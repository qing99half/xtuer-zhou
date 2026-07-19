import Link from "next/link";
import { notFound } from "next/navigation";
import { cleanExcerpt } from "@/lib/display";
import { getDocumentsByPhase } from "@/lib/markdown";
import { getDocumentHref, getPhaseHref } from "@/lib/routes";
import { getPhaseBySlug, phases, getSectionBySlug } from "@/lib/site-data";

type PhasePageProps = {
  params: Promise<{ phase: string }>;
};

export function generateStaticParams() {
  return phases.map((phase) => ({ phase: phase.slug }));
}

export async function generateMetadata({ params }: PhasePageProps) {
  const { phase } = await params;
  const meta = getPhaseBySlug(phase);
  return {
    title: meta ? `${meta.title} | 新生指南` : "指南阶段 | xtuer-zhou",
  };
}

export default async function PhasePage({ params }: PhasePageProps) {
  const { phase } = await params;
  const meta = getPhaseBySlug(phase);
  if (!meta) {
    notFound();
  }

  const docs = getDocumentsByPhase(phase);
  const currentIndex = phases.findIndex((item) => item.slug === phase);
  const prev = currentIndex > 0 ? phases[currentIndex - 1] : undefined;
  const next = currentIndex < phases.length - 1 ? phases[currentIndex + 1] : undefined;

  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <Link href="/guide">新生指南</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{meta.title}</span>
      </nav>

      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">时间线 · 第 {meta.order} 段</span>
        <h1>{meta.title}</h1>
        <p>
          <strong>{meta.when}</strong>
          <span style={{ color: "var(--muted)", marginLeft: 12 }}>{meta.intro}</span>
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">本阶段建议阅读</span>
            <h2 style={{ marginTop: 10 }}>共 {docs.length} 篇</h2>
          </div>
        </div>
        {docs.length > 0 ? (
          <div className="grid grid-3">
            {docs.map((doc) => {
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
            <h3>本阶段资料尚未整理完全</h3>
            <p>需要这方面的资料，请到<Link href="/about#announce">公告栏</Link>添加下方学长微信联系方式即可获取。</p>
          </div>
        )}
      </section>

      <nav aria-label="阶段导航" className="prev-next-nav">
        {prev ? (
          <Link className="prev-next-card" href={getPhaseHref(prev.slug)}>
            <span className="eyebrow">← 上一段</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
        {next ? (
          <Link className="prev-next-card next" href={getPhaseHref(next.slug)}>
            <span className="eyebrow">下一段 →</span>
            <strong>{next.title}</strong>
          </Link>
        ) : null}
      </nav>
    </>
  );
}
