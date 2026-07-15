"use client";

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
                <h2 style={{ marginTop: 10 }}>加群咨询 / 联系我们</h2>
                <p>第一版使用弹窗集中展示入口，后续素材确认后替换占位内容。</p>
              </div>
              <button aria-label="关闭联系方式弹窗" className="icon-button" type="button" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="grid" style={{ marginTop: 18 }}>
              {contacts.map((item) => (
                <article className="info-card contact-card" key={item.label}>
                  {item.type === "qr" ? <div className="qr-placeholder">{item.placeholder}</div> : null}
                  <h3>{item.label}</h3>
                  <p style={{ color: "var(--text)", fontWeight: 700 }}>{item.value}</p>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
            <p style={{ marginBottom: 0 }}>
              提醒：群聊信息复杂，请以学校官方通知和已审核资料为准，谨防诈骗。
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
