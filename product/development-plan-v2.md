# xtuer-zhou 重构开发规划（v2）

> 版本：v2.0 — 主题优先架构 · 数据驱动跳转 · 一内容多归属
>
> 依据：
> - `product/architecture-proposal.md` v0（**用户已确认此方向**）
> - `product/tencent-source-structure.md`（源文档尽调）
> - `product/navigation-audit.md`（现网跳转审计）
>
> **本规划替代 `product/development-roadmap.md` v0.1**（v0.1 归档）。
>
> **硬约束（贯穿每一阶段）**：
> - **每一个用户可见的入口（顶级导航、时间线段、主题卡、Q&A 卡、社团类别卡、reference link）都必须能点开对应页面**——不允许出现"看到卡片但点不动"或"点开是 404"。
> - 出现旧目录 / 旧数据与新架构冲突时，**允许删库重做**（用户已授权）。

---

## 0. 目标态一句话

从 "**功能优先目录 + 硬编码跳转 + 单值归属**" 重构为 "**主题优先 section + 数据驱动跳转 + sections/phase/tags 多归属**"，让 60 篇资料按源文档 9 栏目的用户心智重新组织，并补齐反诈骗、公告栏、校园卡专栏等缺失内容。

---

## 1. 新目录结构（docs/ 全量重排）

**旧结构（7 目录，功能优先）→ 新结构（8 目录，主题优先）**：

```
docs/
├── _shared/                          # 项目元信息、模板
│   ├── Markdown资料模板.md
│   └── 资料入库与审核规则.md
│
├── newcomer/                          # ① 你好，新同学
│   ├── 新生攻略总览.md
│   ├── 开学与迎新日程.md
│   ├── 2026新生报到流程.md
│   ├── 新生报到QA.md
│   ├── 大学概念百科.md
│   ├── 开学物品指南.md
│   ├── 军训指南.md
│   ├── 买电脑分享.md
│   ├── 公告栏与新生群提醒.md
│   └── 26招生方案.md              ⭐ 在互联网上搜索湘潭大学2026届招生方案完成补充
│
├── study/                             # ② 学在湘大
│   ├── 学在湘大总览.md
│   ├── 作息安排.md
│   ├── 选课与通识课.md
│   ├── 选课修课与访学.md
│   ├── 学分成绩与课程考核.md
│   ├── 培养计划.md
│   ├── 保研与科学竞赛.md
│   ├── 实验班与拔尖班选拔.md
│   ├── 转专业指南.md
│   ├── 常见考证清单.md
│   └── 升学就业QA.md
│
├── life/                              # ③ 校园生活
│   ├── 校园生活总览.md
│   ├── 实用工具小程序.md
│   ├── 健康体魄勤运动.md
│   ├── 快递收发驿站通.md
│   ├── 寝室生活大揭秘.md
│   ├── 校园出行有攻略.md
│   ├── 学校里的美食家.md
│   ├── 湘潭游玩指南.md
│   ├── 医保就医超优惠.md
│   └── 湘潭地铁乘坐指南.md
│
├── campus/                            # ④ 湘大印象
│   ├── 湘大印象总览.md
│   ├── 学校简介与校史.md
│   ├── 校园文化.md
│   ├── 院系与专业设置.md
│   ├── 湘大校园地图.md
│   ├── 湘大校园实拍.md
│   └── 教学楼分布.md
│
├── tools/                             # ⑤ 办事与工具（合并旧 06+07）
│   ├── 办事流程总览.md              （由 校园常见办事流程.md 改名）
│   ├── 信息门户使用指南.md
│   ├── 学校网络使用指南.md
│   ├── VPN使用指南.md
│   ├── 校园电话卡与寝室宽带办理.md
│   ├── 校园一卡通指南.md
│   ├── 线上缴费指南.md
│   ├── 故障申报与受理.md
│   ├── 湘大教务系统使用入门.md
│   ├── 奖学金与助学金政策.md
│   └── 校园政策QA.md
│
├── clubs/                             # ⑥ 湘大社团（7 类，拆开成 8 个文件）
│   ├── 社团一览.md                 （对应 湘大社团一览.md，改为索引页）
│   ├── 学术研究类.md               ⭐ 新拆
│   ├── 公益类.md                   ⭐ 新拆
│   ├── 实践类.md                   ⭐ 新拆
│   ├── 文化类.md                   ⭐ 新拆
│   ├── 科技类.md                   ⭐ 新拆
│   ├── 艺术类.md                   ⭐ 新拆
│   └── 体育类.md                   ⭐ 新拆
│
├── orgs/                              # ⑦ 组织与工作
│   ├── 组织与工作总览.md            （来源 社团与组织总览.md）
│   ├── 班委职务与竞选.md
│   ├── 湘潭大学学生会.md
│   ├── 湘潭大学大学生艺术团.md
│   ├── 湘潭大学学生社团联合会.md
│   └── 湘潭大学研究生会介绍.md
│
├── card/                              # ⑧ 校园卡专栏
│   └── 新生必看什么是校园卡.md      ⭐ 待补（正文抓取尚未成功） 使用占位 后续补充
│
└── 99-待整理资料/                     # 保留原样
    └── ...
```

**目录命名说明**：
- 用 **英文 slug** 作目录名（`newcomer / study / life / …`），与 `sections[]` 键一致，与 URL 前缀一致。
- 中文文件名保留（延续现有做法），只是**目录改为英文**。
- 顶级弃用 `01- / 02- / …` 序号前缀（不再有"功能编号"含义）。

**⭐ 删库重做的范围**：
- **删除**：`docs/01-新生入学/ ~ docs/07-资源工具/` 8 个中文目录
- **保留**：`docs/99-待整理资料/`（原始素材归档）
- **迁移**：60 篇正式 md 按上面新目录重新落位
- **拆分**：`clubs/湘大社团一览.md`（原是 1 篇整合）→ 拆成 7 篇独立文件 + 1 篇索引
- **重命名**：见下节

---

## 2. 文件重命名 / 合并 / 删除清单

### 2.1 直接迁移（保留文件名，只换目录）

约 50 篇文件按第 1 节新目录 1:1 迁移。

### 2.2 需要重命名 / 合并的

| 旧路径 | 新路径 | 处理 |
| --- | --- | --- |
| `06-办事指南/校园常见办事流程.md` | `tools/办事流程总览.md` | 重命名 |
| `05-校园生活/社团与组织总览.md` | `orgs/组织与工作总览.md` | 重命名（内容偏组织） |
| `05-校园生活/湘大社团一览.md` | `clubs/社团一览.md` + 7 篇分类文件 | ⭐ **拆分** |
| `07-资源工具/工具资源总览.md` | `tools/工具资源总览.md` | 直接迁移，可与办事流程总览合并（待用户确认） |

### 2.3 需要删除的现有代码文件

- ❌ `lib/subcards.ts` — 白名单机制废弃
- ❌ 详情页里的 `renderSubcard` 相关代码 — 改为按 sections 自动生成
- ❌ `guide/page.tsx` 里的 `guideLinks` 硬编码字典

### 2.4 ⭐ 新拆 7 篇社团文件的正文来源

`docs/99-待整理资料/腾讯文档下载/49-学术研究类.md` ~ `55-体育类.md` 已有完整正文，可直接搬到新的 `clubs/*.md`，加上 frontmatter 字段。

---

## 3. 数据模型升级

### 3.1 md frontmatter 新字段

```yaml
title: 培养计划
status: 已审核
source: ...
updatedAt: 2026-07-18
indexable: true
completeness: partial
completenessNote: ...

# ⭐ 新字段
primarySection: study                       # 主归属，决定 URL 前缀（必填）
sections: [study, newcomer]                 # 挂载的所有 section（含 primary，必填）
phase: [first-week, first-year]             # 时间线归属，用于 /guide 聚合（可空）
tags: [选课, 培养方案, 学分, 教务]             # 供推荐系统匹配（可空但推荐）
weight: 50                                  # section 内排序，越大越靠前（默认 0）
```

### 3.2 Section 元数据（`lib/site-data.ts`）

```ts
export type Section = {
  slug: string;             // URL 前缀，如 "study"
  title: string;            // 展示名，如 "学在湘大"
  emoji?: string;           // 主题卡装饰（源文档社团用了 emoji）
  description: string;      // 分类页副标题
  order: number;            // library 首页排序
};

export const sections: Section[] = [
  { slug: "newcomer", title: "你好，新同学", description: "报到 / 军训 / 迎新的关键路径。", order: 1 },
  { slug: "study",    title: "学在湘大",     description: "选课、培养方案、保研、考证等学业主线。", order: 2 },
  { slug: "life",     title: "校园生活",     description: "宿舍、快递、餐饮、出行、医保等日常。", order: 3 },
  { slug: "campus",   title: "湘大印象",     description: "校史、校园文化、地图、院系介绍。", order: 4 },
  { slug: "tools",    title: "办事与工具",   description: "信息门户、VPN、一卡通、缴费与办事流程。", order: 5 },
  { slug: "clubs",    title: "湘大社团",     emoji: "🎉", description: "学术、公益、体育等 7 类兴趣社团。", order: 6 },
  { slug: "orgs",     title: "组织与工作",   description: "班委、学生会、艺术团、社联、研会。", order: 7 },
  { slug: "card",     title: "校园卡专栏",   description: "校园卡使用与常见问题。", order: 8 },
];
```

### 3.3 Phase 元数据（`lib/site-data.ts`）

```ts
export type Phase = {
  slug: string;
  title: string;
  when: string;              // 时间描述
  intro: string;
  order: number;
};

export const phases: Phase[] = [
  { slug: "pre-arrival",  title: "暑期录取后",  when: "报到前 30–60 天", intro: "确认专业、办贷款、准备物品。", order: 1 },
  { slug: "arrival",      title: "报到当天",    when: "9 月初",          intro: "到校 · 报到点 · 宿舍 · 一卡通。", order: 2 },
  { slug: "first-week",   title: "开学第一周",  when: "报到后 1–7 天",   intro: "信息门户 / 教务 / 网络 / 快递。", order: 3 },
  { slug: "training",     title: "军训期",      when: "开学 3–4 周",     intro: "军训 · 医保 · 饮食 · 健康。", order: 4 },
  { slug: "first-term",   title: "军训后学业",  when: "第一学期",         intro: "作息 · 选课 · 图书馆 · 班委社团。", order: 5 },
  { slug: "first-year",   title: "大一持续",    when: "整个大一",         intro: "考证 · 转专业 · 保研认知 · 假期出行。", order: 6 },
];
```

### 3.4 完整内容归属映射表（60 篇 → sections / phase）

> **规则**：所有当前入库的 60 篇文件都必须有明确的 `primarySection`，且在下表中列出。
> `sections` 中的 primary 已隐含，只额外列出**其他挂载点**。

| 文件（新路径） | primarySection | 其他 sections | phase | 主要 tags |
| --- | --- | --- | --- | --- |
| `newcomer/新生攻略总览.md` | newcomer | — | pre-arrival | 综述, 索引 |
| `newcomer/开学与迎新日程.md` | newcomer | — | arrival | 日程, 报到 |
| `newcomer/2026新生报到流程.md` | newcomer | — | arrival | 报到, 交通 |
| `newcomer/新生报到QA.md` | newcomer | — | arrival | 报到, Q&A |
| `newcomer/大学概念百科.md` | newcomer | study | pre-arrival | 绩点, 保研, 综测 |
| `newcomer/开学物品指南.md` | newcomer | life | pre-arrival | 行李, 物品 |
| `newcomer/军训指南.md` | newcomer | — | training | 军训, 物资 |
| `newcomer/买电脑分享.md` | newcomer | tools | pre-arrival | 电脑, 数码 |
| `newcomer/公告栏与新生群提醒.md` | newcomer | — | pre-arrival | 公告, 反诈 |
| `newcomer/26招生方案.md` ⭐ | newcomer | — | pre-arrival | 招生, 分省 |
| `study/学在湘大总览.md` | study | — | first-term | 综述, 索引 |
| `study/作息安排.md` | study | — | first-week | 作息 |
| `study/选课与通识课.md` | study | — | first-term | 选课 |
| `study/选课修课与访学.md` | study | — | first-term | 选课, 访学 |
| `study/学分成绩与课程考核.md` | study | — | first-term | 学分, 绩点 |
| `study/培养计划.md` | study | — | first-term | 培养方案 |
| `study/保研与科学竞赛.md` | study | — | first-year | 保研, 竞赛 |
| `study/实验班与拔尖班选拔.md` | study | newcomer | pre-arrival, first-term | 拔尖班, 韶峰班 |
| `study/转专业指南.md` | study | — | first-year | 转专业 |
| `study/常见考证清单.md` | study | — | first-year | 四六级, 考证 |
| `study/升学就业QA.md` | study | — | first-year | 保研, 就业, Q&A |
| `life/校园生活总览.md` | life | — | first-week | 综述, 索引 |
| `life/实用工具小程序.md` | life | tools | first-week | 小程序, 工具 |
| `life/健康体魄勤运动.md` | life | — | training | 运动, 健康 |
| `life/快递收发驿站通.md` | life | — | first-week | 快递 |
| `life/寝室生活大揭秘.md` | life | — | arrival | 宿舍 |
| `life/校园出行有攻略.md` | life | newcomer | arrival | 交通, 出行 |
| `life/学校里的美食家.md` | life | — | first-week | 美食, 食堂 |
| `life/湘潭游玩指南.md` | life | — | first-year | 游玩, 假期 |
| `life/医保就医超优惠.md` | life | training | training | 医保, 校医院 |
| `life/湘潭地铁乘坐指南.md` | life | newcomer | arrival | 地铁, 长沙 |
| `life/图书馆与自习室.md` | life | study | first-term | 图书馆, 自习 |
| `campus/湘大印象总览.md` | campus | — | pre-arrival | 综述, 索引 |
| `campus/学校简介与校史.md` | campus | — | pre-arrival | 校史, 双一流 |
| `campus/校园文化.md` | campus | — | pre-arrival | 校徽, 校训 |
| `campus/院系与专业设置.md` | campus | study | pre-arrival | 院系, 专业 |
| `campus/湘大校园地图.md` | campus | newcomer, life | arrival | 地图, 校区 |
| `campus/湘大校园实拍.md` | campus | life | pre-arrival | 宿舍, 食堂 |
| `campus/教学楼分布.md` | campus | study | first-week | 教学楼 |
| `tools/办事流程总览.md` | tools | — | first-week | 办事, 流程 |
| `tools/信息门户使用指南.md` | tools | study | first-week | 信息门户 |
| `tools/学校网络使用指南.md` | tools | — | first-week | 校园网 |
| `tools/VPN使用指南.md` | tools | study | first-week | VPN, 校外访问 |
| `tools/校园电话卡与寝室宽带办理.md` | tools | life | arrival | 电话卡, 宽带 |
| `tools/校园一卡通指南.md` | tools | card | arrival | 一卡通 |
| `tools/线上缴费.md` | tools | — | first-week | 缴费, 财务 |
| `tools/故障申报与受理.md` | tools | — | first-week | 报修 |
| `tools/湘大教务系统使用入门.md` | tools | study | first-term | 教务系统 |
| `tools/奖学金与助学金政策.md` | tools | newcomer | pre-arrival | 奖学金, 助学金 |
| `tools/校园政策QA.md` | tools | newcomer | first-week | 校规, Q&A |
| `tools/工具资源总览.md` | tools | — | first-week | 综述, 索引 |
| `clubs/社团一览.md` | clubs | — | first-term | 综述, 索引 |
| `clubs/学术研究类.md` ⭐拆 | clubs | study | first-term | 学术, 竞赛 |
| `clubs/公益类.md` ⭐拆 | clubs | — | first-term | 支教, 志愿 |
| `clubs/实践类.md` ⭐拆 | clubs | — | first-term | 实践, 商业 |
| `clubs/文化类.md` ⭐拆 | clubs | — | first-term | 文学, 语言 |
| `clubs/科技类.md` ⭐拆 | clubs | — | first-term | 电子, 建模 |
| `clubs/艺术类.md` ⭐拆 | clubs | — | first-term | 音乐, 舞蹈 |
| `clubs/体育类.md` ⭐拆 | clubs | — | first-term | 球类, 极限 |
| `orgs/组织与工作总览.md` | orgs | — | first-term | 综述, 索引 |
| `orgs/班委职务与竞选.md` | orgs | newcomer | first-week | 班委 |
| `orgs/湘潭大学学生会.md` | orgs | — | first-term | 学生会 |
| `orgs/湘潭大学大学生艺术团.md` | orgs | — | first-term | 艺术团 |
| `orgs/湘潭大学学生社团联合会.md` | orgs | clubs | first-term | 社联 |
| `orgs/湘潭大学研究生会介绍.md` | orgs | — | first-term | 研究生 |
| `card/新生必看什么是校园卡.md` ⭐待补 | card | tools | arrival | 校园卡, 建行 |

**⭐ 新增 3 篇内容待补（写在正式库外补齐）**：
- `newcomer/26招生方案.md`
- `card/新生必看什么是校园卡.md`
- `_shared/一封信.md` / `_shared/写在手册之外.md`（可选，或直接内嵌 `/about` 页）

---

## 4. 新路由清单（Next.js）

| 路由 | 类型 | 用途 |
| --- | --- | --- |
| `/` | 静态 | 首页（重排：反诈提醒条 + 时间轴 + 主题网格 + Q&A 快捷 + 咨询） |
| `/guide` | 静态 | 新生指南：6 个时间线段总览 |
| `/guide/[phase]` | SSG | 单个时间线阶段页（`pre-arrival` / `arrival` / …） |
| `/library` | 静态 | 资料库首页：8 个 section 主题卡 + 全部资料 |
| `/library/[section]` | SSG | 分类页：某个 section 下所有资料 |
| `/library/[section]/[...slug]` | SSG | 资料详情页（**注意 slug 结构变化**） |
| `/qa` | 静态 | 常见问答索引（4 篇 Q&A + AI 问答入口） |
| `/qa/[slug]` | SSG | 单篇 Q&A 详情（可复用 library 详情组件） |
| `/about` | 静态 | 关于 & 反诈（一封信 · 公告栏 · 反诈骗专栏 · 手册之外） |
| `/api/ask` | 动态 | 保留 |

**URL 前后对比举例**：
- 旧：`/library/02-课程学习/培养计划`
- 新：`/library/study/培养计划`

**⭐ URL 兼容策略**：由于旧 URL 中含中文分类前缀，无外部收录，**允许直接切换新 URL**，不做重定向。

---

## 5. 页面职责与"每个入口都可点"的落实

### 5.1 首页 `/`

```
[反诈提醒条]           → 链 /about#anti-fraud
[Hero + AI 问答]       → AI 面板保留
[时间轴 6 卡]          → 每卡链 /guide/<phase>
[主题网格 8 卡]        → 每卡链 /library/<section>
[高频 Q&A 4 卡]        → 每卡链 /qa/<slug>
[咨询入口 3 卡]        → 每卡链 /about#公告栏
```

**每一张卡都必须可点**——所有 8 个 section 和 6 个 phase 都会有对应页面。

### 5.2 `/guide` + `/guide/[phase]`

- `/guide`：展示 6 个时间线段卡片 + 每段挑 3 篇预览。
- `/guide/[phase]`：展示该阶段所有匹配 `phase[]` 的资料列表 + 关联资料推荐。
- **每个 phase 卡都能点开对应页面**。

### 5.3 `/library` + `/library/[section]`

- `/library`：8 个主题卡（含 emoji / 描述）+ 每卡 3 篇预览 + 全部资料展开列表。
- `/library/[section]`：section 元信息 hero + 该 section 下所有 md（按 weight 排序）+ 相关 section 交叉推荐。
- **每个主题卡都能点开分类页；分类页内每篇资料卡都能点开详情**。

### 5.4 `/library/[section]/[...slug]` 详情页

- Hero：面包屑 + 分类 pill + 标题 + 摘要 + 更新时间。
- 正文：markdown（已支持 **bold** / 表格 / 引用块 / 内联链接）。
- 补充信息卡（partial）。
- **相关内容三层**：
  1. 同 section 下按 tags 交集排序的 3 篇。
  2. 从 `sections[]` 交集出发的 3 篇（跨 section 的相关内容）。
  3. 反向链接：md 里明确引用过本文的资料（构建期扫描内部 `[X](/library/...)`）。
- **上一篇 / 下一篇**：按 section 内 weight + 文件名字典序。
- 顶部面包屑：**首页 › 学在湘大 › 培养计划**（每级都可点）。

### 5.5 `/qa` + `/qa/[slug]`

- `/qa`：4 个 Q&A 卡 + 输入框（复用 AskPanel）。
- `/qa/[slug]`：单篇 Q&A 详情（直接复用 `/library/[section]/[...slug]` 的渲染组件）。
- **4 张卡都必须能点开**。

### 5.6 `/about`

- 4 个 section：**一封信 / 项目说明 / 公告栏 / 反诈骗专栏 / 写在手册之外**。
- 内容直接内嵌为 React section（不必落到 md），或由 `_shared/*.md` 驱动。
- **顶部锚点导航** `#letter #announce #anti-fraud #outside`。
- 首页反诈提醒条链到 `#anti-fraud`；咨询入口卡链到 `#announce`。

---

## 6. 组件与代码改造清单

| 文件 | 改动类型 | 说明 |
| --- | --- | --- |
| `lib/site-data.ts` | 大改 | 用新 sections / phases / contacts；删除 guideModules / libraryCategories |
| `lib/markdown.ts` | 中改 | 解析 sections / phase / tags / weight / primarySection；提供 `getBySection` / `getByPhase` / `getByTags` 查询 |
| `lib/routes.ts` | 中改 | `getDocumentHref(doc)` 用 primarySection + slug；新增 `getSectionHref` / `getPhaseHref` / `getQAHref` |
| `lib/subcards.ts` | ❌ 删除 | 白名单机制废弃 |
| `lib/related.ts` | ⭐ 新增 | 三层相关推荐 + 反向链接构建 |
| `lib/display.ts` | 保留 | cleanExcerpt / formatCategory 微调 |
| `lib/rag.ts` | 微改 | 索引对齐新字段，heading 去 `**` |
| `lib/deepseek.ts` | 不动 | — |
| `app/layout.tsx` | 中改 | 顶部导航加 /qa /about |
| `app/page.tsx` | 大改 | 反诈条 + 时间轴 + 主题网格 + Q&A 快捷 + 可点咨询 |
| `app/guide/page.tsx` | 大改 | 6 时间线段总览 |
| `app/guide/[phase]/page.tsx` | ⭐ 新增 | 单阶段页 |
| `app/library/page.tsx` | 大改 | 8 主题网格 + 全部资料 |
| `app/library/[section]/page.tsx` | ⭐ 新增 | 分类页 |
| `app/library/[section]/[...slug]/page.tsx` | 移位 + 大改 | 相关三层 / 上下篇 / 面包屑 |
| `app/qa/page.tsx` | ⭐ 新增 | Q&A 索引 |
| `app/qa/[slug]/page.tsx` | ⭐ 新增 | Q&A 详情（复用组件） |
| `app/about/page.tsx` | ⭐ 新增 | 关于 & 反诈 |
| `components/ask-panel.tsx` | 微改 | source 卡用 `<Link>` |
| `components/contact-dialog.tsx` | 微改 | 加 "查看完整反诈提醒" 链到 /about#anti-fraud |
| `components/section-card.tsx` | ⭐ 新增 | 主题卡（library 首页 + 首页） |
| `components/phase-card.tsx` | ⭐ 新增 | 时间线卡 |
| `components/related-list.tsx` | ⭐ 新增 | 详情页相关推荐 |
| `components/breadcrumb.tsx` | ⭐ 新增 | 面包屑 |
| `components/prev-next-nav.tsx` | ⭐ 新增 | 上下篇 |
| `components/anti-fraud-banner.tsx` | ⭐ 新增 | 首页反诈提醒条 |
| `scripts/build-rag-index.mjs` | 中改 | 同步新字段；stripInlineMarkdown 处理 heading |
| `docs/**/*.md` frontmatter | 全量补 | 60 篇加 primarySection / sections / phase / tags / weight |
| `docs/**/*.md` 内部链接 | 全量改 | `/library/01-新生入学/xxx` → `/library/newcomer/xxx` |

---

## 7. 缺失内容补齐

| 项 | 位置 | 优先级 | 备注 |
| --- | --- | --- | --- |
| 反诈骗专栏 | `/about#anti-fraud` React 内嵌 或 `_shared/反诈骗专栏.md` | P0 | 源文档尾部已有完整内容 |
| 公告栏（详细） | `/about#announce` | P0 | QQ 群 / 公众号 / 官方 vs 民间 |
| 一封信 | `/about#letter` | P1 | 情感层，可复用源文档原文 |
| 写在手册之外 | `/about#outside` | P1 | 与 ContactDialog 呼应 |
| `card/新生必看什么是校园卡.md` | `/library/card/…` | P1 | 源文档有此条，本地未抓取；可先写占位 |
| `newcomer/26招生方案.md` | `/library/newcomer/…` | P2 | 源文档只有省名清单，可先写"以本科招生网为准" |
| clubs/ 7 类拆分 | `/library/clubs/*` | P0 | 源已提供正文，直接拆 |

---

## 8. 阶段拆分与里程碑

### Phase A：数据基座（P0，无 UI 变化）

- A.1 定义新 `Section` / `Phase` 类型，写 `lib/site-data.ts` v2。
- A.2 升级 `lib/markdown.ts`，支持解析 sections / phase / tags / weight / primarySection。
- A.3 保留旧 URL 也能读到旧数据（渐进）— 或者，**允许一次性切换**（用户已授权删库重做）。
- A.4 编写 `lib/related.ts`（相关推荐 + 反向链接）。

**里程碑 M1**：`getAllDocuments()` / `getBySection()` / `getByPhase()` 单元可跑通，`npm run build` 通过。

### Phase B：内容迁移（P0，改 docs/）

- B.1 建 `docs/newcomer/ ~ docs/card/` 目录。
- B.2 批量迁移 60 篇 md，补 frontmatter（primarySection / sections / phase / tags / weight）。
- B.3 拆分 `湘大社团一览.md` → 7 篇 + 1 篇索引。
- B.4 md 内部链接批量替换：`/library/01-新生入学/X` → `/library/newcomer/X` 等。
- B.5 删除旧 `docs/01-新生入学/ ~ docs/07-资源工具/` 目录。

**里程碑 M2**：`ls docs/` 展示新 8 目录 + `_shared` + `99-待整理资料`；`npm run rag:index` 通过。

### Phase C：路由与页面骨架（P0）

- C.1 移动 `app/library/[...slug]/page.tsx` → `app/library/[section]/[...slug]/page.tsx`。
- C.2 新增 `app/library/[section]/page.tsx`（分类页）。
- C.3 新增 `app/guide/[phase]/page.tsx`。
- C.4 新增 `app/qa/page.tsx` / `app/qa/[slug]/page.tsx`。
- C.5 新增 `app/about/page.tsx`。
- C.6 layout 顶部导航加 /qa /about。
- C.7 删除 `lib/subcards.ts` 与详情页里所有相关代码。

**里程碑 M3**：所有新路由能访问（哪怕只是最小 placeholder），`npm run build` 通过，静态页面数 ≥ 60（不再是 66，而是 60+ 详情 + 分类页 + 阶段页 + Q&A + about）。

### Phase D：跳转机制与首页重排（P0）

- D.1 首页大改：反诈提醒条 + 时间轴 + 主题网格 + Q&A 快捷 + 可点咨询卡。
- D.2 `/guide` 主页改为 6 时间线段总览；`/guide/[phase]` 聚合。
- D.3 `/library` 首页改为 8 主题网格；`/library/[section]` 分类页。
- D.4 详情页加：**面包屑 + 相关三层 + 上/下篇**。
- D.5 ask-panel source 卡用 `<Link>`。

**里程碑 M4**：主要跳转链路走通，用户在 Playwright 里能连续跳 5–7 次不出现 404 或空白。

### Phase E：缺失补齐与 UI 打磨（P1）

- E.1 `/about` 一封信 / 公告栏 / 反诈骗专栏 / 手册之外全部实现。
- E.2 `card/` 与 `newcomer/26招生方案.md` 内容补齐（或占位）。
- E.3 移动端 hero / 主题卡 / 相关卡 断点校验。
- E.4 深链回归：所有 md 内 `[X](/library/…)` 能正确跳。

**里程碑 M5**：验收清单全通，`npm run build` 通过，`npm run rag:index` chunks 数量 ≥ 之前（760+）。

---

## 9. 每个入口"可点"的硬约束落实清单

| 入口类型 | 数量 | 每一个都必须能点开 | 验证方式 |
| --- | --- | --- | --- |
| 顶级导航 | 5 | / /guide /library /qa /about | 手工点击 |
| 首页时间轴卡 | 6 | 每个 phase 都有 `/guide/<phase>` 静态页 | Playwright 遍历 |
| 首页主题卡 | 8 | 每个 section 都有 `/library/<section>` 分类页 | Playwright 遍历 |
| 首页 Q&A 快捷 | 4 | 每篇 Q&A 都有 `/qa/<slug>` 详情页 | Playwright 遍历 |
| 首页咨询卡 | 3 | 每卡都是 `<Link>` → `/about#announce` | 手工点击 |
| 反诈提醒条 | 1 | → `/about#anti-fraud` | 手工点击 |
| library 分类页内每卡 | 60 | 每篇 md 都有详情页 | `generateStaticParams` 覆盖 |
| 社团 7 类卡 | 7 | 每类都有独立 md 与详情页 | Phase B 完成后 |
| 详情页面包屑每级 | 3 | 首页 / section / 当前 | 手工点击 |
| 详情页相关卡 | ≤6 | 每卡都是有效 `<Link>` | 构建期校验（见 D.4） |
| 详情页上/下篇 | ≤2 | 若存在必可点 | 手工点击 |
| md 内 `[X](/library/…)` | 42+ | 每个目标必须存在 | ⭐ 构建期扫描校验（见下） |

### 9.1 md 内部链接构建期校验（新增）

在 `scripts/build-rag-index.mjs`（或独立 `scripts/check-links.mjs`）里：

```
1. 扫描 docs/**/*.md 所有内部 [X](/library/xxx) 链接
2. 对每个 URL 抽取 section + slug
3. 检查 docs/<section>/<slug>.md 是否存在
4. 缺失时 exit(1)，打印所有缺失清单
```

**这样任何 md 里写错内部链接都会在构建阶段暴露，不会静默 404。**

---

## 10. 风险与需要用户在实施前二次确认的点

| # | 决策项 | 影响 | 我建议 |
| --- | --- | --- | --- |
| 1 | 删除旧 `docs/01-新生入学/~07-资源工具/` 8 个目录 | 60 篇 md 全量重排 | 直接删（用户已授权） |
| 2 | md frontmatter 里 `category` 字段废弃 | 数据结构变化 | 保留兼容读取，但新字段优先 |
| 3 | URL 从 `/library/01-新生入学/X` → `/library/newcomer/X` | 外部收录 / 已发链接会失效 | 无外部收录，直接切；不做 301 |
| 4 | 社团一览 1 篇拆成 7 篇独立文件 | +6 个 md 文件 | 拆（对齐源文档体验） |
| 5 | 增加 `sections[]` 多归属机制 | 分类页需要"当前文件不在本 section 主归属"的显示逻辑 | 加"来自 XX 的相关资料"标注 |
| 6 | `guide` 从 4 模块 → 6 时间线 | 需要每篇 md 补 `phase[]` 字段 | 全量补，见 §3.4 |
| 7 | `subcards.ts` 彻底删除 | 首批 md（新生攻略总览等）的子卡片界面消失 | 相关能力由"分类页 + 相关推荐"替代 |
| 8 | 反诈骗内容首次入库 | 需要写正文 | 直接从源文档 §顶部 + §尾部 抓取 |
| 9 | 校园卡专栏首篇缺失 | `/library/card` 分类页初始只有 1 篇（校园一卡通指南也挂过来）+ 占位 | 先占位，等抓到源正文再替换 |
| 10 | `_shared/` 是否放到正式路由 | 不放 → 用户看不到"资料入库规则"；放 → 需要额外 section | 保留但不进入 8 主题，仅 build 期读取 |

---

## 11. 汇报节奏（延续现有约束）

每次实施阶段完成后，我会给出：
1. 当前进程（M1–M5 中的哪个）
2. 本次完成（改了哪些文件 / 数据）
3. 验证状态（build / rag:index / 手工点击）
4. 下一步建议（1–2 条）
5. 是否触发"需要用户二次确认"的项

---

## 12. 附：新旧对照速查

| 维度 | 旧 v1 | 新 v2 |
| --- | --- | --- |
| 顶级路由 | 3 | 5 |
| docs/ 目录 | 7 中文目录 | 8 英文 slug 目录 |
| 分类模型 | 单值 category | primary + sections[] + phase[] + tags[] |
| 详情页跳转 | subcard 白名单 + 同类推荐 4 篇 | 三层相关 + 上下篇 + 面包屑 |
| 首页 | 4 route 卡 + 3 contact 卡（不可点） | 反诈条 + 6 时间轴 + 8 主题 + 4 Q&A + 3 咨询（全可点） |
| /guide | 4 硬编码模块 | 6 时间线阶段 |
| Q&A | 打散在 3 目录 | 独立 /qa 顶级入口 |
| 反诈 / 公告 / 一封信 | 缺失 | 独立 /about 页 |
| 社团呈现 | 1 篇整合 | 7 篇独立 + 1 索引 |
| 校园卡专栏 | 无 | 独立 section |
| 内部链接校验 | 无（可能静默 404） | 构建期硬校验 |

---

**读完这份规划后**：
- 你可以在任何一节标出 "⭐ 修改：__" 或 "❌ 移除：__"。
- 定稿后我按 Phase A → E 顺序推进，每完成一个里程碑单独汇报，不会一次性动 60 篇。
- **每一步开始前，如遇到 §10 的决策项都会先请你确认再落地**。
