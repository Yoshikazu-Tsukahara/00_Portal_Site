"use client";

import { useMemo, useState } from "react";
import GenreSection from "@/components/GenreSection";
import { genres, type Tool } from "@/data/tools";
import { useI18n } from "@/i18n";
import { useHomePins } from "@/lib/homePins";
import { useLayout } from "@/lib/layout";

type LibraryFilter = "all" | "unpinned";

/** ライブラリ：ストア形式の全アプリ一覧（ページ全体で1本スクロール） */
export default function LibraryPage() {
  const { t } = useI18n();
  const { contentClassName } = useLayout();
  const { isInstalled, hydrated } = useHomePins();
  const [filter, setFilter] = useState<LibraryFilter>("all");

  const sections = useMemo(() => {
    return genres
      .map((genre) => {
        const tools = genre.tools.filter((tool: Tool) => {
          if (filter === "all") return true;
          // 未追加＝ホームにピン留めされていない（comingSoon も未追加扱い）
          if (tool.comingSoon) return true;
          // hydrate 前は誤表示を避けるため全て見せる
          if (!hydrated) return true;
          return !isInstalled(tool.id);
        });
        return { genre, tools };
      })
      .filter((section) => section.tools.length > 0);
  }, [filter, hydrated, isInstalled]);

  return (
    <main className="relative flex flex-1 flex-col">
      <div className={`${contentClassName} pb-16 pt-4 sm:pt-6`}>
        <div className="mb-2 flex min-w-0 items-center sm:mb-3">
          <div
            className="inline-flex rounded-md border border-zinc-200 bg-zinc-100/80 p-0.5"
            role="tablist"
            aria-label={t.library.filterAria}
          >
            {(
              [
                ["all", t.library.filterAll],
                ["unpinned", t.library.filterUnpinned],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={`rounded-[5px] px-2.5 py-1.5 text-xs font-medium transition-colors active:scale-[0.98] sm:px-3 ${
                  filter === id
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 active:bg-zinc-200/60"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {sections.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            {t.library.filterEmpty}
          </p>
        ) : (
          sections.map(({ genre, tools }, index) => (
            <GenreSection
              key={genre.id}
              genre={genre}
              tools={tools}
              animationDelayMs={60 + index * 50}
            />
          ))
        )}
      </div>
    </main>
  );
}
