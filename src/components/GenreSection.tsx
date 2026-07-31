"use client";

import type { Genre, Tool } from "@/data/tools";
import ToolCard from "@/components/ToolCard";
import { useI18n } from "@/i18n";

/** 横スクロール用にカードを2枚ずつペアにする */
function chunkTools(tools: Tool[], size: number): Tool[][] {
  const chunks: Tool[][] = [];
  for (let i = 0; i < tools.length; i += size) {
    chunks.push(tools.slice(i, i + size));
  }
  return chunks;
}

export default function GenreSection({
  genre,
  animationDelayMs = 0,
}: {
  genre: Genre;
  /** セクション全体のフェードイン遅延（ms） */
  animationDelayMs?: number;
}) {
  const { t } = useI18n();
  const copy = t.genres[genre.id] ?? {
    name: genre.label,
    description: "",
  };
  const mobilePages = chunkTools(genre.tools, 2);

  return (
    <section
      id={genre.id}
      className="portal-fade-up py-12 sm:py-14"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="mb-2 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="whitespace-nowrap text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          {copy.name}
        </h2>
        <span className="whitespace-nowrap text-xs font-medium uppercase tracking-widest text-zinc-400">
          {genre.label}
        </span>
      </div>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-zinc-500">
        {copy.description}
      </p>

      {/*
        狭い画面: 2枚ずつ見える横スクロール（カード増でも縦に伸びない）
        ・先頭ページ左余白はジャンル見出しと揃える（内側 flex に padding）
        sm以上: 従来どおり固定幅カードの折り返しグリッド
      */}
      <div
        className="overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin] snap-x snap-mandatory sm:overflow-visible sm:pb-0 sm:snap-none"
        role="region"
        aria-label={copy.name}
      >
        {/* モバイル: ページ単位（各ページ＝2カード）。pl/pr で端の余白を確保 */}
        <div className="flex w-full gap-3 sm:hidden">
          {mobilePages.map((page, pageIndex) => (
            <div
              key={`${genre.id}-page-${pageIndex}`}
              className="grid w-full min-w-full shrink-0 snap-start snap-always grid-cols-2 gap-2.5"
            >
              {page.map((tool) => (
                <ToolCard
                  key={
                    tool.comingSoon
                      ? `${genre.id}-coming-soon-${pageIndex}`
                      : tool.id
                  }
                  tool={tool}
                  genreId={genre.id}
                />
              ))}
            </div>
          ))}
        </div>

        {/* PC: カード幅固定。余白が広がってもカードは伸びず、列数だけ増える */}
        <div className="hidden grid-cols-[repeat(auto-fill,17.5rem)] justify-start gap-5 sm:grid">
          {genre.tools.map((tool) => (
            <ToolCard
              key={tool.comingSoon ? `${genre.id}-coming-soon` : tool.id}
              tool={tool}
              genreId={genre.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
