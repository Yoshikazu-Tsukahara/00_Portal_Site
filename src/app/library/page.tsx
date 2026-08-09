"use client";

import GenreSection from "@/components/GenreSection";
import { genres } from "@/data/tools";
import { useLayout } from "@/lib/layout";

/** ライブラリ：ストア形式の全アプリ一覧（ページ全体で1本スクロール） */
export default function LibraryPage() {
  const { contentClassName } = useLayout();

  return (
    <main className="relative flex flex-1 flex-col">
      <div className={`${contentClassName} pb-16 pt-4 sm:pt-6`}>
        {genres.map((genre, index) => (
          <GenreSection
            key={genre.id}
            genre={genre}
            animationDelayMs={60 + index * 50}
          />
        ))}
      </div>
    </main>
  );
}
