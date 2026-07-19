import Image from "next/image";
import Link from "next/link";
import { AskPanel } from "@/components/ask-panel";
import { cleanExcerpt } from "@/lib/display";
import {
  getApprovedMarkdownDocuments,
  getDocumentsByPhase,
  getDocumentsByPrimarySection,
} from "@/lib/markdown";
import { getDocumentHref, getPhaseHref, getSectionHref } from "@/lib/routes";
import { contacts, phases, sections } from "@/lib/site-data";

export default function HomePage() {
  const qaDocs = getApprovedMarkdownDocuments()
    .filter(
      (doc) =>
        doc.tags.includes("Q&A") ||
        doc.title.includes("Q&A") ||
        doc.title.includes("QA"),
    )
    .slice(0, 4);

  const contactCards = contacts;

  return (
    <>
      <Link className="fraud-banner" href="/about#anti-fraud">
        <span className="fraud-banner-tag">反诈提醒</span>
        <span className="fraud-banner-text">
          开学季骗子密集：自称 “校领导 / 辅导员 / 学姐” 不主动证明身份的一律警惕，出门在外有事找警察。
        </span>
        <span className="fraud-banner-cta">查看反诈提醒 →</span>
      </Link>

      <section className="hero">
        <div>
          <span className="eyebrow">湘潭大学 2026 新生攻略</span>
          <h1>把入学第一年的关键问题，一次讲清楚。</h1>
          <p>
            按 6 段时间线走完从暑期录取到大一整年；按 8 个主题查询任何生活、学业、办事问题；也可以直接向 AI 提问。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/guide">
              按时间线阅读
            </Link>
            <Link className="secondary-button" href="/library">
              按主题浏览
            </Link>
          </div>
          <div className="hero-highlights" aria-label="指南特点">
            <span>民间整理 · 非官方</span>
            <span>可跳转查看全文</span>
            <span>找不到就问 AI</span>
          </div>
        </div>
        <AskPanel />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">时间线</span>
            <h2 style={{ marginTop: 10 }}>6 段时间线，一步步来</h2>
          </div>
          <Link className="secondary-button" href="/guide">
            全部时间线
          </Link>
        </div>
        <div className="grid grid-3">
          {phases.map((phase) => {
            const count = getDocumentsByPhase(phase.slug).length;
            return (
              <article className="module-card clickable-card" key={phase.slug}>
                <Link
                  aria-label={`查看${phase.title}`}
                  className="card-overlay-link"
                  href={getPhaseHref(phase.slug)}
                />
                <span className="status-pill">阶段 {phase.order}</span>
                <h3 style={{ marginTop: 10 }}>
                  <Link href={getPhaseHref(phase.slug)}>{phase.title}</Link>
                </h3>
                <p>
                  <strong>{phase.when}</strong>
                </p>
                <p>{phase.intro}</p>
                <div className="tag-list">
                  <span className="tag">{count} 篇资料</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">主题</span>
            <h2 style={{ marginTop: 10 }}>8 个主题入口</h2>
          </div>
          <Link className="secondary-button" href="/library">
            打开资料库
          </Link>
        </div>
        <div className="grid grid-4">
          {sections.map((section) => {
            const count = getDocumentsByPrimarySection(section.slug).length;
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
                  <span className="tag">{count} 篇</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {qaDocs.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">高频问答</span>
              <h2 style={{ marginTop: 10 }}>先看这几个 Q&amp;A</h2>
            </div>
            <Link className="secondary-button" href="/qa">
              全部问答
            </Link>
          </div>
          <div className="grid grid-4">
            {qaDocs.map((doc) => (
              <article className="library-card clickable-card" key={doc.slug}>
                <Link
                  aria-label={`查看${doc.title}`}
                  className="card-overlay-link"
                  href={getDocumentHref(doc.slug)}
                />
                <span className="status-pill">Q&amp;A</span>
                <h3 style={{ marginTop: 12 }}>
                  <Link href={getDocumentHref(doc.slug)}>{doc.title}</Link>
                </h3>
                <p>{cleanExcerpt(doc.excerpt)}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">咨询入口</span>
            <h2 style={{ marginTop: 10 }}>资料不齐？添加联系方式即可获取</h2>
          </div>
          <Link className="secondary-button" href="/about#announce">
            查看完整公告栏
          </Link>
        </div>
        <p style={{ marginTop: -8 }}>
          指南里暂未整理完全的资料，添加下方任一联系方式即可获取。微信新生群需先添加学长微信后由学长邀请进入，以防不法分子混入。
        </p>
        <div className="grid grid-3">
          {contactCards.map((item) => (
            <article className="info-card contact-card clickable-card" key={item.label}>
              <Link
                aria-label={`查看${item.label}`}
                className="card-overlay-link"
                href="/about#announce"
              />
              {item.type === "qr" && item.image ? (
                <div className="qr-image">
                  <Image
                    alt={item.imageAlt ?? item.label}
                    height={220}
                    src={item.image}
                    width={220}
                  />
                </div>
              ) : null}
              <h3>{item.label}</h3>
              <p style={{ color: "var(--text)", fontWeight: 700 }}>{item.value}</p>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
