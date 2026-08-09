"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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
 * - PC: タイトル・バッジ・ライブラリ・言語・応援・幅トグル
 * - スマホ／縦型プレビュー: ロゴ＋メニュー。項目はリストにまとめる
 */
export default function Header() {
  const { t } = useI18n();
  const { contentClassName, layoutMode } = useLayout();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPortrait = layoutMode === "portrait";

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
  }, [layoutMode, menuOpen]);

  // ページ遷移でメニューを閉じる
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (menuButtonRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  const libraryActive =
    pathname === "/library" || Boolean(pathname?.startsWith("/library/"));

  return (
    <header
      ref={headerRef}
      className={`site-header sticky top-0 z-50 w-full border-b border-zinc-200 bg-[color-mix(in_srgb,var(--background)_92%,white)] backdrop-blur-md${
        isPortrait ? " site-header--portrait" : ""
      }`}
    >
      <div className="relative">
        {/* スマホ／縦型：ロゴ＋メニューボタンのみ（PC 通常表示では出さない） */}
        <div
          className={`site-header__bar site-header__bar--compact items-center justify-between gap-3 py-2.5 ${
            isPortrait ? "flex" : "flex lg:hidden"
          } ${contentClassName}`}
        >
          <Link
            href="/"
            className="site-header__brand font-display shrink-0 text-base font-bold leading-none tracking-tight text-zinc-900 transition-opacity hover:opacity-70"
          >
            {t.brand}
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className="site-header__menu-btn"
            aria-expanded={menuOpen}
            aria-controls={menuPanelId}
            aria-label={menuOpen ? t.header.menuClose : t.header.menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="site-header__menu-icon" aria-hidden>
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
          </button>
        </div>

        {menuOpen ? (
          <div
            ref={menuRef}
            id={menuPanelId}
            className={`site-header__menu ${
              isPortrait ? "" : "lg:hidden"
            } ${contentClassName}`}
            role="region"
            aria-label={t.header.menuAria}
          >
            <ul className="site-header__menu-list">
              <li>
                <Link
                  href="/library"
                  className={`site-header__menu-link${
                    libraryActive ? " site-header__menu-link--active" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {t.header.libraryNav}
                </Link>
              </li>
              <li className="site-header__menu-item">
                <span className="site-header__menu-label">
                  {t.header.langToggleAria}
                </span>
                <LanguageToggle id="site-lang-select-mobile" fullWidth />
              </li>
              {isPortrait ? (
                <li className="site-header__menu-item">
                  <span className="site-header__menu-label">
                    {t.header.layoutToggle.aria}
                  </span>
                  <LayoutToggle />
                </li>
              ) : null}
              <li>
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-header__menu-link"
                  aria-label={t.header.supportAria}
                  onClick={() => setMenuOpen(false)}
                >
                  {t.header.support}
                </a>
              </li>
              <li className="site-header__menu-note" role="note">
                <span aria-hidden>🔒</span>
                <span>{t.header.localOnlyBadge}</span>
              </li>
            </ul>
          </div>
        ) : null}

        {/* PC（非縦型）：1行ヘッダー（縦型プレビュー／スマホでは出さない） */}
        <div
          className={`site-header__bar site-header__bar--desktop relative items-center justify-between gap-x-4 py-3 ${
            isPortrait ? "hidden" : "hidden lg:flex"
          } ${contentClassName}`}
        >
          <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3.5">
            <Link
              href="/"
              className="font-display shrink-0 text-xl font-bold leading-none tracking-tight text-zinc-900 transition-opacity hover:opacity-70"
            >
              {t.brand}
            </Link>
            <LocalOnlyBadge className="local-only-badge--beside-title" />
            <nav aria-label="Blank Note" className="ml-1 flex items-center">
              <Link
                href="/library"
                className={`font-display whitespace-nowrap text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                  libraryActive
                    ? "text-zinc-900 underline decoration-[var(--accent)] decoration-2 underline-offset-4"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {t.header.libraryNav}
              </Link>
            </nav>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-3">
            <LanguageToggle id="site-lang-select-desktop" />
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
                  <span className="btn-support__label">{t.header.support}</span>
                </span>
              </span>
            </a>
          </div>

          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
            <div className="pointer-events-auto">
              <LayoutToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
