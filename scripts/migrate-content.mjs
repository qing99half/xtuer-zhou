// scripts/migrate-content.mjs
// Phase B one-shot content migration:
// - Move 55 files from old Chinese dirs to new slug dirs
// - Add primarySection / sections / phase / tags / weight frontmatter
// - Rewrite internal /library/xxx links
// - Split 湘大社团一览 → 7 club files
// - Create card placeholder + 26 招生方案
// - Delete old dirs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const RAW_DIR = path.join(DOCS, "99-待整理资料", "腾讯文档下载");

// ─── 1. Direct migration table ──────────────────────────────────────────────
const MIGRATIONS = [
  // newcomer
  ["01-新生入学/新生攻略总览.md",       "newcomer/新生攻略总览.md",       "newcomer", [],                       ["pre-arrival"],           ["综述","索引"],          100],
  ["01-新生入学/开学与迎新日程.md",     "newcomer/开学与迎新日程.md",     "newcomer", [],                       ["arrival"],               ["日程","报到"],          90],
  ["01-新生入学/2026新生报到流程.md",   "newcomer/2026新生报到流程.md",   "newcomer", [],                       ["arrival"],               ["报到","交通"],          95],
  ["01-新生入学/新生报到QA.md",         "newcomer/新生报到QA.md",         "newcomer", [],                       ["arrival"],               ["报到","Q&A"],           85],
  ["01-新生入学/大学概念百科.md",       "newcomer/大学概念百科.md",       "newcomer", ["study"],                ["pre-arrival"],           ["绩点","保研","综测"],    80],
  ["01-新生入学/开学物品指南.md",       "newcomer/开学物品指南.md",       "newcomer", ["life"],                 ["pre-arrival"],           ["行李","物品"],          88],
  ["01-新生入学/军训指南.md",           "newcomer/军训指南.md",           "newcomer", [],                       ["training"],              ["军训","物资"],          82],
  ["01-新生入学/买电脑分享.md",         "newcomer/买电脑分享.md",         "newcomer", ["tools"],                ["pre-arrival"],           ["电脑","数码"],          70],
  ["01-新生入学/公告栏与新生群提醒.md", "newcomer/公告栏与新生群提醒.md", "newcomer", [],                       ["pre-arrival"],           ["公告","反诈"],          75],

  // study
  ["02-课程学习/学在湘大总览.md",       "study/学在湘大总览.md",         "study",    [],                       ["first-term"],            ["综述","索引"],          100],
  ["02-课程学习/作息安排.md",           "study/作息安排.md",             "study",    [],                       ["first-week"],            ["作息"],                 70],
  ["02-课程学习/选课与通识课.md",       "study/选课与通识课.md",         "study",    [],                       ["first-term"],            ["选课"],                 85],
  ["02-课程学习/选课修课与访学.md",     "study/选课修课与访学.md",       "study",    [],                       ["first-term"],            ["选课","访学"],          80],
  ["02-课程学习/学分成绩与课程考核.md", "study/学分成绩与课程考核.md",   "study",    [],                       ["first-term"],            ["学分","绩点"],          82],
  ["02-课程学习/培养计划.md",           "study/培养计划.md",             "study",    [],                       ["first-term"],            ["培养方案"],             90],
  ["02-课程学习/保研与科学竞赛.md",     "study/保研与科学竞赛.md",       "study",    [],                       ["first-year"],            ["保研","竞赛"],          88],
  ["02-课程学习/实验班与拔尖班选拔.md", "study/实验班与拔尖班选拔.md",   "study",    ["newcomer"],             ["pre-arrival","first-term"], ["拔尖班","韶峰班"],   75],
  ["03-考试考证/常见考证清单.md",       "study/常见考证清单.md",         "study",    [],                       ["first-year"],            ["四六级","考证"],        72],
  ["02-课程学习/升学就业QA.md",         "study/升学就业QA.md",           "study",    [],                       ["first-year"],            ["保研","就业","Q&A"],    68],
  ["06-办事指南/转专业指南.md",         "study/转专业指南.md",           "study",    [],                       ["first-year"],            ["转专业"],               78],

  // life
  ["05-校园生活/校园生活总览.md",       "life/校园生活总览.md",           "life",     [],                       ["first-week"],            ["综述","索引"],          100],
  ["07-资源工具/实用工具小程序.md",     "life/实用工具小程序.md",         "life",     ["tools"],                ["first-week"],            ["小程序","工具"],        80],
  ["05-校园生活/健康体魄勤运动.md",     "life/健康体魄勤运动.md",         "life",     [],                       ["training"],              ["运动","健康"],          70],
  ["05-校园生活/快递收发驿站通.md",     "life/快递收发驿站通.md",         "life",     [],                       ["first-week"],            ["快递"],                 75],
  ["05-校园生活/寝室生活大揭秘.md",     "life/寝室生活大揭秘.md",         "life",     [],                       ["arrival"],               ["宿舍"],                 90],
  ["05-校园生活/校园出行有攻略.md",     "life/校园出行有攻略.md",         "life",     ["newcomer"],             ["arrival"],               ["交通","出行"],          88],
  ["05-校园生活/学校里的美食家.md",     "life/学校里的美食家.md",         "life",     [],                       ["first-week"],            ["美食","食堂"],          72],
  ["05-校园生活/湘潭游玩指南.md",       "life/湘潭游玩指南.md",           "life",     [],                       ["first-year"],            ["游玩","假期"],          60],
  ["05-校园生活/医保就医超优惠.md",     "life/医保就医超优惠.md",         "life",     [],                       ["training"],              ["医保","校医院"],        78],
  ["05-校园生活/湘潭地铁乘坐指南.md",   "life/湘潭地铁乘坐指南.md",       "life",     ["newcomer"],             ["arrival"],               ["地铁","长沙"],          68],
  ["05-校园生活/图书馆与自习室.md",     "life/图书馆与自习室.md",         "life",     ["study"],                ["first-term"],            ["图书馆","自习"],        83],

  // campus
  ["04-学院专业/湘大印象总览.md",       "campus/湘大印象总览.md",         "campus",   [],                       ["pre-arrival"],           ["综述","索引"],          100],
  ["04-学院专业/学校简介与校史.md",     "campus/学校简介与校史.md",       "campus",   [],                       ["pre-arrival"],           ["校史","双一流"],        95],
  ["04-学院专业/校园文化.md",           "campus/校园文化.md",             "campus",   [],                       ["pre-arrival"],           ["校徽","校训"],          85],
  ["04-学院专业/院系与专业设置.md",     "campus/院系与专业设置.md",       "campus",   ["study"],                ["pre-arrival"],           ["院系","专业"],          90],
  ["04-学院专业/湘大校园地图.md",       "campus/湘大校园地图.md",         "campus",   ["newcomer","life"],      ["arrival"],               ["地图","校区"],          88],
  ["04-学院专业/湘大校园实拍.md",       "campus/湘大校园实拍.md",         "campus",   ["life"],                 ["pre-arrival"],           ["宿舍","食堂"],          75],
  ["04-学院专业/教学楼分布.md",         "campus/教学楼分布.md",           "campus",   ["study"],                ["first-week"],            ["教学楼"],               70],

  // tools
  ["06-办事指南/校园常见办事流程.md",   "tools/办事流程总览.md",           "tools",    [],                       ["first-week"],            ["办事","流程"],          90, "办事流程总览"],
  ["07-资源工具/信息门户使用指南.md",   "tools/信息门户使用指南.md",       "tools",    ["study"],                ["first-week"],            ["信息门户"],             95],
  ["07-资源工具/学校网络使用指南.md",   "tools/学校网络使用指南.md",       "tools",    [],                       ["first-week"],            ["校园网"],               85],
  ["07-资源工具/VPN使用指南.md",        "tools/VPN使用指南.md",           "tools",    ["study"],                ["first-week"],            ["VPN","校外访问"],       80],
  ["06-办事指南/校园电话卡与寝室宽带办理.md", "tools/校园电话卡与寝室宽带办理.md", "tools", ["life"],           ["arrival"],               ["电话卡","宽带"],        88],
  ["07-资源工具/校园一卡通指南.md",     "tools/校园一卡通指南.md",         "tools",    ["card"],                 ["arrival"],               ["一卡通"],               92],
  ["06-办事指南/线上缴费指南.md",       "tools/线上缴费指南.md",           "tools",    [],                       ["first-week"],            ["缴费","财务"],          78],
  ["06-办事指南/故障申报与受理.md",     "tools/故障申报与受理.md",         "tools",    [],                       ["first-week"],            ["报修"],                 70],
  ["07-资源工具/湘大教务系统使用入门.md", "tools/湘大教务系统使用入门.md", "tools",    ["study"],                ["first-term"],            ["教务系统"],             82],
  ["06-办事指南/奖学金与助学金政策.md", "tools/奖学金与助学金政策.md",     "tools",    ["newcomer"],             ["pre-arrival"],           ["奖学金","助学金"],      85],
  ["06-办事指南/校园政策QA.md",         "tools/校园政策QA.md",             "tools",    ["newcomer"],             ["first-week"],            ["校规","Q&A"],           75],
  ["07-资源工具/工具资源总览.md",       "tools/工具资源总览.md",           "tools",    [],                       ["first-week"],            ["综述","索引"],          100],

  // clubs index (split will happen separately)
  ["05-校园生活/湘大社团一览.md",       "clubs/社团一览.md",              "clubs",    [],                       ["first-term"],            ["综述","索引"],          100, "湘大社团一览"],

  // orgs
  ["05-校园生活/社团与组织总览.md",     "orgs/组织与工作总览.md",         "orgs",     [],                       ["first-term"],            ["综述","索引"],          100, "组织与工作总览"],
  ["01-新生入学/班委职务与竞选.md",     "orgs/班委职务与竞选.md",         "orgs",     ["newcomer"],             ["first-week"],            ["班委"],                 95],
  ["05-校园生活/湘潭大学学生会.md",     "orgs/湘潭大学学生会.md",         "orgs",     [],                       ["first-term"],            ["学生会"],               88],
  ["05-校园生活/湘潭大学大学生艺术团.md", "orgs/湘潭大学大学生艺术团.md", "orgs",     [],                       ["first-term"],            ["艺术团"],               82],
  ["05-校园生活/湘潭大学学生社团联合会.md", "orgs/湘潭大学学生社团联合会.md", "orgs", ["clubs"],                ["first-term"],            ["社联"],                 80],
  ["05-校园生活/湘潭大学研究生会介绍.md", "orgs/湘潭大学研究生会介绍.md", "orgs",     [],                       ["first-term"],            ["研究生"],               70],

  // _shared
  ["00-知识库说明/Markdown资料模板.md", "_shared/Markdown资料模板.md",   "_shared",  [],                       [],                        [],                       0],
  ["00-知识库说明/资料入库与审核规则.md", "_shared/资料入库与审核规则.md", "_shared", [],                       [],                        [],                       0],
];

// ─── 2. Link rewrite tables ─────────────────────────────────────────────────
const PREFIX_REWRITES = {
  "/library/01-新生入学/": "/library/newcomer/",
  "/library/02-课程学习/": "/library/study/",
  "/library/03-考试考证/": "/library/study/",
  "/library/04-学院专业/": "/library/campus/",
  "/library/05-校园生活/": "/library/life/",
  "/library/06-办事指南/": "/library/tools/",
  "/library/07-资源工具/": "/library/tools/",
};

// Applied AFTER prefix rewrites; fixes files that moved to a section different
// from what the prefix rule would give.
const SPECIAL_REWRITES = {
  "/library/life/湘大社团一览":        "/library/clubs/社团一览",
  "/library/life/社团与组织总览":      "/library/orgs/组织与工作总览",
  "/library/tools/校园常见办事流程":   "/library/tools/办事流程总览",
  "/library/tools/转专业指南":         "/library/study/转专业指南",
  "/library/life/湘潭大学学生会":      "/library/orgs/湘潭大学学生会",
  "/library/life/湘潭大学大学生艺术团": "/library/orgs/湘潭大学大学生艺术团",
  "/library/life/湘潭大学学生社团联合会": "/library/orgs/湘潭大学学生社团联合会",
  "/library/life/湘潭大学研究生会介绍": "/library/orgs/湘潭大学研究生会介绍",
  "/library/newcomer/班委职务与竞选":  "/library/orgs/班委职务与竞选",
};

// ─── 3. Helpers ─────────────────────────────────────────────────────────────
function transformFrontmatter(raw, opts) {
  if (!raw.startsWith("---")) {
    throw new Error("no frontmatter");
  }
  const end = raw.indexOf("\n---", 3);
  if (end === -1) throw new Error("unterminated frontmatter");
  const fmBlock = raw.slice(3, end);
  const body = raw.slice(end + 4).replace(/^\n+/, "");

  const skip = new Set(["primarySection", "sections", "phase", "tags", "weight", "category"]);
  const keptLines = [];

  for (const line of fmBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;
    const key = trimmed.slice(0, colonIdx).trim();
    if (skip.has(key)) continue;
    if (opts.titleOverride && key === "title") {
      keptLines.push(`title: ${opts.titleOverride}`);
    } else {
      keptLines.push(line);
    }
  }

  const sections = opts.sections.length
    ? [opts.primarySection, ...opts.sections]
    : [opts.primarySection];
  const uniqSections = Array.from(new Set(sections));

  const newFmLines = [
    "---",
    ...keptLines,
    `primarySection: ${opts.primarySection}`,
    `sections: [${uniqSections.join(", ")}]`,
    `phase: [${opts.phase.join(", ")}]`,
    `tags: [${opts.tags.join(", ")}]`,
    `weight: ${opts.weight}`,
    "---",
    "",
  ];

  return newFmLines.join("\n") + body;
}

function rewriteLinks(content) {
  let result = content;
  for (const [from, to] of Object.entries(PREFIX_REWRITES)) {
    result = result.split(from).join(to);
  }
  for (const [from, to] of Object.entries(SPECIAL_REWRITES)) {
    result = result.split(from).join(to);
  }
  return result;
}

function writeFile(newRel, content) {
  const full = path.join(DOCS, newRel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

// ─── 4. Run main migrations ─────────────────────────────────────────────────
let migrated = 0;
for (const [oldRel, newRel, primary, sections, phase, tags, weight, titleOverride] of MIGRATIONS) {
  const oldFull = path.join(DOCS, oldRel);
  if (!fs.existsSync(oldFull)) {
    console.warn(`SKIP (missing): ${oldRel}`);
    continue;
  }
  const raw = fs.readFileSync(oldFull, "utf-8");
  const withFm = transformFrontmatter(raw, {
    primarySection: primary,
    sections,
    phase,
    tags,
    weight,
    titleOverride,
  });
  const withLinks = rewriteLinks(withFm);
  writeFile(newRel, withLinks);
  migrated += 1;
}
console.log(`✓ Direct migrations: ${migrated}`);

// ─── 5. Split 湘大社团一览 → 7 club files ──────────────────────────────────
const CLUB_SPLITS = [
  ["49-学术研究类.md", "clubs/学术研究类.md", "学术研究类", ["study"], ["学术","竞赛"], 80],
  ["50-公益类.md",    "clubs/公益类.md",    "公益类",    [],        ["支教","志愿"], 75],
  ["51-实践类.md",    "clubs/实践类.md",    "实践类",    [],        ["实践","商业"], 75],
  ["52-文化类.md",    "clubs/文化类.md",    "文化类",    [],        ["文学","语言"], 75],
  ["53-科技类.md",    "clubs/科技类.md",    "科技类",    [],        ["电子","建模"], 75],
  ["54-艺术类.md",    "clubs/艺术类.md",    "艺术类",    [],        ["音乐","舞蹈"], 75],
  ["55-体育类.md",    "clubs/体育类.md",    "体育类",    [],        ["球类","极限"], 75],
];

function cleanRawClubContent(raw) {
  // Strip repeated title lines, "点击返回首页" navigation, image-failed markers,
  // orphan tencent-docs UI text lines. Keep the actual club descriptions.
  const noYamlFm = raw.startsWith("---")
    ? raw.slice(raw.indexOf("\n---", 3) + 4).replace(/^\n+/, "")
    : raw;
  const withoutTail = noYamlFm.split("## 图片链接")[0].trimEnd();
  const withoutReturnLink = withoutTail
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (!t) return true;
      if (t.startsWith("点击返回首页") || t.startsWith("点击此处返回")) return false;
      if (t === "图片加载失败，请稍后再试") return false;
      if (t === "1人已点赞" || t === "人已点赞") return false;
      if (t.startsWith("—XTU's Associations—")) return false;
      return true;
    })
    .join("\n");
  return withoutReturnLink.trim();
}

function buildClubFile(title, rawContent, primary, sections, tags, weight) {
  const cleaned = cleanRawClubContent(rawContent);
  // Remove leading duplicate H1 (usually "# 学术研究类\n学术研究类\n学术研究类\n...")
  const lines = cleaned.split("\n");
  const filtered = [];
  let seenH1 = false;
  for (const line of lines) {
    const t = line.trim();
    if (!seenH1 && (t === `# ${title}` || t === title)) {
      if (!seenH1) {
        seenH1 = true;
        filtered.push(`# ${title}`);
      }
      continue;
    }
    if (seenH1 && t === title) continue;
    filtered.push(line);
  }
  const body = filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const uniqSections = Array.from(new Set([primary, ...sections]));
  return [
    "---",
    `title: ${title}`,
    "category: 05-校园生活",
    "status: 已审核",
    "source: 用户提供的《湘潭大学2026新生攻略》整理内容",
    "updatedAt: 2026-07-18",
    "indexable: true",
    "completeness: complete",
    `primarySection: ${primary}`,
    `sections: [${uniqSections.join(", ")}]`,
    "phase: [first-term]",
    `tags: [${tags.join(", ")}]`,
    `weight: ${weight}`,
    "---",
    "",
    body,
    "",
  ].join("\n");
}

let clubsCount = 0;
for (const [rawFile, newRel, title, extraSections, tags, weight] of CLUB_SPLITS) {
  const rawPath = path.join(RAW_DIR, rawFile);
  if (!fs.existsSync(rawPath)) {
    console.warn(`SKIP club (missing raw): ${rawFile}`);
    continue;
  }
  const raw = fs.readFileSync(rawPath, "utf-8");
  const output = buildClubFile(title, raw, "clubs", extraSections, tags, weight);
  writeFile(newRel, output);
  clubsCount += 1;
}
console.log(`✓ Club splits: ${clubsCount}`);

// ─── 6. Create card placeholder ─────────────────────────────────────────────
writeFile(
  "card/新生必看什么是校园卡.md",
  [
    "---",
    "title: 新生必看！什么是校园卡",
    "category: 校园卡专栏",
    "status: 已审核",
    "source: 占位（源文档正文抓取尚未成功，等待后续补充）",
    "updatedAt: 2026-07-18",
    "indexable: true",
    "completeness: partial",
    'completenessNote: 本页为校园卡专栏占位。完整介绍（含卡片形态、办理流程、消费规则、挂失补办、社保卡合一等）会在源文档正文抓取成功后补齐。如你已经拿到 2026 级校园卡实物、办理凭证或宿舍片区办卡指引，欢迎联系我们补充。',
    "primarySection: card",
    "sections: [card, tools]",
    "phase: [arrival]",
    "tags: [校园卡, 建行]",
    "weight: 100",
    "---",
    "",
    "# 新生必看！什么是校园卡",
    "",
    "校园卡是新生入学后最先接触的实物证件之一，与校园身份、消费、借阅、缴费都相关。这份专栏目前仅为占位，主要指路到已入库的相关资料，等到源文档正文抓取到位后再逐段补齐。",
    "",
    "## 先看这些",
    "",
    "- 完整的一卡通功能、账户结构、充值方式、挂失流程见 [校园一卡通指南](/library/tools/校园一卡通指南)。",
    "- 校园卡缴费相关操作见 [线上缴费指南](/library/tools/线上缴费指南)。",
    "- 校园卡在门禁 / 图书馆 / 食堂的具体应用会持续更新。",
    "",
    "## 待补充内容",
    "",
    "- 新生领卡时的现场流程（照片、身份证、拍照顺序）。",
    "- 建行储蓄账户激活步骤。",
    "- 社保卡合一 / 校园卡合一政策的最新说明。",
    "- 遗失 / 消磁的常见排查方法。",
    "",
    "如你希望帮忙一起完善这份专栏，欢迎通过顶部 “加群咨询” 或页面末尾的 “补充信息” 联系我们。",
    "",
  ].join("\n"),
);
console.log("✓ Card placeholder created");

// ─── 7. Create 26 招生方案 (from web search) ────────────────────────────────
writeFile(
  "newcomer/26招生方案.md",
  [
    "---",
    "title: 2026 年招生方案",
    "category: 01-新生入学",
    "status: 已审核",
    "source: 网络公开资料整理（湘潭大学 2026 年普通高校招生章程、湘潭大学本科招生网、高考直通车、新华网、教育在线、中国美术高考网等公开报道）",
    "updatedAt: 2026-07-18",
    "indexable: true",
    "completeness: partial",
    "completenessNote: 分省分专业的具体招生计划以各省级招生考试机构公布为准；本页只做通用介绍，不作为报考依据。如你有本级本省份的招生数据、录取分数、专业调剂经验，欢迎联系我们补充。",
    "primarySection: newcomer",
    "sections: [newcomer]",
    "phase: [pre-arrival]",
    "tags: [招生, 分省, 招生章程, 韶峰科创班]",
    "weight: 60",
    "---",
    "",
    "# 2026 年招生方案",
    "",
    "湘潭大学 2026 年招生方案 / 招生章程已由学校正式发布，覆盖普通类、艺术类、专项计划及新增的 **韶峰科创班**。这份指南对已录取的新生做背景性介绍，让你了解自己入学时学校的基本盘。",
    "",
    "## 一句话理解",
    "",
    "- 学校性质：国家 “双一流” 建设高校、综合性全国重点大学、湖南省与教育部共建高校。",
    "- 学科实力：**1 个世界一流建设学科**（数学），**7 个 ESI** 学科进入全球前 1%，**41 个国家级、15 个省级** 一流本科专业建设点。",
    "- 招生原则：分省分专业计划最终以各省招考机构公布为准。",
    "",
    "## 一、招生计划管理机制",
    "",
    "- 学校招生计划管理部门根据教育主管部门下达的招生总计划制定各专业 / 各省招生计划，报教育行政主管部门批准后执行。",
    "- 依据教育部规定，学校预留 **不超过总计划 1%** 的本科招生计划，用于调节各地统考上线生源的不平衡，执行统一录取规定。",
    "- 具体分省分专业计划公布方式：以各省（自治区、直辖市）招生考试机构公布的信息为准。",
    "",
    "## 二、提档比例",
    "",
    "- 顺序志愿投档批次：按省级高校招生主管部门规定执行。",
    "- 平行志愿投档批次：**原则上控制在 105% 以内**。",
    "",
    "## 三、2026 年新增亮点：韶峰科创班",
    "",
    "学校深度融入湖南省科技创新院建设，成立 **湘江卓越工程师学院**，开办 **“韶峰科创班”**（机器人应用—低空经济方向）：",
    "",
    "- 面向：普通全日制在籍在读的高考科类为理科或考试科目中包含物理的本科生（**不含中外合作办学、艺术学院**）。",
    "- 培养：全新培养方案 + 校企双导师 + 项目制小班化教学。",
    "- 模式：“一校对多企” 校企联合共建。",
    "- 更多实验班 / 拔尖班介绍见 [实验班与拔尖班选拔](/library/study/实验班与拔尖班选拔)。",
    "",
    "## 四、艺术类分省招生",
    "",
    "2026 年拟面向 **北京、上海、湖南、湖北、河南、河北、山东、广东** 等 **8 个省（市）** 招收：",
    "",
    "- 视觉传达设计",
    "- 动画",
    "- 艺术设计学",
    "",
    "最终招生专业、招生计划和录取批次以当地省级考试招生主管部门公布的信息为准。",
    "",
    "## 五、语种与其他要求",
    "",
    "- **英语类专业**：要求外语应试语种为英语。",
    "- **其他专业**：原则上不限外语应试语种；考生进校后以 **英语、日语、法语、德语、西班牙语** 为公共外语安排教学。",
    "- 学校对 **往届生和应届生一视同仁**，不作男女比例限制。",
    "- 高考综合改革省份考生需满足学校招生专业 **选科要求**；非改革省份需满足 **文理科要求**。",
    "",
    "## 六、专项计划",
    "",
    "包括：",
    "",
    "- 国家专项计划",
    "- 地方专项计划",
    "- 港澳台联合招生",
    "- 台湾学测生（依据台湾地区大学入学考试学科能力测试成绩）",
    "- 澳门保送生",
    "- 香港中学文凭考试学生",
    "",
    "按国家和学校相关政策执行。",
    "",
    "## 七、查询建议",
    "",
    "- **官方**：湘潭大学本科招生网 `https://zs.xtu.edu.cn/`。",
    "- **各省招考机构**：分省分专业计划以省级公布为准。",
    "- **学校教育行政主管部门**：招生章程及相关政策的最终依据。",
    "- 已录取新生想了解入学后学业主线，参见 [培养计划](/library/study/培养计划) 与 [大学概念百科](/library/newcomer/大学概念百科)。",
    "",
    "## 使用小建议",
    "",
    "1. 已收到录取通知书的同学，可以对照本页确认自己所报专业的方向和培养特色。",
    "2. 想冲拔尖班 / 韶峰科创班的同学，入学第一学期就要关注选拔通知（详见 [实验班与拔尖班选拔](/library/study/实验班与拔尖班选拔)）。",
    "3. 具体到 “某省录了多少人 / 分数多少” 请以本省招考机构或高考直通车等公开数据为准。",
    "",
  ].join("\n"),
);
console.log("✓ 26 招生方案 created");

// ─── 8. Rewrite links in newly split club files & new placeholders ──────────
// (they use fresh /library/tools/... refs already; no old prefix present)

// ─── 9. Delete old dirs ─────────────────────────────────────────────────────
const OLD_DIRS = [
  "00-知识库说明",
  "01-新生入学",
  "02-课程学习",
  "03-考试考证",
  "04-学院专业",
  "05-校园生活",
  "06-办事指南",
  "07-资源工具",
];

for (const dir of OLD_DIRS) {
  const full = path.join(DOCS, dir);
  if (fs.existsSync(full)) {
    fs.rmSync(full, { recursive: true, force: true });
    console.log(`✓ Removed old dir: ${dir}`);
  }
}

console.log("\n✔ Phase B migration completed.");
