"use client";

import { useEffect, type ReactNode } from "react";

/**
 * PDF編集画面のみ、サイトフッタを隠し body をビューポート高に固定する。
 * ページ全体の縦スクロールを発生させない。
 */
export default function ViewportLock({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const footer = body.querySelector(":scope > footer");

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    const prevFooterDisplay =
      footer instanceof HTMLElement ? footer.style.display : "";

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.height = "100dvh";
    if (footer instanceof HTMLElement) {
      footer.style.display = "none";
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
      if (footer instanceof HTMLElement) {
        footer.style.display = prevFooterDisplay;
      }
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}
