export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        {/* ロゴ（テキストのみ・アイコンなし） */}
        <a
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 transition-opacity hover:opacity-60"
        >
          My Tool Box
        </a>

        {/* 開発者支援ボタン（Stripe連携前・現在は停止中） */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="開発者を応援する（準備中）"
          title="準備中です"
          className="btn-support"
        >
          <span className="btn-support__icon" aria-hidden="true">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-rose-400/90"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </span>
          <span className="btn-support__label hidden sm:inline">
            開発者を応援する
          </span>
          <span className="btn-support__label sm:hidden">応援する</span>
          <span className="btn-support__badge">準備中</span>
        </button>
      </div>
    </header>
  );
}
