"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PageStageProps = {
  /** 用紙の実寸（px） */
  width: number;
  height: number;
  /**
   * null = 領域にフィット、数値 = 絶対倍率（1 = 100%）。
   * 省略時は常にフィット（閲覧画面向け）。
   */
  zoom?: number | null;
  onZoomChange?: (zoom: number | null) => void;
  /** 拡大の上限 */
  maxZoom?: number;
  /** 縮小の下限 */
  minZoom?: number;
  /** 手動ズームを受け付けるか（Ctrl+ホイール） */
  interactiveZoom?: boolean;
  className?: string;
  /**
   * 子。関数なら現在の scale を渡す（react-rnd の scale 補正用）。
   */
  children: ReactNode | ((scale: number) => ReactNode);
};

/**
 * 用紙を表示する台。
 * - zoom === null / 未指定のとき領域に自動フィット
 * - interactiveZoom 時は Ctrl / ⌘ + ホイール、ピンチで拡大縮小
 * - 拡大時はスクロールで上下左右の端までパンできる
 *
 * ※ flex の center だとオーバーフロー時に上／左が切れ、スクロールでも届かない。
 *    内側フレームを「領域と用紙の大きい方」にして grid 中央寄せする。
 */
export default function PageStage({
  width,
  height,
  zoom = null,
  onZoomChange,
  maxZoom = 3,
  minZoom = 0.25,
  interactiveZoom = false,
  className = "",
  children,
}: PageStageProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(zoom);
  const onZoomChangeRef = useRef(onZoomChange);
  zoomRef.current = zoom;
  onZoomChangeRef.current = onZoomChange;
  const [area, setArea] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = areaRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setArea({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const fitScale =
    area.width > 0 && area.height > 0
      ? Math.max(0.1, Math.min(1, area.width / width, area.height / height))
      : 1;

  const scale =
    zoom === null ? fitScale : Math.min(maxZoom, Math.max(minZoom, zoom));

  const scaledW = width * scale;
  const scaledH = height * scale;
  // 小さいときは領域いっぱいで中央、大きいときは用紙サイズ＝スクロール可能範囲
  const frameW = area.width > 0 ? Math.max(area.width, scaledW) : scaledW;
  const frameH = area.height > 0 ? Math.max(area.height, scaledH) : scaledH;

  // ブラウザ全体のズームを止めるため passive: false で購読する
  useEffect(() => {
    const element = areaRef.current;
    if (!element || !interactiveZoom) return;

    function onWheel(event: WheelEvent) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const change = onZoomChangeRef.current;
      if (!change) return;
      const base = zoomRef.current ?? fitScale;
      const direction = event.deltaY > 0 ? -1 : 1;
      const next = Math.min(
        maxZoom,
        Math.max(minZoom, base * (1 + direction * 0.08)),
      );
      change(next);
    }

    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [fitScale, interactiveZoom, maxZoom, minZoom]);

  const content =
    typeof children === "function" ? children(scale) : children;

  return (
    <div
      ref={areaRef}
      className={`min-h-0 min-w-0 flex-1 ${
        interactiveZoom ? "overflow-auto" : "overflow-hidden"
      } ${className}`}
    >
      <div
        className="grid place-items-center"
        style={{ width: frameW, height: frameH }}
      >
        {/* relative がないと absolute 子が画面左上へ飛び出す */}
        <div
          className="relative shrink-0"
          style={{
            width: scaledW,
            height: scaledH,
          }}
        >
          <div
            style={{
              width,
              height,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            className="absolute left-0 top-0"
          >
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
