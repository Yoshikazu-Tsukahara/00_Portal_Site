"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import StoreAppCard from "@/components/StoreAppCard";
import type { Genre, Tool } from "@/data/tools";
import { useI18n } from "@/i18n";

/** レール1枚分の幅（カード幅 + gap）と、画面に収まる枚数 */
function getRailPageMetrics(el: HTMLDivElement): {
  stride: number;
  pageCount: number;
} {
  const item = el.querySelector<HTMLElement>(".store-rail__item");
  if (!item) {
    return { stride: el.clientWidth, pageCount: 1 };
  }
  const styles = getComputedStyle(el);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const itemWidth = item.getBoundingClientRect().width;
  const stride = itemWidth + gap;
  if (stride <= 0) {
    return { stride: el.clientWidth, pageCount: 1 };
  }
  // 完全に見える枚数（見切れは「次がある」合図。最低1）
  const pageCount = Math.max(
    1,
    Math.floor((el.clientWidth + gap) / stride),
  );
  return { stride, pageCount };
}

export default function GenreSection({
  genre,
  tools: toolsProp,
  animationDelayMs = 0,
}: {
  genre: Genre;
  /** 省略時は genre.tools（フィルター適用時に上書き） */
  tools?: Tool[];
  /** セクション全体のフェードイン遅延（ms） */
  animationDelayMs?: number;
}) {
  const { t } = useI18n();
  const tools = toolsProp ?? genre.tools;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const headingId = `genre-heading-${genre.id}`;
  const copy = t.genres[genre.id] ?? {
    name: genre.label,
    description: "",
  };

  const syncScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(max > 4 && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncScrollState();
    el.addEventListener("scroll", syncScrollState, { passive: true });
    const ro = new ResizeObserver(syncScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", syncScrollState);
      ro.disconnect();
    };
  }, [syncScrollState, tools.length]);

  /** 矢印／キー：画面に収まる枚数ぶん（例: 3枚 or 4枚）まとめて送る */
  const scrollByPage = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const { stride, pageCount } = getRailPageMetrics(el);
    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    // いま先頭に近いカードのインデックスから、1ページ分進む／戻る
    const currentIndex = Math.round(el.scrollLeft / stride);
    const nextIndex = Math.max(0, currentIndex + dir * pageCount);
    const nextLeft = Math.min(maxLeft, nextIndex * stride);
    el.scrollTo({ left: nextLeft, behavior: "smooth" });
  };

  const onRailKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByPage(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByPage(1);
    } else if (e.key === "Home") {
      e.preventDefault();
      scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } else if (e.key === "End") {
      e.preventDefault();
      const el = scrollerRef.current;
      if (el) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    }
  };

  return (
    <section
      id={genre.id}
      className="portal-fade-up py-9 sm:py-12"
      style={{ animationDelay: `${animationDelayMs}ms` }}
      aria-labelledby={headingId}
    >
      <div className="mb-1 flex min-w-0 items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h2 id={headingId} className="store-section-title">
              {copy.name}
            </h2>
            <span className="text-[12px] font-medium tracking-wide text-zinc-400">
              {genre.label}
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
            {copy.description}
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <button
            type="button"
            className="store-scroll-btn"
            aria-label={t.library.scrollPrev}
            aria-controls={`genre-rail-${genre.id}`}
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="button"
            className="store-scroll-btn"
            aria-label={t.library.scrollNext}
            aria-controls={`genre-rail-${genre.id}`}
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight className="size-4" strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div
        id={`genre-rail-${genre.id}`}
        ref={scrollerRef}
        className="store-rail"
        role="region"
        aria-labelledby={headingId}
        tabIndex={0}
        onKeyDown={onRailKeyDown}
      >
        {tools.map((tool, index) => (
          <div
            key={
              tool.comingSoon ? `${genre.id}-coming-soon-${index}` : tool.id
            }
            className="store-rail__item"
          >
            <StoreAppCard tool={tool} genreId={genre.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
