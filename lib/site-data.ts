export type ContactItem = {
  label: string;
  value: string;
  note: string;
  type: "qr" | "group" | "link";
  placeholder: string;
};

export type Section = {
  slug: string;
  title: string;
  emoji?: string;
  description: string;
  order: number;
};

export type Phase = {
  slug: string;
  title: string;
  when: string;
  intro: string;
  order: number;
};

export const sections: Section[] = [
  {
    slug: "newcomer",
    title: "你好，新同学",
    description: "报到 / 军训 / 迎新的关键路径。",
    order: 1,
  },
  {
    slug: "study",
    title: "学在湘大",
    description: "选课、培养方案、保研、考证等学业主线。",
    order: 2,
  },
  {
    slug: "life",
    title: "校园生活",
    description: "宿舍、快递、餐饮、出行、医保等日常。",
    order: 3,
  },
  {
    slug: "campus",
    title: "湘大印象",
    description: "校史、校园文化、地图、院系介绍。",
    order: 4,
  },
  {
    slug: "tools",
    title: "办事与工具",
    description: "信息门户、VPN、一卡通、缴费与办事流程。",
    order: 5,
  },
  {
    slug: "clubs",
    title: "湘大社团",
    emoji: "🎉",
    description: "学术、公益、体育等 7 类兴趣社团。",
    order: 6,
  },
  {
    slug: "orgs",
    title: "组织与工作",
    description: "班委、学生会、艺术团、社联、研会。",
    order: 7,
  },
  {
    slug: "card",
    title: "校园卡专栏",
    description: "校园卡使用与常见问题。",
    order: 8,
  },
];

export const phases: Phase[] = [
  {
    slug: "pre-arrival",
    title: "暑期录取后",
    when: "报到前 30–60 天",
    intro: "确认专业、办贷款、准备物品。",
    order: 1,
  },
  {
    slug: "arrival",
    title: "报到当天",
    when: "9 月初",
    intro: "到校 · 报到点 · 宿舍 · 一卡通。",
    order: 2,
  },
  {
    slug: "first-week",
    title: "开学第一周",
    when: "报到后 1–7 天",
    intro: "信息门户 / 教务 / 网络 / 快递。",
    order: 3,
  },
  {
    slug: "training",
    title: "军训期",
    when: "开学 3–4 周",
    intro: "军训 · 医保 · 饮食 · 健康。",
    order: 4,
  },
  {
    slug: "first-term",
    title: "军训后学业",
    when: "第一学期",
    intro: "作息 · 选课 · 图书馆 · 班委社团。",
    order: 5,
  },
  {
    slug: "first-year",
    title: "大一持续",
    when: "整个大一",
    intro: "考证 · 转专业 · 保研认知 · 假期出行。",
    order: 6,
  },
];

export function getSectionBySlug(slug: string): Section | undefined {
  return sections.find((section) => section.slug === slug);
}

export function getPhaseBySlug(slug: string): Phase | undefined {
  return phases.find((phase) => phase.slug === slug);
}

export const contacts: ContactItem[] = [
  {
    label: "交流群微信二维码",
    value: "二维码即将补充",
    note: "后续会放在这里，方便新生快速加入交流群。",
    type: "qr",
    placeholder: "微信群二维码即将补充",
  },
  {
    label: "联系人微信二维码",
    value: "二维码即将补充",
    note: "如果指南里暂时没有答案，可以扫码添加学长学姐微信，直接问 / 获取更详细的内容。",
    type: "qr",
    placeholder: "联系人二维码即将补充",
  },
  {
    label: "QQ 新生群",
    value: "1101939293",
    note: "民间自建交流群，群内信息需要自行甄别。",
    type: "group",
    placeholder: "QQ 群号",
  },
  {
    label: "湘大表白墙",
    value: "待补充最终入口",
    note: "用于日常咨询、投稿和校园信息流转。",
    type: "link",
    placeholder: "入口待补充",
  },
];
