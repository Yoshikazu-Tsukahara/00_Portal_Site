"use client";

import type { Genre } from "@/data/tools";
import ToolCard from "@/components/ToolCard";
import { useI18n } from "@/i18n";

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

      {/* カード最小幅を固定し、余白が広がったら列数だけ増やす（カード自体は大きくしない） */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:[grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr))]">
        {genre.tools.map((tool) => (
          <ToolCard
            key={tool.comingSoon ? `${genre.id}-coming-soon` : tool.id}
            tool={tool}
            genreId={genre.id}
          />
        ))}
      </div>
    </section>
  );
}
