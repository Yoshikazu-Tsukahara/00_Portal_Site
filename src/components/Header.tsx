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

        {/* 開発者支援ボタン（Stripe投げ銭用・リンクはダミー） */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
        >
          <span className="hidden sm:inline">開発者を応援する</span>
          <span className="sm:hidden">応援する</span>
        </a>
      </div>
    </header>
  );
}
