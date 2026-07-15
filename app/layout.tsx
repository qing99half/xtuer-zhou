import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ContactDialog } from "@/components/contact-dialog";

export const metadata: Metadata = {
  title: "湘潭大学新生攻略 | xtuer-zhou",
  description: "面向湘潭大学新生的学习文档知识库与入学指南。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="site-shell">
          <header className="navbar">
            <div className="navbar-inner">
              <Link className="brand" href="/">
                <span className="brand-title">湘潭大学新生攻略</span>
                <span className="brand-subtitle">xtuer-zhou 知识库</span>
              </Link>
              <nav aria-label="主导航" className="nav-links">
                <Link className="nav-link" href="/">
                  首页
                </Link>
                <Link className="nav-link" href="/guide">
                  入学指南
                </Link>
                <Link className="nav-link" href="/library">
                  资料库
                </Link>
              </nav>
              <ContactDialog />
            </div>
          </header>
          <main className="site-main">{children}</main>
          <footer className="footer">资料需审核后入库，AI 回答必须引用来源。© xtuer-zhou</footer>
        </div>
      </body>
    </html>
  );
}
