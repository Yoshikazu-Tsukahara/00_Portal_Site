"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import LayoutToggle from "@/components/LayoutToggle";
import LocalOnlyBadge from "@/components/LocalOnlyBadge";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLayout } from "@/lib/layout";

/** Stripe Checkout（開発者支援） */
const SUPPORT_URL = "https://buy.stripe.com/bJebIU2u3gi6gQP22bgbm01";

/** fillViewport 用。実測したサイト Header 高さを CSS 変数へ反映する */
const SITE_HEADER_HEIGHT_VAR = "--site-header-height";

/**
 * サイト共通ヘッダー。
 * - タイトル・安心バッジ・ライブラリを1行に並べる（ホームはロゴ兼用）
 * - 表示幅スイッチはヘッダー中央（ビューポート中央）に固定
 */
export default function Header() {
  const { t, locale } = useI18n();
  const { contentClassName } = useLayout();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeight = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty(
        SITE_HEADER_HEIGHT_VAR,
        `${Math.ceil(h)}px`,
      );
    };

    syncHeight();
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    window.addEventListener("resize", syncHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeight);
    };
  }, []);

  const libraryActive =
    pathname === "/library" || Boolean(pathname?.startsWith("/library/"));

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-[color-mix(in_srgb,var(--background)_92%,white)] backdrop-blur-md"
    >
      <div className="relative">
        <div
          className={`flex items-center justify-between gap-x-4 gap-y-2 py-3 ${contentClassName}`}
        >
          {/* 左：タイトル → 安心バッジ → ライブラリ（1行） */}
          <div className="relative z-10 flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            <Link
              href="/"
              className="font-display shrink-0 text-lg font-bold leading-none tracking-tight text-zinc-900 transition-all duration-150 hover:opacity-70 sm:text-xl"
            >
              {t.brand}
            </Link>
            <LocalOnlyBadge className="local-only-badge--beside-title" />

            <nav
              aria-label="Blank Note"
              className="ml-0.5 flex items-center sm:ml-1"
            >
              <Link
                href="/library"
                className={`font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-150 sm:text-xs ${
                  libraryActive
                    ? "text-zinc-900 underline decoration-[var(--accent)] decoration-2 underline-offset-4"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {t.header.libraryNav}
              </Link>
            </nav>
          </div>

          {/* 右：言語・応援（縦中央） */}
          <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageToggle />

            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.header.supportAria}
              title={t.header.supportTitle}
              className="btn-support shrink-0"
            >
              <span className="btn-support__content">
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
                    className="text-zinc-500"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </span>
                <span className="btn-support__label-slot">
                  <span
                    key={`support-${locale}`}
                    className="btn-support__label hidden sm:inline"
                  >
                    {t.header.support}
                  </span>
                  <span
                    key={`support-short-${locale}`}
                    className="btn-support__label sm:hidden"
                  >
                    {t.header.supportShort}
                  </span>
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* 表示幅スイッチ：ヘッダー中央に固定（縦も中央） */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
          <div className="pointer-events-auto">
            <LayoutToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
