import Link from "next/link";
import { getDocumentsByPhase } from "@/lib/markdown";
import { getPhaseHref } from "@/lib/routes";
import { phases } from "@/lib/site-data";

export default function GuidePage() {
  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">新生指南</span>
      </nav>

      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">按时间线阅读</span>
        <h1>新生入学 6 段时间线</h1>
        <p>
          从暑期收到录取通知，到大一整个学年，按 6 个阶段一步步来。每个阶段的卡片可以点开，展开该阶段推荐阅读的资料。
        </p>
      </section>

      <section className="section">
        <div className="grid grid-3">
          {phases.map((phase) => {
            const docs = getDocumentsByPhase(phase.slug);
            return (
              <article className="module-card clickable-card" key={phase.slug}>
                <Link
                  aria-label={`查看${phase.title}`}
                  className="card-overlay-link"
                  href={getPhaseHref(phase.slug)}
                />
                <span className="status-pill">阶段 {phase.order}</span>
                <h2 style={{ marginTop: 10 }}>
                  <Link href={getPhaseHref(phase.slug)}>{phase.title}</Link>
                </h2>
                <p>
                  <strong>{phase.when}</strong>
                </p>
                <p>{phase.intro}</p>
                <div className="tag-list">
                  <span className="tag">{docs.length} 篇资料</span>
                </div>
                <div className="card-actions">
                  <Link className="secondary-button" href={getPhaseHref(phase.slug)}>
                    查看这一阶段
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
