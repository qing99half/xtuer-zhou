# xtuer-zhou 重构收尾执行清单（v2-finish）

> 版本：v2-finish · 2026-07-19
>
> 上游依据：
> - `product/development-plan-v2.md`（v2 主规划，Phase A–E / 里程碑 M1–M5）
> - `product/architecture-proposal.md`（架构确认稿）
> - `product/navigation-audit.md`（现网跳转审计）
>
> **本清单的定位**：v2 主规划的收尾执行版。基于 D 盘代码的实测进度，把「还差多少 → 按什么顺序补 → 每步的验收标准」讲清楚，避免再次跳步或漏做。
>
> **硬约束**：延续 v2 主规划 §0 与 §9。任何入口都必须可点、点开不能 404、md 内部链接不能静默失效。

---

## 0. 实测进度（M1–M5 对账）

以 2026-07-19 D 盘 `git status` + 实际文件扫描为准。**✅ = 已完成 · 🟡 = 部分完成 · ❌ = 未开始**。

| 里程碑 | 完成度 | 实测证据 |
| --- | --- | --- |
| **M1 数据基座（Phase A）** | ✅ 100% | `lib/site-data.ts` 已含 `sections[8]` / `phases[6]`；`lib/markdown.ts` 已解析 `primarySection / sections / phase / tags / weight`；`lib/routes.ts / related.ts / display.ts / deepseek.ts` 均已就位 |
| **M2 内容迁移（Phase B）** | ✅ 100% | `docs/newcomer/study/life/campus/tools/clubs/orgs/card/_shared` 全部到位；社团 7 篇已拆；60 篇 md 全部含 `primarySection`（`grep -L` 为空）；旧路径链接残留 **0 处**；旧 8 个中文目录已删 |
| **M3 路由骨架（Phase C）** | ✅ 100% | 新增：`app/library/[section]/page.tsx` · `app/library/[section]/[...slug]/page.tsx` · `app/guide/[phase]/page.tsx` · `app/qa/page.tsx` · `app/about/page.tsx`；旧 `app/library/[...slug]/page.tsx` 已删；`lib/subcards.ts` 已删 |
| **M4 首页重排与跳转打通（Phase D）** | 🟡 40% | `/library` / `/library/[section]` / `/guide` / `/guide/[phase]` 页面骨架已就位；**❌ `app/page.tsx` 仍是旧版**（4 route-card + 3 不可点 contact-card + 引用 `guideModules`）；详情页三层相关 / 上下篇 / 面包屑需实测；`components/ask-panel.tsx` 的 source 卡跳转方式待核 |
| **M5 内容补齐与打磨（Phase E）** | 🟡 30% | `/about` 页面文件已存在但内容深度未核；`docs/card/新生必看什么是校园卡.md` 已存在（内容待检）；反诈骗 / 公告栏 / 一封信正文待核；**❌ 内部链接构建期校验脚本未建**；RAG 索引是否按新字段重建未核；移动端断点未验收 |

**结论**：主干（M1–M3）已经落地；剩下最要紧的是 **M4 首页重排** 与 **M5 内容/校验/验收**。整个收尾预计 **3 个开发批次**（下文 W1–W3）。

---

## 1. 收尾任务全量 checklist

按 **优先级 × 依赖顺序** 排列。每项都会在 §2 落到具体的批次。

### 1.1 M4 收尾（P0 · 页面级跳转打通）

- [ ] **T1** 核验 `app/library/[section]/[...slug]/page.tsx` 是否含：面包屑（首页 › section › 标题）、三层相关（同 section by tags + 跨 section by sections 交集 + md 反向链接）、上/下篇。缺什么补什么。
- [ ] **T2** 核验 `app/library/page.tsx`：**8 主题网格**（section 卡带 emoji / desc / 3 篇预览）+ 全部资料展开列表；每张主题卡链 `/library/<section>`。
- [ ] **T3** 核验 `app/guide/page.tsx`：**6 phase 卡**总览 + 每 phase 挑 3 篇预览；每卡链 `/guide/<phase>`。
- [ ] **T4** 核验 `app/guide/[phase]/page.tsx`：phase hero + 匹配 `phase[]` 的资料列表 + 关联推荐。
- [ ] **T5** 核验 `app/qa/page.tsx`：**4 张 Q&A 卡**（新生报到 / 校园政策 / 奖助 / 升学就业）+ AskPanel；每卡链 `/qa/<slug>`。⚠️ v2 §5.5 提到 `/qa/[slug]` 单页复用详情组件——**当前实测未建 `[slug]` 子路由**，需按 v2 补：要么建独立 `/qa/[slug]/page.tsx`，要么让 Q&A 卡直接链到 `/library/newcomer/新生报到QA` 这类现有详情页。
- [ ] **T6** **首页重写 `app/page.tsx`**（本次最大改动）：
    - [ ] 顶部反诈提醒条 → `/about#anti-fraud`
    - [ ] Hero + AskPanel（保留）
    - [ ] 时间轴 6 卡 → `/guide/<phase>`
    - [ ] 主题网格 8 卡 → `/library/<section>`
    - [ ] 高频 Q&A 4 卡 → `/qa` 或对应资料详情
    - [ ] 咨询入口 3 卡（可点）→ `/about#announce`
    - [ ] 移除 `guideModules` 依赖
- [ ] **T7** `components/ask-panel.tsx`：把 source 卡的原生 `<a>` 改成 `next/link` 的 `<Link>`，保留 `?highlight=...#heading`。
- [ ] **T8** 核验 `app/layout.tsx` 顶部导航是否含 `/`、`/guide`、`/library`、`/qa`、`/about` 五个入口。缺就补。

### 1.2 M5 收尾（P1 · 内容补齐 + 校验 + 验收）

- [ ] **T9** `/about` 内容落地：
    - [ ] `#letter` 一封信（可直接从源文档抄）
    - [ ] `#announce` 公告栏（QQ 群 / 湘小君公众号 / 校园墙 / 官方 vs 民间群甄别）
    - [ ] `#anti-fraud` 反诈骗专栏（源文档尾部有原文）
    - [ ] `#outside` 写在手册之外（呼应 ContactDialog）
- [ ] **T10** `docs/card/新生必看什么是校园卡.md` 内容审核：若仍是占位，标 `completeness: partial` 并写 `completenessNote`；不要伪造正文。
- [ ] **T11** `scripts/check-links.mjs` 新建：扫 `docs/**/*.md` 内的 `[X](/library/...)`，对不上文件就 `exit(1)`；`package.json` 加 `check:links`，并让 `rag:index` 或 `build` 依赖它。
- [ ] **T12** `scripts/build-rag-index.mjs` 调整：
    - [ ] `chunk.heading` 生成时 strip 掉 `**bold**` / 前后空白（对齐详情页锚点生成规则）
    - [ ] 同步 `sections / phase / tags / primarySection` 到索引记录（如果检索排序会用到）
    - [ ] 运行 `npm run rag:index`，chunks 数量 ≥ 760
- [ ] **T13** 清理 `lib/site-data.ts` 中不再被使用的 `libraryCategories` / `guideModules` 与其 type；避免误引用。
- [ ] **T14** 移动端断点验收：Playwright 分别在 360×720 与 768×1024 打开首页、`/library`、`/library/study`、`/library/study/培养计划`、`/guide/first-week`、`/qa`、`/about`，观察卡片、hero、面包屑不溢出。
- [ ] **T15** 冒烟走查：Playwright 从首页出发，顺序点击 5 项顶级导航 + 6 phase 卡 + 8 section 卡 + 随机 3 篇详情 + 面包屑回跳 + AskPanel 提问命中跳转，全程不出现 404 / 白屏。
- [ ] **T16** `npm run build` 通过；静态页面数 ≥ 60（详情 60+ 分类 8 + 阶段 6 + Q&A/about/其他）。
- [ ] **T17** 同步更新 `product/development-log.md` / `development-roadmap.md`：把 v2-finish 三个批次的完成情况记进去；`development-roadmap.md` v0.1 标记为 archived → 指向 v2 + v2-finish。

---

## 2. 执行批次（W1 → W3）

**每批之间都停一次让用户核验**，不一次性推 20 个文件。

### W1 — 首页与跳转链路打通（M4）

范围：**T1 · T2 · T3 · T4 · T5 · T6 · T7 · T8**

目标态：从 `/` 出发的所有可见入口全部能点开一个非 404 页面。

验收：
- `npm run build` 通过
- Playwright：首页每张卡（反诈条 1 + 时间轴 6 + 主题 8 + Q&A 4 + 咨询 3）逐个点，全部落到有内容的目标页
- 详情页面包屑三级可点；上下篇（若存在）可点；相关卡是有效链接

### W2 — 内容与校验补齐（M5 前半）

范围：**T9 · T10 · T11 · T12**

目标态：内容层没有半空页面；有一道自动化闸门防止 md 内部链接静默失效。

验收：
- `/about` 四段内容成形（每段至少 200 字或结构化列表）
- `npm run check:links` 通过
- `npm run rag:index` 通过，chunks ≥ 760

### W3 — 打磨、清理与验收（M5 后半）

范围：**T13 · T14 · T15 · T16 · T17**

目标态：可以对外演示；开发日志同步。

验收：
- `lib/site-data.ts` 中不再有 `libraryCategories` / `guideModules`
- 移动端 2 个断点无阻塞
- 冒烟脚本 / 手工路径全绿
- 开发日志 & 路线图更新

---

## 3. 需要用户在 W1 开始前二次确认的 3 个点

| # | 决策项 | 建议 | 影响 |
| --- | --- | --- | --- |
| 1 | 首页的 **高频 Q&A 4 卡** 目标 URL：是走 `/qa/<slug>` 独立详情，还是直接跳现有的 `/library/newcomer/新生报到QA` 等资料详情？ | 建议**直接跳资料详情**，不额外做 `/qa/[slug]`——4 篇 Q&A 都已在 `docs/**/*QA.md` 里落地了，重复渲染没必要。 | 少写 1 个路由 + 1 个组件；`/qa` 首页保留作为"问答索引 + AskPanel" |
| 2 | 首页 **反诈提醒条** 视觉：是纯背景色的 alert 条，还是带图标 + 关闭按钮的强提示？ | 建议**背景色 + 文字 + 一个"查看反诈提醒 →"链接**，不做关闭按钮（新生每次进都该看到）。 | 影响 `app/globals.css` 大约 20 行 |
| 3 | **card 专栏**：`docs/card/` 目前只有 1 篇文件（`新生必看什么是校园卡.md`）。分类页会显得很空。是否把 `tools/校园一卡通指南.md` 的 `sections[]` 加上 `card`，让它同时挂过来？ | 建议**加**——正好验证一内容多归属机制。 | 改 1 篇 md frontmatter |

---

## 4. 汇报节奏

每批（W1 / W2 / W3）完成后：
1. 当前进程：W? 完成
2. 本次改动：文件清单
3. 验证：`build` / `rag:index` / `check:links` / Playwright 结果
4. 下一步：进入下一批 or 请用户确认阻塞项
5. 是否触发 §3 之外新的决策项

---

**这份规划的读法**：
- §0 是"实测账"，用来说明起点；
- §1 是"总任务清单"，17 项；
- §2 是"落到批次的顺序"，W1→W3；
- §3 是"动手前要你拍板的 3 个岔路"。

用户在任意一节可以 `❌ 移除` / `⭐ 修改` / `❓ 存疑` 打批注；定稿后我就按 W1 顺序落地，每批停一次。
