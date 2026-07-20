"use client";

import type { PdfPageItem } from "./types";
import { CARD_HEIGHT, CARD_WIDTH } from "./PageFilmstrip";

function PageThumb({
  page,
  className,
}: {
  page: PdfPageItem;
  className?: string;
}) {
  if (page.kind === "blank") {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-zinc-50 text-[11px] text-zinc-400 ${className ?? ""}`}
      >
        白紙
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={page.thumbnailUrl}
      alt=""
      className={`h-full w-full object-contain bg-zinc-50 ${className ?? ""}`}
      style={{ transform: `rotate(${page.rotation}deg)` }}
      draggable={false}
    />
  );
}

/** 単一 / 複数スタックのページ DragOverlay */
export default function PageDragOverlay({
  page,
  count,
}: {
  page: PdfPageItem;
  count: number;
}) {
  const isStack = count > 1;

  if (!isStack) {
    return (
      <div
        className="overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-lg"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <PageThumb page={page} />
      </div>
    );
  }

  // 後ろに見せる枚数（最大2層）
  const backLayers = Math.min(count - 1, 2);

  return (
    <div
      className="relative"
      style={{
        width: CARD_WIDTH + 14,
        height: CARD_HEIGHT + 14,
      }}
      aria-label={`${count} ページを移動中`}
    >
      {/* 背面スタック（奥 → 手前） */}
      {backLayers >= 2 ? (
        <div
          aria-hidden
          className="absolute left-2 top-1 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: "rotate(7deg) translate(4px, 2px)",
          }}
        >
          <div className="h-full w-full bg-zinc-100" />
        </div>
      ) : null}
      {backLayers >= 1 ? (
        <div
          aria-hidden
          className="absolute left-1 top-0.5 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-md"
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: "rotate(-4deg) translate(2px, 1px)",
          }}
        >
          <div className="h-full w-full bg-zinc-50" />
        </div>
      ) : null}

      {/* 前面：掴んでいるカード */}
      <div
        className="relative z-10 overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-xl"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <PageThumb page={page} />
        <span className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 px-1.5 text-[11px] font-semibold tabular-nums text-white shadow-sm ring-2 ring-white">
          {count}
        </span>
      </div>
    </div>
  );
}
