"use client";

import { useLayoutEffect, useState } from "react";

/**
 * スマホ／狭い画面の判定（AppShell compact と同じ）。
 * viewport 幅だけで決める（表示幅トグルの縦型は廃止済み）。
 */
export function useCompactLayout(): {
  /** 実機スマホ（〜767） */
  compact: boolean;
  /** viewport 幅が十分広い（1024px〜） */
  wideDesktop: boolean;
  /** 右カラム等を出してよい（広い PC） */
  showSideColumn: boolean;
} {
  const [narrowViewport, setNarrowViewport] = useState(false);
  const [wideDesktop, setWideDesktop] = useState(false);

  // paint 前に同期し、初回フレームの compact 遅延（落下演出の巻き戻し等）を減らす
  useLayoutEffect(() => {
    const narrowMq = window.matchMedia("(max-width: 767px)");
    const wideMq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setNarrowViewport(narrowMq.matches);
      setWideDesktop(wideMq.matches);
    };
    sync();
    narrowMq.addEventListener("change", sync);
    wideMq.addEventListener("change", sync);
    return () => {
      narrowMq.removeEventListener("change", sync);
      wideMq.removeEventListener("change", sync);
    };
  }, []);

  return {
    compact: narrowViewport,
    wideDesktop,
    showSideColumn: wideDesktop,
  };
}
