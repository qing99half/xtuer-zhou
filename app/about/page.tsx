import Image from "next/image";
import Link from "next/link";
import { contacts } from "@/lib/site-data";

export const metadata = {
  title: "关于 & 反诈 | xtuer-zhou",
};

export default function AboutPage() {
  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">关于 &amp; 反诈</span>
      </nav>

      <section className="section" style={{ marginTop: 0 }}>
        <span className="eyebrow">关于这本手册</span>
        <h1>写在这本攻略之外</h1>
        <p>
          xtuer-zhou 是一份面向湘潭大学新生的民间攻略站点，源自热心学长学姐整理的《湘潭大学 2026 新生攻略》。
          所有内容仅供参考，任何政策、时间、金额请以学校官方通知为准。
        </p>
        <p>
          本页把非资料类的入口——<Link href="#letter">一封信</Link>、
          <Link href="#announce">公告栏</Link>、
          <Link href="#anti-fraud">反诈骗提醒</Link>、
          <Link href="#outside">写在手册之外</Link>——集中在一起，方便快速定位。
        </p>
      </section>

      <section className="section" id="letter">
        <div className="section-heading">
          <div>
            <span className="eyebrow">一封信</span>
            <h2 style={{ marginTop: 10 }}>我是谁，以及给你们的一封信</h2>
          </div>
        </div>
        <div className="info-card">
          <p>
            这本攻略由几位湘大在校学长学姐维护，我们希望把踩过的坑、绕过的路、摔过的跤，
            变成尽量少让你走弯路的一份小册子。
          </p>
          <p>
            <strong>本站不是学校官方渠道</strong>，也没有商业目的。所有链接、政策、时间信息都会随学校最新通知变化，
            请在做任何重要决定前，以学校官方通知（招生网、教务处、学工部、各学院公众号）为准。
          </p>
          <p>
            如果你在浏览过程中发现内容还没覆盖，或者想拿到更完整的资料，添加下方公告栏中的学长微信即可获取；
            微信新生群需先添加学长微信后由学长邀请进入，以防不法分子混入。
          </p>
        </div>
      </section>

      <section className="section" id="announce">
        <div className="section-heading">
          <div>
            <span className="eyebrow">公告栏</span>
            <h2 style={{ marginTop: 10 }}>添加联系方式获取资料</h2>
          </div>
        </div>
        <p style={{ marginTop: -8 }}>
          资料尚未整理完全，添加下方任一联系方式即可获取。微信新生群需先添加学长微信后由学长邀请进入，以防不法分子混入。
        </p>
        <div className="grid grid-3">
          {contacts.map((item) => (
            <article className="info-card contact-card" key={item.label}>
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
        <div className="notice-card" style={{ marginTop: 18 }}>
          <p>
            <strong>官方 vs 民间：</strong>湘潭大学没有任何官方新生大群（只有官方新生院群）；
            其余所有群聊均为民间自建。凡自称 “湘潭大学官方新生大群” 的一律注意甄别，谨防诈骗。
          </p>
        </div>
      </section>

      <section className="section" id="anti-fraud">
        <div className="section-heading">
          <div>
            <span className="eyebrow">反诈骗提醒</span>
            <h2 style={{ marginTop: 10 }}>开学季骗子密集，务必看完</h2>
          </div>
        </div>

        <div className="notice-card" style={{ marginBottom: 18 }}>
          <p>
            <strong>核心原则：</strong>自称 “校领导 / 辅导员 / 学姐” 而不主动证明身份的一律视为诈骗；
            可令其出示学生卡等身份证明，推辞或顾左右而言他即为骗子。出门在外，放下助人情节，
            <strong>有事找警察</strong>。
          </p>
        </div>

        <div className="grid grid-3">
          <article className="info-card">
            <h3>常见诈骗手段</h3>
            <ul className="document-list">
              <li>冒充学长学姐拉进假新生群 / 假 “资料群”</li>
              <li>假冒学校邮件、含钓鱼链接的 QQ 邮件</li>
              <li>兼职刷单、低价商品、勤工助学名义收费</li>
              <li>推销英语课程、剪辑资料、笔等 “学习必备品”</li>
              <li>“大学墙 / 校墙” 冒充官方社区收集个人信息</li>
              <li>好友被盗号后发起转账 / 借钱</li>
            </ul>
          </article>

          <article className="info-card">
            <h3>典型 &amp; 真实案例</h3>
            <p>
              新生入群后，被 “大二学姐” 邀请报名 “30 元一周英语口语班”；报名后被拉黑。
              后续同学发现相同套路在多个高校反复出现：先讲 “贫困变学霸” 故事，再拿短视频证明，最后诱导报长期班。
            </p>
            <p>另有 “混进新生群以低价出售生活用品，把学生骗进车里” 的极端案例，切勿脱离公共场所与陌生人交易。</p>
          </article>

          <article className="info-card">
            <h3>反诈小贴士</h3>
            <ol className="document-list">
              <li>遇到不明来历的人多留个心眼，别人自称 “咱学校” 不一定指湘潭大学。</li>
              <li>社交媒体上看到的信息：<strong>不听、不信、不传</strong>，多问来源、多方核实。</li>
              <li>刷单兼职需要小心谨慎；网络交易选择正规平台。</li>
              <li>好友转账核实他人信息；涉及金钱不要轻易汇款。</li>
              <li>学校从没有也从不会通过 QQ 邮箱发送含钓鱼链接的邮件；已打开请立即修改密码。</li>
            </ol>
          </article>
        </div>
      </section>

      <section className="section" id="outside">
        <div className="section-heading">
          <div>
            <span className="eyebrow">写在这本手册之外</span>
            <h2 style={{ marginTop: 10 }}>这不是说明书，是一群同龄人的陪伴</h2>
          </div>
        </div>
        <div className="info-card">
          <p>这本手册的最后一页，是一道没有标准答案的填空题。</p>
          <p>因为你即将面对的大学生活，从来没有 “说明书”。我们能做的，只是把踩过的坑、绕过的路、摔过的跤，变成这几页纸。</p>
          <p>但小册子容量有限，还有太多情绪、太多细碎的共鸣，无法通过文字传递。</p>
          <p>
            为此我们在微信上留了一个入口——通过右上角的 “加群咨询” 或 <Link href="#announce">公告栏</Link>
            添加学长微信，你可以在那里找到：
          </p>
          <ul className="document-list">
            <li>迟迟拿不定主意的选课困惑</li>
            <li>想听点 “民间版本” 的政策解读</li>
            <li>甚至只是深夜发来的一句：“学长，我现在有点慌”</li>
          </ul>
          <p>这里没有标准答案，但有一群愿意倾听的人。这趟旅途，你不是一个人。</p>
        </div>
      </section>
    </>
  );
}
