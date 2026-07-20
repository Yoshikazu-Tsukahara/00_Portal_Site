"use client";

import { LanguageToggle, useI18n } from "@/i18n";

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4 sm:px-8">
        {/* ロゴ（テキストのみ・アイコンなし） */}
        <a
          href="/"
          className="shrink-0 text-base font-semibold tracking-tight text-zinc-900 transition-opacity hover:opacity-60"
        >
          {t.brand}
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {/* 開発者支援ボタン（Stripe連携前・現在は停止中） */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label={t.header.supportAria}
            title={t.header.supportTitle}
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
              {t.header.support}
            </span>
            <span className="btn-support__label sm:hidden">
              {t.header.supportShort}
            </span>
            <span className="btn-support__badge">{t.header.preparing}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
