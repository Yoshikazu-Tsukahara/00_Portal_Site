"use client";

import { genres } from "@/data/tools";
import GenreSection from "@/components/GenreSection";
import { useI18n } from "@/i18n";

export default function Home() {
  const { t } = useI18n();

  return (
    <main className="relative flex-1 overflow-hidden">
      {/* アンビエント・グラデーション（主張しすぎない奥行き） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.95)_0%,rgba(244,244,245,0.45)_45%,transparent_70%)]" />
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-zinc-200/35 blur-3xl" />
        <div className="absolute -right-16 top-40 h-72 w-72 rounded-full bg-zinc-300/25 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-zinc-100/50" />
      </div>

      {/* ヒーロー：ブランド＋短い説明のみ（幅は共通コンテナに委ねる） */}
      <section className="portal-fade-up pt-16 pb-4 sm:pt-20">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {t.home.heroTitleLine1}
          <br />
          {t.home.heroTitleLine2}
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-500 sm:text-base">
          {t.home.heroLead1}
          <br />
          {t.home.heroLead2}
        </p>
      </section>

      {/* ジャンルごとのツール一覧 */}
      <div className="divide-y divide-zinc-200/60">
        {genres.map((genre, index) => (
          <GenreSection
            key={genre.id}
            genre={genre}
            animationDelayMs={120 + index * 90}
          />
        ))}
      </div>
    </main>
  );
}
