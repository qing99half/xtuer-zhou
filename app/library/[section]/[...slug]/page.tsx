import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cleanExcerpt, formatSource } from "@/lib/display";
import { getApprovedMarkdownDocumentBySlug, getApprovedMarkdownDocuments } from "@/lib/markdown";
import { getRelatedDocuments, getPrevNextInSection } from "@/lib/related";
import { getDocumentHref, getSectionHref } from "@/lib/routes";
import { contacts, getSectionBySlug } from "@/lib/site-data";

type DocumentPageProps = {
  params: Promise<{ section: string; slug: string[] }>;
  searchParams: Promise<{ highlight?: string }>;
};

type RenderBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "table"; header: string[]; rows: string[][] };

function headingId(text: string) {
  return encodeURIComponent(text.trim());
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/(^|[^_])_([^_\n]+)_/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1");
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|`([^`]+)`|~~([^~]+)~~/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      const isExternal = /^https?:/i.test(match[2]);
      nodes.push(
        isExternal ? (
          <a href={match[2]} key={`i-${key++}`} rel="noreferrer noopener" target="_blank">
            {match[1]}
          </a>
        ) : (
          <Link href={match[2]} key={`i-${key++}`}>
            {match[1]}
          </Link>
        ),
      );
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={`i-${key++}`}>{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      nodes.push(<strong key={`i-${key++}`}>{match[4]}</strong>);
    } else if (match[5] !== undefined) {
      nodes.push(
        <code className="inline-code" key={`i-${key++}`}>
          {match[5]}
        </code>,
      );
    } else if (match[6] !== undefined) {
      nodes.push(<del key={`i-${key++}`}>{match[6]}</del>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length > 0 ? nodes : [text];
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableDivider(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function parseBlocks(content: string): RenderBlock[] {
  const blocks: RenderBlock[] = [];
  const lines = content.split("\n");
  let listItems: string[] = [];
  let orderedItems: string[] = [];
  let quoteBuffer: string[] = [];

  function flushLists() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
    if (orderedItems.length > 0) {
      blocks.push({ type: "ordered-list", items: orderedItems });
      orderedItems = [];
    }
  }

  function flushQuote() {
    if (quoteBuffer.length > 0) {
      blocks.push({ type: "quote", text: quoteBuffer.join(" ") });
      quoteBuffer = [];
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      flushQuote();
      continue;
    }

    if (line.startsWith("> ")) {
      flushLists();
      quoteBuffer.push(line.replace(/^>\s+/, ""));
      continue;
    }
    flushQuote();

    if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### ")) {
      flushLists();
      const level = line.startsWith("### ") ? 3 : line.startsWith("## ") ? 2 : 1;
      blocks.push({ type: "heading", level, text: line.replace(/^#{1,3}\s+/, "") });
      continue;
    }

    if (line.startsWith("- ")) {
      orderedItems = [];
      listItems.push(line.replace(/^-\s+/, ""));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      listItems = [];
      orderedItems.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }

    if (line.includes("|") && index + 1 < lines.length && isTableDivider(lines[index + 1].trim())) {
      flushLists();
      const header = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length) {
        const rowLine = lines[index].trim();
        if (!rowLine || !rowLine.includes("|")) break;
        rows.push(splitTableRow(rowLine));
        index += 1;
      }
      index -= 1;
      blocks.push({ type: "table", header, rows });
      continue;
    }

    flushLists();
    blocks.push({ type: "paragraph", text: line });
  }

  flushLists();
  flushQuote();
  return blocks;
}

function shouldHighlight(text: string, highlight: string) {
  if (!highlight) return false;
  const plain = stripInlineMarkdown(text);
  return plain.includes(highlight) || highlight.includes(plain);
}

function renderMarkdown(content: string, highlight: string) {
  return parseBlocks(content).map((block, index) => {
    if (block.type === "heading") {
      const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
      return (
        <Tag id={headingId(stripInlineMarkdown(block.text))} key={index}>
          {renderInline(block.text)}
        </Tag>
      );
    }

    if (block.type === "list") {
      return (
        <ul className="document-list" key={index}>
          {block.items.map((item, itemIndex) => (
            <li
              className={shouldHighlight(item, highlight) ? "highlight-hit" : undefined}
              key={`${index}-${itemIndex}`}
            >
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "ordered-list") {
      return (
        <ol className="document-list" key={index}>
          {block.items.map((item, itemIndex) => (
            <li
              className={shouldHighlight(item, highlight) ? "highlight-hit" : undefined}
              key={`${index}-${itemIndex}`}
            >
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    }

    if (block.type === "quote") {
      return (
        <blockquote className="document-quote" key={index}>
          {renderInline(block.text)}
        </blockquote>
      );
    }

    if (block.type === "table") {
      return (
        <div className="document-table-wrap" key={index}>
          <table className="document-table">
            <thead>
              <tr>
                {block.header.map((cell, cellIndex) => (
                  <th key={cellIndex}>{renderInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <p className={shouldHighlight(block.text, highlight) ? "highlight-hit" : undefined} key={index}>
        {renderInline(block.text)}
      </p>
    );
  });
}

export function generateStaticParams() {
  return getApprovedMarkdownDocuments().map((document) => {
    const parts = document.slug.split("/");
    return {
      section: parts[0],
      slug: parts.slice(1),
    };
  });
}

export async function generateMetadata({ params }: DocumentPageProps) {
  const { section, slug } = await params;
  const document = getApprovedMarkdownDocumentBySlug([section, ...slug].join("/"));

  return {
    title: document ? `${document.title} | xtuer-zhou 资料库` : "资料详情 | xtuer-zhou",
  };
}

export default async function DocumentPage({ params, searchParams }: DocumentPageProps) {
  const { section, slug } = await params;
  const { highlight = "" } = await searchParams;
  const document = getApprovedMarkdownDocumentBySlug([section, ...slug].join("/"));

  if (!document) {
    notFound();
  }

  const sectionMeta = getSectionBySlug(document.primarySection);
  const related = getRelatedDocuments(document, 6);
  const { prev, next } = getPrevNextInSection(document);

  return (
    <>
      <nav aria-label="面包屑" className="breadcrumb">
        <Link href="/">首页</Link>
        <span aria-hidden="true"> › </span>
        <Link href="/library">资料库</Link>
        {sectionMeta ? (
          <>
            <span aria-hidden="true"> › </span>
            <Link href={getSectionHref(sectionMeta.slug)}>{sectionMeta.title}</Link>
          </>
        ) : null}
        <span aria-hidden="true"> › </span>
        <span aria-current="page">{document.title}</span>
      </nav>

      <section className="section document-hero" id="top" style={{ marginTop: 0 }}>
        <div className="document-hero-content">
          <span className="eyebrow">{sectionMeta ? sectionMeta.title : document.primarySection}</span>
          <h1>{document.title}</h1>
          <p>{cleanExcerpt(document.excerpt)}</p>
          <div className="tag-list">
            <span className="tag">更新于：{document.updatedAt}</span>
            <span className="tag">整理自：{formatSource(document.source)}</span>
            {document.tags.slice(0, 4).map((tag) => (
              <span className="tag" key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <article className="document-body">{renderMarkdown(document.content, highlight)}</article>

      {document.completeness === "partial" ? (
        <section className="section supplement-section">
          <div className="supplement-card">
            <span className="eyebrow">资料获取</span>
            <h2 style={{ marginTop: 10 }}>资料尚未整理完全，添加下方联系方式即可获取</h2>
            <p>
              {document.completenessNote ||
                "本页只覆盖了部分要点。想要更完整的资料，直接添加下方任一联系方式即可获取。"}
            </p>
            <p className="muted">
              提醒：微信新生群需先添加学长微信后由学长邀请进入，以防不法分子混入。
            </p>
            <div className="supplement-paths">
              {contacts
                .filter((contact) => contact.type === "qr")
                .map((contact) => (
                  <div className="supplement-path" key={contact.label}>
                    {contact.image ? (
                      <div className="qr-image">
                        <Image
                          alt={contact.imageAlt ?? contact.label}
                          height={160}
                          src={contact.image}
                          width={160}
                        />
                      </div>
                    ) : null}
                    <strong>{contact.label}</strong>
                    <p>{contact.note}</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">你可能还想看</span>
              <h2 style={{ marginTop: 10 }}>相关资料</h2>
            </div>
          </div>
          <div className="grid grid-3">
            {related.map((item) => {
              const reasonLabel =
                item.reason === "same-section"
                  ? "同主题"
                  : item.reason === "shared-tag"
                    ? "共同标签"
                    : item.reason === "back-link"
                      ? "被本页引用"
                      : "跨主题相关";
              const targetSection = getSectionBySlug(item.primarySection);
              return (
                <article className="library-card clickable-card" key={item.slug}>
                  <Link
                    aria-label={`查看${item.title}`}
                    className="card-overlay-link"
                    href={getDocumentHref(item.slug)}
                  />
                  <span className="status-pill">{targetSection ? targetSection.title : item.primarySection}</span>
                  <span className="tag" style={{ marginTop: 8 }}>{reasonLabel}</span>
                  <h3 style={{ marginTop: 12 }}>
                    <Link href={getDocumentHref(item.slug)}>{item.title}</Link>
                  </h3>
                  <p>{cleanExcerpt(item.excerpt)}</p>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {prev || next ? (
        <nav aria-label="上一篇 / 下一篇" className="prev-next-nav">
          {prev ? (
            <Link className="prev-next-card" href={getDocumentHref(prev.slug)}>
              <span className="eyebrow">← 上一篇</span>
              <strong>{prev.title}</strong>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
          {next ? (
            <Link className="prev-next-card next" href={getDocumentHref(next.slug)}>
              <span className="eyebrow">下一篇 →</span>
              <strong>{next.title}</strong>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
