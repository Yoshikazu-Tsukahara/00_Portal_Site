"use client";

import { useEffect, useRef, useState } from "react";
import ToolGlyph from "@/components/ToolGlyph";
import { getToolCoverSrc, type Tool } from "@/data/tools";

/** プレビュー用の仮想ビューポート（カード枠に合わせて縮小表示） */
const PREVIEW_WIDTH = 1280;
const PREVIEW_HEIGHT = 720;

type Props = {
  tool: Tool;
  className?: string;
};

function previewUrl(href: string): string | null {
  if (!href || href === "#") return null;
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}preview=1`;
}

/**
 * ライブラリ用カバー。
 * 静的画像（public/covers）があればそれを優先し、無ければライブ縮小プレビュー。
 */
export default function AppCover({ tool, className = "" }: Props) {
  const coverSrc = getToolCoverSrc(tool.id);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.22);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const src = previewUrl(tool.href);

  useEffect(() => {
    if (coverSrc) return;
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin: "180px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [coverSrc]);

  useEffect(() => {
    if (coverSrc) return;
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(w / PREVIEW_WIDTH);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [coverSrc]);

  if (coverSrc) {
    return (
      <div
        className={`store-cover store-cover--image ${className}`.trim()}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 静的カバーは public 直参照 */}
        <img
          src={coverSrc}
          alt=""
          className="store-cover h-full w-full object-cover object-top"
          draggable={false}
        />
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={`store-cover store-cover--fallback ${className}`.trim()}
        aria-hidden
      >
        <span className="store-cover__emoji">
          <ToolGlyph tool={tool} />
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`store-cover store-cover--live ${className}`.trim()}
      aria-hidden
    >
      {!loaded ? (
        <div className="store-cover store-cover--fallback absolute inset-0">
          <span className="store-cover__emoji">
            <ToolGlyph tool={tool} />
          </span>
        </div>
      ) : null}

      {visible ? (
        <iframe
          src={src}
          title=""
          tabIndex={-1}
          loading="lazy"
          className="store-cover__frame"
          style={{
            width: PREVIEW_WIDTH,
            height: PREVIEW_HEIGHT,
            transform: `scale(${scale})`,
            opacity: loaded ? 1 : 0,
          }}
          onLoad={() => setLoaded(true)}
        />
      ) : null}
    </div>
  );
}
