"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { LAYOUT_MODES, useLayout, type LayoutMode } from "@/lib/layout";

const MODE_INDEX: Record<LayoutMode, number> = {
  default: 0,
  wide: 1,
  full: 2,
};

/**
 * PC（lg 以上）専用の表示幅切替。
 * ヘッダー中央に置く前提。選択ピルがスライドするテキストセグメント。
 */
export default function LayoutToggle() {
  const { t } = useI18n();
  const { layoutMode, setLayoutMode, ready } = useLayout();
  const copy = t.header.layoutToggle;
  /** ユーザー操作後だけインジケータをスライドさせる（復元時は動かさない） */
  const [animate, setAnimate] = useState(false);

  const labels: Record<LayoutMode, string> = {
    default: copy.defaultShort,
    wide: copy.wideShort,
    full: copy.fullShort,
  };

  const titles: Record<LayoutMode, string> = {
    default: copy.default,
    wide: copy.wide,
    full: copy.full,
  };

  return (
    <div
      className={`flex flex-col items-center gap-1 ${ready ? "" : "invisible"}`}
      // 同期前は操作させない（見た目は invisible で領域だけ確保）
      aria-hidden={!ready}
    >
      <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-zinc-400">
        {copy.caption}
      </span>
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
              {labels[mode]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
