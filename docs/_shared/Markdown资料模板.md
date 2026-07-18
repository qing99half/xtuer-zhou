---
title: Markdown 资料模板
status: 已审核
source: 项目开发规范
updatedAt: 2026-07-16
indexable: true
primarySection: _shared
sections: [_shared]
phase: []
tags: []
weight: 0
---
# Markdown 资料模板

本模板用于后续整理正式资料库内容。所有正式资料都应先经过用户审核，再从 `docs/99-待整理资料/` 迁移到对应栏目。

## Frontmatter 字段

```yaml
---
title: 资料标题
category: 01-新生入学
status: 已审核
source: 用户确认资料
updatedAt: 2026-07-16
indexable: true
---
```

## 字段说明

- `title`：页面展示标题。
- `category`：资料所属分类，应与 `docs/` 下目录对应。
- `status`：只允许正式展示资料使用 `已审核`；待整理资料不得进入正式资料库页面。
- `source`：资料来源说明。
- `updatedAt`：最近确认或更新日期。
- `indexable`：后续 RAG 是否允许索引。

## 正文要求

1. 标题层级清晰。
2. 段落尽量短小，便于网页阅读和 RAG 切分。
3. 涉及时间、地点、政策、费用、流程等信息时，必须保留可核对来源。
4. 不把未经用户确认的网络资料写入正式资料库。
