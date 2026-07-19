"use client";

import Image from "next/image";
import { useState } from "react";
import { contacts } from "@/lib/site-data";

export function ContactDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="contact-button" type="button" onClick={() => setOpen(true)}>
        加群咨询
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            aria-modal="true"
            className="modal-panel"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">联系方式</span>
                <h2 style={{ marginTop: 10 }}>添加联系方式获取资料</h2>
                <p>
                  资料尚未整理完全，添加下方任一联系方式即可获取更完整的内容。
                  微信新生群需要先添加学长微信后由学长邀请进入，以防不法分子混入。
                </p>
              </div>
              <button aria-label="关闭联系方式弹窗" className="icon-button" type="button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="grid" style={{ marginTop: 18 }}>
              {contacts.map((item) => (
                <article className="info-card contact-card" key={item.label}>
                  {item.type === "qr" && item.image ? (
                    <div className="qr-image">
                      <Image
                        alt={item.imageAlt ?? item.label}
                        height={220}
                        src={item.image}
                        width={220}
                      />
                    </div>
                  ) : null}
                  <h3>{item.label}</h3>
                  <p style={{ color: "var(--text)", fontWeight: 700 }}>{item.value}</p>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
            <p style={{ marginBottom: 0 }}>
              提醒：群聊信息复杂，请留意甄别；添加学长微信后，学长会亲自邀请进入微信新生群。
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
