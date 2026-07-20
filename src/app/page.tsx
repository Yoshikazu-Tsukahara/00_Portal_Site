import { genres } from "@/data/tools";
import GenreSection from "@/components/GenreSection";

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* アンビエント・グラデーション（主張しすぎない奥行き） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* 上部の柔らかいハイライト */}
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.95)_0%,rgba(244,244,245,0.45)_45%,transparent_70%)]" />
        {/* 左上の微かなグロー */}
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-zinc-200/35 blur-3xl" />
        {/* 右上の微かなグロー */}
        <div className="absolute -right-16 top-40 h-72 w-72 rounded-full bg-zinc-300/25 blur-3xl" />
        {/* 全体のごく薄い縦グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-zinc-100/50" />
      </div>

      {/* ヒーロー：ブランド＋短い説明のみ */}
      <section className="portal-fade-up mx-auto max-w-6xl px-6 pt-16 pb-4 sm:px-8 sm:pt-20">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          日々の作業を、
          <br />
          少しだけ楽にする道具箱。
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-500 sm:text-base">
          個人開発で生まれた便利ツールをまとめたポータルサイトです。
          <br />
          気になるツールを見つけたら、気軽に使ってみてください。
        </p>
      </section>

      {/* ジャンルごとのツール一覧 */}
      <div className="mx-auto max-w-6xl divide-y divide-zinc-200/60 px-6 sm:px-8">
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
