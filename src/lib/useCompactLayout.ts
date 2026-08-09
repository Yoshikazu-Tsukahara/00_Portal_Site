"use client";

import { useLayoutEffect, useState } from "react";
import { useLayout } from "@/lib/layout";

/**
 * スマホ／縦型レイアウト判定（AppShell compact と同じ）。
 * viewport の lg: だけに頼らず、表示幅トグル「縦型」も見る。
 */
export function useCompactLayout(): {
  /** 実機スマホ（〜767）または表示幅「縦型」 */
  compact: boolean;
  /** viewport 幅が十分広い（1024px〜） */
  wideDesktop: boolean;
  /** 右カラム等を出してよい（広いPCかつ縦型でない） */
  showSideColumn: boolean;
} {
  const { layoutMode } = useLayout();
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

  const compact = narrowViewport || layoutMode === "portrait";
  return {
    compact,
    wideDesktop,
    showSideColumn: wideDesktop && !compact,
  };
}
