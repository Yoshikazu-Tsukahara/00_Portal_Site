"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { LAYOUT_MODES, useLayout, type LayoutMode } from "@/lib/layout";

const MODE_INDEX: Record<LayoutMode, number> = {
  portrait: 0,
  default: 1,
  wide: 2,
  full: 3,
};

/** 縦型（スマホ幅）アイコン */
function PortraitIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      aria-hidden
    >
      <rect
        x="4.5"
        y="1.5"
        width="7"
        height="13"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.35"
      />
      <rect x="6" y="3.5" width="4" height="8" rx="0.75" fill="currentColor" />
    </svg>
  );
}

/** 幅の狭さ〜広さを示すシンプルなアイコン（文字なし） */
function WidthIcon({ mode }: { mode: Exclude<LayoutMode, "portrait"> }) {
  // viewBox 内のコンテンツ枠幅で「標準 / 広め / 全幅」を表現
  const frames: Record<Exclude<LayoutMode, "portrait">, { x: number; w: number }> =
    {
      default: { x: 5, w: 6 },
      wide: { x: 3, w: 10 },
      full: { x: 1.5, w: 13 },
    };
  const { x, w } = frames[mode];

  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      aria-hidden
    >
      <rect
        x="1"
        y="2.5"
        width="14"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        opacity="0.35"
      />
      <rect x={x} y="4.5" width={w} height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

/**
 * PC（lg 以上）専用の表示幅切替。
 * ヘッダー中央に置く前提。アイコンのみのシンプルなセグメント。
 */
export default function LayoutToggle() {
  const { t } = useI18n();
  const { layoutMode, setLayoutMode, ready } = useLayout();
  const copy = t.header.layoutToggle;
  /** ユーザー操作後だけインジケータをスライドさせる（復元時は動かさない） */
  const [animate, setAnimate] = useState(false);

  const titles: Record<LayoutMode, string> = {
    portrait: copy.portrait,
    default: copy.default,
    wide: copy.wide,
    full: copy.full,
  };

  const icons: Record<LayoutMode, ReactNode> = {
    portrait: <PortraitIcon />,
    default: <WidthIcon mode="default" />,
    wide: <WidthIcon mode="wide" />,
    full: <WidthIcon mode="full" />,
  };

  return (
    <div className={ready ? "" : "invisible"} aria-hidden={!ready}>
      <div role="group" aria-label={copy.aria} className="layout-toggle">
        <span
          aria-hidden
          className="layout-toggle__indicator"
          style={{
            transform: `translateX(${MODE_INDEX[layoutMode] * 100}%)`,
            transition: animate && ready ? undefined : "none",
          }}
        />
        {LAYOUT_MODES.map((mode) => {
          const active = layoutMode === mode;
          return (
            <button
              key={mode}
              type="button"
              disabled={!ready}
              onClick={() => {
                setAnimate(true);
                setLayoutMode(mode);
              }}
              aria-pressed={active}
              title={titles[mode]}
              aria-label={titles[mode]}
              className={`layout-toggle__btn ${
                active
                  ? "layout-toggle__btn--active"
                  : "layout-toggle__btn--inactive"
              }`}
            >
              {icons[mode]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
