import Link from "next/link";
import { AskPanel } from "@/components/ask-panel";
import { contacts, guideModules } from "@/lib/site-data";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">湘潭大学 2026 新生攻略</span>
          <h1>把入学第一周的关键问题，一次讲清楚。</h1>
          <p>
            面向新生的学习文档知识库：先完成报到、宿舍、军训、学习入门四条主线，再逐步升级为有引用来源的 AI 问答库。
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/guide">
              查看入学指南
            </Link>
            <Link className="secondary-button" href="/library">
              浏览资料库
            </Link>
          </div>
        </div>
        <AskPanel />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">入学路线</span>
            <h2 style={{ marginTop: 10 }}>四个模块，覆盖从报到到学习起步</h2>
          </div>
          <Link className="secondary-button" href="/guide">
            全部指南
          </Link>
        </div>
        <div className="grid grid-4">
          {guideModules.map((module, index) => (
            <article className="route-card" key={module.slug}>
              <span className="route-index">{index + 1}</span>
              <h3 style={{ marginTop: 14 }}>{module.title}</h3>
              <p>{module.summary}</p>
              <div className="tag-list">
                {module.highlights.map((tag) => (
                  <span className="tag" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">咨询入口</span>
            <h2 style={{ marginTop: 10 }}>找不到答案，就先找到人</h2>
          </div>
        </div>
        <div className="grid grid-3">
          {contacts.map((item) => (
            <article className="info-card contact-card" key={item.label}>
              {item.type === "qr" ? <div className="qr-placeholder">{item.placeholder}</div> : null}
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
