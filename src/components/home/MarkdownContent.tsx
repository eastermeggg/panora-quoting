"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";

/* Minimal Markdown renderer for changelog bodies exported from Notion (.md).
 * Text-first by design; supports the subset we need:
 *   - headings  #, ##, ###   (rendered h3–h5, below the modal's own title)
 *   - paragraphs (blank-line separated)
 *   - unordered lists  - / *
 *   - block images  ![alt](url)
 *   - inline  **bold**, *italic*, [label](url)
 * Anything unrecognized falls through as paragraph text. */

const INLINE = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\))/g;

function renderInline(text: string, key: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined) {
      out.push(
        <strong key={`${key}-b${i}`} className="font-semibold text-panora-text">
          {m[2]}
        </strong>
      );
    } else if (m[3] !== undefined) {
      out.push(<em key={`${key}-i${i}`}>{m[3]}</em>);
    } else if (m[4] !== undefined) {
      out.push(
        <a
          key={`${key}-a${i}`}
          href={m[5]}
          target="_blank"
          rel="noreferrer"
          className="text-panora-green underline underline-offset-2 hover:text-panora-green-dark"
        >
          {m[4]}
        </a>
      );
    }
    last = INLINE.lastIndex;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const HEADING_CLASS: Record<number, string> = {
  1: "pt-1 font-serif text-[17px] leading-6 tracking-[-0.2px] text-panora-text",
  2: "pt-1 text-[14px] font-semibold leading-5 text-panora-text",
  3: "pt-0.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-panora-text-secondary",
};

export function MarkdownContent({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let k = 0;

  const flushPara = () => {
    if (!para.length) return;
    const key = `p${k++}`;
    blocks.push(
      <p key={key} className="text-[13px] leading-[22px] text-panora-text-secondary">
        {renderInline(para.join(" "), key)}
      </p>
    );
    para = [];
  };

  const flushList = () => {
    if (!list.length) return;
    const key = `ul${k++}`;
    const items = list;
    blocks.push(
      <ul key={key} className="flex flex-col gap-1.5">
        {items.map((li, j) => (
          <li
            key={j}
            className="flex gap-2.5 text-[13px] leading-[22px] text-panora-text-secondary"
          >
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-panora-green" />
            <span>{renderInline(li, `${key}-${j}`)}</span>
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }

    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) {
      flushPara();
      flushList();
      blocks.push(
        <img
          key={`img${k++}`}
          src={img[2]}
          alt={img[1]}
          className="w-full rounded-xl border border-panora-border"
        />
      );
      continue;
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara();
      flushList();
      const level = h[1].length;
      blocks.push(
        React.createElement(
          `h${level + 2}`,
          { key: `h${k++}`, className: HEADING_CLASS[level] },
          renderInline(h[2], `h${k}`)
        )
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    para.push(line);
  }
  flushPara();
  flushList();

  return <div className="flex flex-col gap-3.5">{blocks}</div>;
}
