"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * 印刷専用レイヤー。
 * body 直下に置くことで、印刷時に「このレイヤーだけを表示」できる
 * （縮小表示しているプレビューではなく、A4 実寸の同じシートが印刷される）。
 * 画面上は CSS で常に非表示。
 */
export default function PrintLayer({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="inv-print-layer" aria-hidden>
      {children}
    </div>,
    document.body,
  );
}
