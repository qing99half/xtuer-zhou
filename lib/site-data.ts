export type ContactItem = {
  label: string;
  value: string;
  note: string;
  type: "qr" | "group" | "link";
  placeholder: string;
};

export type GuideModule = {
  slug: string;
  title: string;
  summary: string;
  questions: string[];
  highlights: string[];
};

export type LibraryCategory = {
  path: string;
  title: string;
  description: string;
  status: "已审核" | "待整理";
};

export const contacts: ContactItem[] = [
  {
    label: "交流群微信二维码",
    value: "二维码占位",
    note: "后续用于展示新生交流群微信二维码，当前先保留占位。",
    type: "qr",
    placeholder: "微信群二维码待补充",
  },
  {
    label: "联系人微信二维码",
    value: "二维码占位",
    note: "后续用于展示联系人微信二维码，方便咨询和资料补充。",
    type: "qr",
    placeholder: "联系人二维码待补充",
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
    note: "用于补充咨询、投稿和校园信息流转。",
    type: "link",
    placeholder: "入口待补充",
  },
];

export const guideModules: GuideModule[] = [
  {
    slug: "registration",
    title: "报到流程",
    summary: "从录取后准备、到校交通、现场报到到入校第一天，帮新生把关键路径走顺。",
    questions: ["什么时候来校？", "报到要带什么？", "到校后先去哪里？"],
    highlights: ["迎新日程", "材料清单", "到校路线"],
  },
  {
    slug: "dorm-life",
    title: "宿舍生活",
    summary: "围绕住宿、生活用品、校园卡、水电空调、快递等高频问题做统一整理。",
    questions: ["宿舍需要准备什么？", "快递在哪里取？", "水电空调怎么处理？"],
    highlights: ["寝室生活", "快递驿站", "校园一卡通"],
  },
  {
    slug: "military-training",
    title: "军训指南",
    summary: "整理军训安排、物资准备、注意事项和请假经验，降低新生入学焦虑。",
    questions: ["军训要准备什么？", "有哪些注意事项？", "身体不适怎么办？"],
    highlights: ["物资准备", "训练提醒", "请假说明"],
  },
  {
    slug: "study-start",
    title: "学习入门",
    summary: "覆盖教务系统、选课、培养方案、课程表、学分和常用学习平台。",
    questions: ["怎么选课？", "培养方案怎么看？", "图书馆和自习室怎么用？"],
    highlights: ["湘大教务", "选课通识课", "图书馆自习"],
  },
];

export const libraryCategories: LibraryCategory[] = [
  {
    path: "docs/00-知识库说明",
    title: "知识库说明",
    description: "项目定位、资料来源、审核规则与使用方式。",
    status: "已审核",
  },
  {
    path: "docs/01-新生入学",
    title: "新生入学",
    description: "报到流程、宿舍生活、军训指南、学习入门等第一版重点内容。",
    status: "已审核",
  },
  {
    path: "docs/02-课程学习",
    title: "课程学习",
    description: "选课、培养方案、课程考核、图书馆与自习资源。",
    status: "已审核",
  },
  {
    path: "docs/04-学院专业",
    title: "学院专业",
    description: "学校简介、校园文化、院系专业、地图和校园照片资料。",
    status: "已审核",
  },
  {
    path: "docs/05-校园生活",
    title: "校园生活",
    description: "快递、运动、餐饮、出行、医保就医、社团组织等校园生活资料。",
    status: "已审核",
  },
  {
    path: "docs/07-资源工具",
    title: "资源工具",
    description: "信息门户、校园网、VPN、一卡通、线上缴费和故障申报。",
    status: "已审核",
  },
];
