import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedMarkdownDocumentBySlug, getApprovedMarkdownDocuments } from "@/lib/markdown";

type DocumentPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ highlight?: string }>;
};

type RenderBlock = {
  type: "heading" | "paragraph" | "list" | "ordered-list";
  level?: number;
  text?: string;
  items?: string[];
};

function headingId(text: string) {
  return encodeURIComponent(text.trim());
}

function parseBlocks(content: string): RenderBlock[] {
  const blocks: RenderBlock[] = [];
  const lines = content.split("\n");
  let listItems: string[] = [];
  let orderedItems: string[] = [];

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

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushLists();
      continue;
    }

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

    flushLists();
    blocks.push({ type: "paragraph", text: line });
  }

  flushLists();
  return blocks;
}

function shouldHighlight(text: string, highlight: string) {
  return Boolean(highlight) && (text.includes(highlight) || highlight.includes(text));
}

function renderMarkdown(content: string, highlight: string) {
  return parseBlocks(content).map((block, index) => {
    if (block.type === "heading") {
      const Tag = block.level === 1 ? "h1" : block.level === 2 ? "h2" : "h3";
      return (
        <Tag id={headingId(block.text ?? "")} key={index}>
          {block.text}
        </Tag>
      );
    }

    if (block.type === "list") {
      return (
        <ul className="document-list" key={index}>
          {(block.items ?? []).map((item) => (
            <li className={shouldHighlight(item, highlight) ? "highlight-hit" : undefined} key={item}>
              {item}
            </li>
          ))}
        </ul>
      );
    }

    if (block.type === "ordered-list") {
      return (
        <ol className="document-list" key={index}>
          {(block.items ?? []).map((item) => (
            <li className={shouldHighlight(item, highlight) ? "highlight-hit" : undefined} key={item}>
              {item}
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p className={shouldHighlight(block.text ?? "", highlight) ? "highlight-hit" : undefined} key={index}>
        {block.text}
      </p>
    );
  });
}

export function generateStaticParams() {
  return getApprovedMarkdownDocuments().map((document) => ({
    slug: document.slug.split("/"),
  }));
}

export async function generateMetadata({ params }: DocumentPageProps) {
  const { slug } = await params;
  const document = getApprovedMarkdownDocumentBySlug(slug.join("/"));

  return {
    title: document ? `${document.title} | xtuer-zhou 资料库` : "资料详情 | xtuer-zhou",
  };
}

export default async function DocumentPage({ params, searchParams }: DocumentPageProps) {
  const { slug } = await params;
  const { highlight = "" } = await searchParams;
  const document = getApprovedMarkdownDocumentBySlug(slug.join("/"));

  if (!document) {
    notFound();
  }

  const relatedDocuments = getApprovedMarkdownDocuments()
    .filter((item) => item.category === document.category && item.slug !== document.slug)
    .slice(0, 4);

  return (
    <>
      <section className="section" style={{ marginTop: 0 }}>
        <Link className="secondary-button" href="/library">
          ← 返回资料库
        </Link>
        <div style={{ marginTop: 24 }}>
          <span className="status-pill">{document.status}</span>
          <h1>{document.title}</h1>
          <p>{document.excerpt}</p>
          <div className="tag-list">
            <span className="tag">分类：{document.category}</span>
            <span className="tag">更新：{document.updatedAt}</span>
            <span className="tag">来源：{document.source}</span>
            <span className="tag">{document.indexable ? "允许索引" : "不索引"}</span>
          </div>
        </div>
      </section>

      <article className="document-body">{renderMarkdown(document.content, highlight)}</article>

      {relatedDocuments.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">同类资料</span>
              <h2 style={{ marginTop: 10 }}>继续查看 {document.category}</h2>
            </div>
          </div>
          <div className="grid grid-3">
            {relatedDocuments.map((item) => (
              <article className="library-card" key={item.slug}>
                <span className="status-pill">{item.status}</span>
                <h3 style={{ marginTop: 12 }}>
                  <Link href={`/library/${item.slug}`}>{item.title}</Link>
                </h3>
                <p>{item.excerpt}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
