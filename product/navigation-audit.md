# xtuer-zhou 跳转逻辑现状梳理（供重构参考）

> 目的：把网站当前所有"页面 → 跳转 → 数据源"的链路一次性摊开，方便你在阅读代码之前，先看到全景，再决定重构方向。
>
> 生成日期：2026-07-18
>
> 说明：本文档只描述"现在是什么样"，不做重构决策。所有代码位置都给出 `文件:行号` 便于跳转核对。

---

## 一、页面路由清单（Next.js App Router）

湘大知识库当前只有以下路由：

| 路由 | 类型 | 源文件 | 说明 |
| --- | --- | --- | --- |
| `/` | 静态 | `app/page.tsx` | 首页：Hero + AI 问答 + 4 个 guide 卡片 + 3 个 contact 卡片 |
| `/guide` | 静态 | `app/guide/page.tsx` | 入学指南汇总页：只展示 4 个硬编码模块 |
| `/library` | 静态 | `app/library/page.tsx` | 资料库首页：主题导航 + 全部资料列表 |
| `/library/[...slug]` | SSG | `app/library/[...slug]/page.tsx` | 资料详情页（catch-all 中文路径） |
| `/api/ask` | 动态 | `app/api/ask/route.ts` | 问答 API（本地 RAG + DeepSeek 优化） |
| `/_not-found` | 静态 | Next.js 默认 | 404 兜底 |

**布局**：`app/layout.tsx` 统一提供顶部导航（**首页 / 入学指南 / 资料库**）+ 右上角 `<ContactDialog />`（"加群咨询" 按钮）+ 页脚。

**没有实现的常见入口**：
- 没有"按分类"独立路由（例如 `/library/01-新生入学`）——一级分类目前只在资料库首页作为主题卡片显示。
- 没有搜索页 / 标签页 / 时间线页。
- 没有 sitemap / robots 等辅助路由。

---

## 二、跳转链路总表

### 2.1 全站四条主要跳转链路

```
[顶部导航] ──▶ /  |  /guide  |  /library     (app/layout.tsx:23-31)

[首页 Hero 按钮]
  ├── "查看入学指南" ──▶ /guide                (app/page.tsx:16)
  └── "浏览资料库"   ──▶ /library              (app/page.tsx:19)

[首页 · 入学路线 section]
  └── 4 个 route-card 是 **非可点击** 展示卡     (app/page.tsx:44-53)
     另有 "全部指南" 按钮 ──▶ /guide          (app/page.tsx:38)

[首页 · 咨询入口 section]
  └── 3 个 info-card 也 **非可点击**            (app/page.tsx:66-73)
```

### 2.2 首页问答面板（AI 问答）

问答面板 `components/ask-panel.tsx` 有单独的跳转逻辑：

```
用户输入问题
  → POST /api/ask           (ask-panel.tsx:51)
    → lib/rag.ts::searchRag()  返回 answer + sources
    → app/api/ask/route.ts     再调用 lib/deepseek.ts 优化 answer
  → 前端渲染 answer 与 source 卡片
  → 点击 source 卡片跳转到 sourceHref(source)
```

`sourceHref` 的构造流程（`components/ask-panel.tsx:23-29`）：

```
sourceHref(source):
  baseHref = getSourceDocumentHref(source.path, source.text)
             // lib/routes.ts:7
             // 逻辑：docs/xxx.md 去掉 docs/ 和 .md → 走 getDocumentHref
             //      再查 lib/subcards.ts 的 findSubcardTitle
             //      若命中 subcard 就在末尾拼 #subcard-xxx
  [pathname, hash] = baseHref.split("#")
  highlight = 前 80 字符 URL 编码
  heading = hash || encodeURIComponent(source.heading)
  返回:  /library/<slug>?highlight=xxx#<heading 或 subcard-xxx>
```

> 关键假设：`chunk.heading` 是 `scripts/build-rag-index.mjs` 生成的，取值为"该段落所在的最近 `#` 标题去掉 `#`"。详情页 `[...slug]/page.tsx:24-25` 用 `encodeURIComponent(text.trim())` 生成锚点 ID —— 只要 heading 文本一致就能对齐。

### 2.3 入学指南页面（guide）

`app/guide/page.tsx:5-10` 里有一个**硬编码字典** `guideLinks`：

```ts
registration       → /library/01-新生入学/新生攻略总览#subcard-开学、迎新日程
dorm-life          → /library/05-校园生活/校园生活总览
military-training  → /library/01-新生入学/新生攻略总览#subcard-军训
study-start        → /library/02-课程学习/学在湘大总览
```

对应 `lib/site-data.ts::guideModules` 的 4 个固定 slug：`registration / dorm-life / military-training / study-start`。

**这意味着 `/guide` 目前只依赖 3 个『总览』文件**：
- `docs/01-新生入学/新生攻略总览.md`
- `docs/02-课程学习/学在湘大总览.md`
- `docs/05-校园生活/校园生活总览.md`

新增的 60 篇资料没有从 `/guide` 出现——它们只能通过 `/library` 才能被访问。

### 2.4 资料库首页（library）

`app/library/page.tsx` 有两个板块：

**（a）主题导航**（`app/library/page.tsx:37-56`）：
- 数据来源：`lib/site-data.ts::libraryCategories`，写死 6 个分类。
- 跳转逻辑：
  ```
  firstDocumentByCategory:
    遍历 getApprovedMarkdownDocuments()
    第一次遇到某分类，就把该文档的 href 存下来
  ```
  换句话说，主题卡片"查看这个主题"跳到的是 **该分类下第一篇资料**（按文件读取顺序，通常是 filesystem 排序）。
- 没有做"分类页"，也没有按 category 展开的文件清单。

**（b）资料列表**（`app/library/page.tsx:67-88`）：
- 过滤：`document.slug.startsWith("00-知识库说明/")` 会被排除，其他一律展示。
- 每张卡整卡可点，跳到 `getDocumentHref(document.slug)`。

### 2.5 资料详情页（library/[...slug]）

`app/library/[...slug]/page.tsx` 内部有 4 段与跳转相关的逻辑：

| 位置 | 用途 |
| --- | --- |
| `[...slug]/page.tsx:44-83` | 内联 markdown 渲染：`[text](url)` 内部跳转用 `<Link>`，外部用 `<a target=_blank>` |
| `[...slug]/page.tsx:187-200` | 细分指南卡片（subcard-grid）：把命中 `knownSubcardTitles` 的列表项渲染成锚点卡 |
| `[...slug]/page.tsx:328` | 顶部 "← 返回资料库" 按钮，硬编码 `/library` |
| `[...slug]/page.tsx:376-390` | 底部 "你可能还想看"：同分类内排除自身，最多 4 张 |

**渲染时的锚点 ID 生成**：
- 标题锚点：`encodeURIComponent(stripInlineMarkdown(heading).trim())`（`[...slug]/page.tsx:24-25` 的 `headingId`）
- 子卡片锚点：`subcard-${encodeURIComponent(title)}`（`lib/subcards.ts:17-19`）

---

## 三、跳转背后的三个"生成器"

跳转所有 URL 都由这三个函数最终生成。

### 3.1 `lib/routes.ts::getDocumentHref(slug)`

```ts
return `/library/${slug.split("/").map(encodeURIComponent).join("/")}`;
```

- 输入 slug 必须是"相对 docs/ 的路径，去掉 `.md`"，如 `01-新生入学/军训指南`。
- 中文分段单独 encode（防止路径里含 `#`、`?`、`&` 被误当作 URL 分隔符）。
- 详情页 `generateStaticParams` 用 `document.slug.split("/")` 传给 catch-all，两侧都能对齐。

### 3.2 `lib/routes.ts::getSourceDocumentHref(path, text)`

```ts
href = getDocumentHref(path.replace(/^docs\//, "").replace(/\.md$/, ""));
subcardTitle = findSubcardTitle(text);
return subcardTitle ? `${href}#${getSubcardId(subcardTitle)}` : href;
```

- **专用于 RAG 结果卡片**，输入是 `rag-index.json` 里存的 `path`（例：`docs/01-新生入学/新生攻略总览.md`）和 `text`（chunk 正文）。
- 会尝试在 `text` 里找 `knownSubcardTitles` 中的任一标题，命中就带上 subcard 锚点。

### 3.3 `lib/subcards.ts`

```ts
export const knownSubcardTitles = [
  "开学、迎新日程",
  "2026 新生报到流程",
  "大学概念百科全书",
  "湘潭地铁乘坐",
  "开学物品指南",
  "军训",
  "奖助政策",
  "买电脑分享",
  "26 招生方案",
  "新生报到 Q&A",
  "校园政策 Q&A",
  "奖助政策 Q&A",
  "升学就业 Q&A",
];

export function getSubcardId(title): string {
  return `subcard-${encodeURIComponent(title)}`;
}

export function findSubcardTitle(text): string | undefined {
  return knownSubcardTitles.find((title) => text.includes(title));
}
```

- 这是当前跳转逻辑最需要重构的地方：
  - **是一个静态白名单**，只有 13 项。
  - 用于两处：
    1. 详情页把"看起来像小主题标题"的列表项渲染成 subcard-grid 卡片。
    2. RAG 源卡片跳转时，如果 chunk text 里能匹配到这些标题，就跳到 subcard 锚点。
  - 与"资料库真实文件名"是**手工同步**的，容易和 `docs/` 目录漂移。

---

## 四、当前所有 `<Link>` 出现的位置

按用途聚类，方便对照重构：

### 4.1 全局导航（4 条）

- `app/layout.tsx:18` → `/`（brand logo）
- `app/layout.tsx:23-31` → `/`、`/guide`、`/library`

### 4.2 首页 CTA（3 条）

- `app/page.tsx:16` → `/guide`（primary "查看入学指南"）
- `app/page.tsx:19` → `/library`（secondary "浏览资料库"）
- `app/page.tsx:38` → `/guide`（section heading "全部指南"）

### 4.3 入学指南页（每模块 3 条）

- `app/guide/page.tsx:30`（clickable-card 遮罩）
- `app/guide/page.tsx:35`（模块标题）
- `app/guide/page.tsx:38`（"查看指南" 按钮）

四个模块中 `dorm-life` 与 `study-start` 跳"总览页"，其他两个跳"总览页 + subcard 锚点"。

### 4.4 资料库首页（每张卡 1-3 条）

- 主题导航卡 `library/page.tsx:44 / 49`：**只有当分类内有已审核文件时才产生链接**，否则显示纯文本卡片。
- 资料列表卡 `library/page.tsx:71 / 74 / 82`：整卡遮罩 + 标题 + "查看指南"。

### 4.5 资料详情页

- `library/[...slug]/page.tsx:328` → `/library`（返回按钮）
- `library/[...slug]/page.tsx:59` → 内联 markdown 内的**内部链接**（用 `<Link>`）
- `library/[...slug]/page.tsx:55` → 内联 markdown 内的**外部链接**（用 `<a target=_blank>`）
- `library/[...slug]/page.tsx:191 / 195 / 198` → subcard 卡（3 条：遮罩 + 标题链接）
- `library/[...slug]/page.tsx:382 / 385` → 底部推荐卡（遮罩 + 标题）

### 4.6 问答面板

- `components/ask-panel.tsx:103` → `<a href={sourceHref(source)}>`（**注意用的是原生 `<a>` 而不是 next `<Link>`**，会走整页跳转而非客户端 push）

### 4.7 联系方式弹窗

- `components/contact-dialog.tsx` **没有任何 `<Link>`**——只是本地 state 控制 modal 显隐 + 展示二维码占位和 QQ 群号文本。

---

## 五、资料库内容侧的跳转（md 内部链接）

`docs/**/*.md` 里目前共有 **42 处内部 `/library/...` 引用**，都通过详情页的 `renderInline` 转成 `<Link>`。

统计到的所有内部目标（`grep` 输出，路径均实际存在）：

```
/library/01-新生入学/  (5 个)：2026新生报到流程 · 大学概念百科 · 军训指南 · 开学物品指南 · 买电脑分享 · 新生报到QA
/library/02-课程学习/  (6 个)：保研与科学竞赛 · 培养计划 · 实验班与拔尖班选拔 · 选课修课与访学 · 选课与通识课 · 学分成绩与课程考核
/library/04-学院专业/  (2 个)：湘大校园地图 · 湘大校园实拍
/library/05-校园生活/ (12 个)：健康体魄勤运动 · 快递收发驿站通 · 寝室生活大揭秘 · 社团与组织总览 · 图书馆与自习室 · 湘大社团一览 · 湘潭大学大学生艺术团 · 湘潭大学学生会 · 湘潭大学学生社团联合会 · 湘潭大学研究生会介绍 · 湘潭地铁乘坐指南 · 校园出行有攻略 · 学校里的美食家 · 医保就医超优惠
/library/06-办事指南/  (7 个)：故障申报与受理 · 奖学金与助学金政策 · 线上缴费指南 · 校园常见办事流程 · 校园电话卡与寝室宽带办理 · 校园政策QA · 转专业指南
/library/07-资源工具/  (7 个)：VPN使用指南 · 工具资源总览 · 实用工具小程序 · 湘大教务系统使用入门 · 校园一卡通指南 · 信息门户使用指南 · 学校网络使用指南
```

**md 里的跳转依赖点**：
- 每个 `[显示文字](/library/xxx/yyy)` 都要求 `docs/xxx/yyy.md` 存在。
- 显示文字里的空格 / 标点会保留（如"新生报到 Q&A"），但 URL 里的 slug 必须精确匹配文件名（"新生报到QA"）。这两者是**手工维护**的映射，容易失同步。

---

## 六、已识别的跳转"薄弱点"

以下是根据当前代码可推断的、你在体验时最容易感到"跳得不对"的地方。全部只做"事实描述 + 位置指引"，不做修复方案。

### 6.1 `/guide` 页面 vs 实际资料库脱节

- `guideLinks` 里 4 个 slug（`新生攻略总览 / 校园生活总览 / 学在湘大总览`）是**首批入库时的临时占位**。
- 现在正式库有 60 篇文件，`guide` 却仍指向 3 篇"总览"——绝大多数新内容在 `/guide` 完全无法到达。
- `#subcard-开学、迎新日程` 和 `#subcard-军训` 这两个锚点只在 `新生攻略总览.md` 的列表中会命中 `knownSubcardTitles`，跳到该文件内部锚点位置——**不会跳到独立的 `开学与迎新日程.md` / `军训指南.md`**。

### 6.2 `knownSubcardTitles` 白名单已过时

- 白名单里的 `军训` 对应 md 文件是 `军训指南.md`；`奖助政策` 对应 `奖学金与助学金政策.md`；`26 招生方案` 甚至已经不再入库。
- `findSubcardTitle(text)` 匹配的是 chunk 正文里的字面子串，会出现：
  - RAG 命中 `军训指南.md` 里的 chunk，但因为文中含 "军训" 二字，跳转 URL 会被拼上 `#subcard-军训`——**指向 `新生攻略总览.md` 的锚点，而不是这篇文件里的真实标题**。
  - 反过来，命中 `开学与迎新日程.md` 时，因文中没有恰好等于白名单里 "开学、迎新日程" 的字符串（用了"开学与迎新日程"），subcard 不会被识别；跳转靠 chunk.heading 兜底。
- 结果就是：**RAG 结果卡的跳转位置有时对、有时错，行为不可预期**。

### 6.3 资料库主题导航"取第一篇"的策略

- `library/page.tsx:12-17` 用 `Array#forEach` + `Map#set` 只在第一次遇到时才记 href，等价于"按扫描顺序取第一篇"。
- `fs.readdirSync(..., {recursive: true, withFileTypes: true})` 的顺序在不同平台/文件系统上不完全一致；换句话说，**主题卡片指向哪篇文件是隐式约定，没有优先级配置**。

### 6.4 详情页底部推荐依赖 category 完全相等

- `[...slug]/page.tsx:376` 之前的过滤：`item.category === document.category`。
- category 值来自 frontmatter，未匹配到 `docs/` 目录名的会 fallback 到 `relativePath.split("/")[0]`（`lib/markdown.ts:87`）。
- 如果新增文件把 category 写成 `课程学习` 而不是 `02-课程学习`，相关推荐就会集中在同名字符串，会跟目录切分逻辑漂移。

### 6.5 ask-panel 用原生 `<a>` 而不是 `<Link>`

- `components/ask-panel.tsx:103` 是 `<a href={...}>`。
- 意味着点击后是**整页跳转**，不是 Next 客户端路由；用户会看到一次白屏刷新。这不是 bug，但和其它 `<Link>` 的体验不一致。

### 6.6 高亮定位对锚点 heading 的强依赖

- `sourceHref` 会返回 `?highlight=xxx#heading`。
- 详情页的 heading 锚点由 `encodeURIComponent(stripInlineMarkdown(heading).trim())` 生成（`[...slug]/page.tsx:206`）。
- 只要 chunk.heading（在 build-rag-index.mjs 里保存的是"当前所在 `#` 段落文字，去掉 `#`"）和 md 里真实标题**逐字符相等**，锚点能对齐。
- 如果 md 里用了内联加粗（如 `## **军训**`），标题解析时会保留 `**`；但 heading id 因为先 `stripInlineMarkdown` 再 trim，所以是 `军训`。而 chunk.heading 在索引脚本里没剥离 markdown（`scripts/build-rag-index.mjs:56-64` 直接 `line.replace(/^#+\s*/, "")`），会保留 `**`。→ **两侧 hash 不一致，跳转会滚到页首而非目标位置**。
- 目前 md 内正文很少写加粗的标题，所以踩到这个坑不多；但只要有一个 `##  **X**` 就会静默失败。

### 6.7 内联 markdown 链接的目标存在性未校验

- 详情页 `renderInline` 会把 `[X](/library/YYY)` 全部当作有效 `<Link>` 渲染。
- 如果某天 md 里写了 `/library/05-校园生活/校园一卡通指南`（实际文件在 `07-资源工具/`），页面能点，但会跳到 Next 的 404 页面。
- 目前没有任何"链接完整性校验"（既没有 lint 也没有测试）。

### 6.8 顶部导航之外没有分类枢纽

- 用户想"看某一类的所有资料"，唯一路径是：`/library` 首页 → 找到分类卡 → 点进去看到 A 篇。
- **看不到该分类下其它资料**——因为没有 `/library/<category>` 的中间页。
- 详情页底部推荐会补一些同分类文件，但只有 4 条上限。

### 6.9 首页 "入学路线 / 咨询入口" 卡片不可点击

- `app/page.tsx:43-53` 的 `route-card` 和 `app/page.tsx:65-73` 的 `info-card` 都没有 `<Link>` 包裹。
- 视觉上是可交互卡片（有 `route-index` 编号），但**点击无反应**——用户会觉得"这些卡片是不是坏了？"

### 6.10 联系方式弹窗内部无跳转出口

- `contact-dialog.tsx` 展示的是二维码 placeholder / QQ 群号 / 表白墙"待补充最终入口"——都是纯文本。
- 没有把 QQ 群号做成 `qq://` scheme，也没有指向"如何加群"页面。
- 详情页末尾的 `.supplement-card` 引导块（当 `completeness: partial` 时展示）**也是纯文本 + QR 占位**，同样没有跳转出口。

---

## 七、数据源速查

跳转最终指向哪些内容，都取决于以下 5 份数据：

| 来源 | 文件 | 用途 |
| --- | --- | --- |
| Markdown 正文 | `docs/**/*.md` | 61 篇（含 00-知识库说明 2 篇 + 01-README 占位 + 60 篇实际内容）；`lib/markdown.ts` 只返回 `status: 已审核` |
| 静态站点数据 | `lib/site-data.ts` | `contacts`、`guideModules`、`libraryCategories` 都是硬编码 |
| 已知细分主题 | `lib/subcards.ts` | 静态白名单 13 项，见上文 |
| RAG 索引 | `data/rag-index.json`（`scripts/build-rag-index.mjs` 生成） | 当前 762 chunks，供 `/api/ask` 使用 |
| DeepSeek Key | `.env.local` | 只在服务端读取，前端不需要感知 |

---

## 八、可视化：跳转拓扑（简版）

```
        ┌──────────────────┐
        │   顶部导航 (nav)  │
        └──┬────────┬───┬──┘
           │        │   │
     ┌─────▼──┐  ┌──▼─┐ ▼
     │   /   │  │/guide │  /library
     │ (首页) │  └──┬─┘   └──┬──────────┐
     └───┬───┘     │        │          │
         │         │        │          │
         │   ┌─────▼──────┐ │          │
         │   │guide 4 模块 │ │          │
         │   └─────┬──────┘ │          │
         │         │        ▼          ▼
         │         │  ┌──────────┐   ┌────────────┐
         │         │  │主题导航    │   │资料列表     │
         │         │  │(每类首篇)  │   │(全部已审核) │
         │         │  └────┬─────┘   └─────┬──────┘
         │         │       │               │
         │         └───────┼───────────────┘
         │                 ▼
         │       ┌────────────────────┐
         │       │ /library/[...slug] │
         │       │  ├─ 内联 md 链接    │
         │       │  ├─ subcard 卡片   │
         │       │  ├─ .supplement 卡 │
         │       │  ├─ 相关推荐 4 张  │
         │       │  └─ 返回资料库     │
         │       └────────────────────┘
         │
         ▼
   ┌──────────┐        ┌────────────┐
   │AI 问答面板│ ─POST─▶│ /api/ask   │─▶ rag.ts + deepseek.ts
   │          │◀───────│            │
   │ source 卡│──<a>─▶ /library/... ?highlight=xxx#heading
   └──────────┘
```

---

## 九、你在重构时可参考的问题清单

以下按"影响范围从大到小"给出，方便你决定优先级。**都是问题，不是方案**。

1. `/guide` 页只覆盖 4 个占��� slug；60 篇新内容如何进入这条主线？
2. `knownSubcardTitles` 白名单是否要保留？如果要保留，如何和实际文件保持同步？
3. RAG source 跳转链路（`sourceHref` → 白名单 → heading 锚点）在多个环节都可能失配，是否统一走 heading 锚点更简单？
4. 主题卡"取第一篇"策略是否要改成"进入分类页"？如果要做分类页，路由要不要新建 `/library/[category]/page.tsx`？
5. 详情页底部的相关推荐只按 category 相等聚合；是否需要引入 tag、`related:` frontmatter 或跨类目跳转？
6. 首页的 `route-card` / `info-card` 明明是卡片形态却不可点，是要补链接，还是明确降级为"信息展示"？
7. 联系方式（弹窗 + `.supplement-card`）需要真正的跳转出口吗（微信二维码图片、QQ 加群 scheme、表白墙外链）？
8. md 内的内部链接（`[X](/library/YYY)`）是否需要构建期校验，避免有一天写错路径静默 404？
9. ask-panel 的 source 卡片改成 `<Link>` 后能获得客户端路由体验，是否需要？
10. `getSourceDocumentHref` 名字带"Source"但只在 RAG 场景用；`getDocumentHref` 才是通用的——两个函数是否合并成一个更清晰的 API？

---

## 十、附：所有相关文件一览

```
app/
  layout.tsx                    ── 全站导航 + 联系弹窗挂载
  page.tsx                      ── 首页（Hero / 路线卡 / 咨询卡）
  guide/page.tsx                ── 入学指南（4 模块 → 硬编码 guideLinks）
  library/page.tsx              ── 资料库首页
  library/[...slug]/page.tsx    ── 资料详情页（markdown 渲染 + subcard + 推荐 + supplement）
  api/ask/route.ts              ── 问答 API（RAG + DeepSeek）

components/
  ask-panel.tsx                 ── 首页 AI 问答面板（含 source 卡跳转）
  contact-dialog.tsx            ── "加群咨询" 弹窗（无跳转）

lib/
  routes.ts                     ── getDocumentHref / getSourceDocumentHref
  subcards.ts                   ── knownSubcardTitles + getSubcardId
  markdown.ts                   ── 读取 docs/ 下 md 文件
  display.ts                    ── formatCategory / formatSource / cleanExcerpt
  site-data.ts                  ── contacts / guideModules / libraryCategories 静态数据
  rag.ts                        ── 本地 RAG 检索
  deepseek.ts                   ── DeepSeek API 封装

scripts/
  build-rag-index.mjs           ── 生成 data/rag-index.json

data/
  rag-index.json                ── 当前 762 chunks

docs/                           ── 实际内容（61 篇 md）
```

---

**读完这份文档后建议的下一步**：
- 用 5–10 分钟把上面 `六、薄弱点` 每一条对号入座验证一遍；
- 挑出你觉得优先级最高的 1–2 条，我们再具体讨论重构方案（页面拆分？路由新增？subcard 白名单去掉？）。
