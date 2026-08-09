"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "@/i18n";
import { LAYOUT_MODES, useLayout, type LayoutMode } from "@/lib/layout";

const MODE_INDEX: Record<LayoutMode, number> = {
  default: 0,
  wide: 1,
  full: 2,
};

/** 幅の狭さ〜広さを示すシンプルなアイコン（文字なし） */
function WidthIcon({
  mode,
  className = "size-3.5",
}: {
  mode: LayoutMode;
  className?: string;
}) {
  const frames: Record<LayoutMode, { x: number; w: number }> = {
    default: { x: 5, w: 6 },
    wide: { x: 3, w: 10 },
    full: { x: 1.5, w: 13 },
  };
  const { x, w } = frames[mode];

  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
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

function modeIcon(mode: LayoutMode, className?: string): ReactNode {
  return <WidthIcon mode={mode} className={className} />;
}

type LayoutToggleProps = {
  /** segment: PC 向け3連ボタン / dropdown: スマホ向けコンパクト */
  variant?: "segment" | "dropdown";
};

/**
 * 表示幅切替。
 * - segment: PC ヘッダー中央
 * - dropdown: スマホヘッダー直置き
 */
export default function LayoutToggle({
  variant = "segment",
}: LayoutToggleProps) {
  const { t } = useI18n();
  const { layoutMode, setLayoutMode, ready } = useLayout();
  const copy = t.header.layoutToggle;
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const titles: Record<LayoutMode, string> = {
    default: copy.default,
    wide: copy.wide,
    full: copy.full,
  };

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (variant === "dropdown") {
    return (
      <div
        ref={rootRef}
        className={`layout-toggle-dd ${ready ? "" : "invisible"}`}
        aria-hidden={!ready}
      >
        <button
          type="button"
          disabled={!ready}
          className="layout-toggle-dd__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`${copy.aria}: ${titles[layoutMode]}`}
          title={titles[layoutMode]}
          onClick={() => setOpen((v) => !v)}
        >
          {modeIcon(layoutMode, "size-3.5")}
        </button>
        {open ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={copy.aria}
            className="layout-toggle-dd__menu"
          >
            {LAYOUT_MODES.map((mode) => {
              const active = layoutMode === mode;
              return (
                <li key={mode} role="option" aria-selected={active}>
                  <button
                    type="button"
                    className={`layout-toggle-dd__option${
                      active ? " layout-toggle-dd__option--active" : ""
                    }`}
                    aria-label={titles[mode]}
                    title={titles[mode]}
                    onClick={() => {
                      setLayoutMode(mode);
                      setOpen(false);
                    }}
                  >
                    {modeIcon(mode, "size-3.5")}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  }

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
              {modeIcon(mode)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
