"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import LayoutToggle from "@/components/LayoutToggle";
import LocalOnlyBadge from "@/components/LocalOnlyBadge";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLayout } from "@/lib/layout";

/** Stripe Checkout（開発者支援） */
const SUPPORT_URL = "https://buy.stripe.com/bJebIU2u3gi6gQP22bgbm01";

/** fillViewport 用。実測したサイト Header 高さを CSS 変数へ反映する */
const SITE_HEADER_HEIGHT_VAR = "--site-header-height";

/** 応援（ハート）アイコン */
function SupportHeartIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

type NavKey = "home" | "library";

/** ホーム／ライブラリのスライド・アンダーバー付きナビ */
function HeaderPrimaryNav({
  homeLabel,
  libraryLabel,
  homeActive,
  libraryActive,
  brandClassName,
  libraryClassName,
  gapClassName,
}: {
  homeLabel: ReactNode;
  libraryLabel: ReactNode;
  homeActive: boolean;
  libraryActive: boolean;
  brandClassName: string;
  libraryClassName: string;
  gapClassName: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  const homeRef = useRef<HTMLAnchorElement>(null);
  const libraryRef = useRef<HTMLAnchorElement>(null);
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [animate, setAnimate] = useState(false);
  const activeKey: NavKey | null = homeActive
    ? "home"
    : libraryActive
      ? "library"
      : null;
  const prevKeyRef = useRef<NavKey | null>(null);

  useLayoutEffect(() => {
    const nav = navRef.current;
    const target =
      activeKey === "home"
        ? homeRef.current
        : activeKey === "library"
          ? libraryRef.current
          : null;

    if (!nav || !target || !activeKey) {
      setIndicator(null);
      prevKeyRef.current = activeKey;
      return;
    }

    const measure = () => {
      const navBox = nav.getBoundingClientRect();
      const box = target.getBoundingClientRect();
      setIndicator({
        left: box.left - navBox.left,
        width: box.width,
      });
    };

    measure();

    // 初回表示や別ページからの遷移では動かさず、ホーム⇔ライブラリ間だけスライド
    const prev = prevKeyRef.current;
    if (prev && prev !== activeKey) {
      setAnimate(true);
    } else {
      setAnimate(false);
    }
    prevKeyRef.current = activeKey;

    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    ro.observe(target);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeKey, homeLabel, libraryLabel]);

  return (
    <nav
      ref={navRef}
      aria-label="Blank Note"
      className={`site-header__nav relative flex min-w-0 items-center ${gapClassName}`}
    >
      <Link
        ref={homeRef}
        href="/"
        aria-current={homeActive ? "page" : undefined}
        className={`${brandClassName}${
          homeActive
            ? " site-header__nav-link--active"
            : " site-header__nav-link--idle"
        }`}
      >
        {homeLabel}
      </Link>
      <Link
        ref={libraryRef}
        href="/library"
        aria-current={libraryActive ? "page" : undefined}
        className={`${libraryClassName}${
          libraryActive
            ? " site-header__nav-link--active"
            : " site-header__nav-link--idle"
        }`}
      >
        {libraryLabel}
      </Link>
      {indicator ? (
        <span
          aria-hidden
          className={`site-header__nav-indicator${
            animate ? " site-header__nav-indicator--animate" : ""
          }`}
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
          }}
        />
      ) : null}
    </nav>
  );
}

/**
 * サイト共通ヘッダー。
 * - PC: タイトル・バッジ・ライブラリ・言語・応援・幅トグル（セグメント）
 * - スマホ／縦型: ロゴ・ライブラリ・表示幅DD・言語DD・♡応援
 */
export default function Header() {
  const { t } = useI18n();
  const { contentClassName, layoutMode } = useLayout();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
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
  }, [layoutMode]);

  const homeActive = pathname === "/";
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
        {/* スマホ／縦型：コントロールをヘッダー1行に直置き */}
        <div
          className={`site-header__bar site-header__bar--compact items-center gap-1.5 py-2.5 ${
            isPortrait ? "flex" : "flex lg:hidden"
          } ${contentClassName}`}
        >
          <HeaderPrimaryNav
            homeLabel={t.brand}
            libraryLabel={t.header.libraryNav}
            homeActive={homeActive}
            libraryActive={libraryActive}
            gapClassName="gap-2"
            brandClassName="site-header__brand inline-flex h-7 min-w-0 shrink items-center truncate font-display text-base font-bold leading-none tracking-tight transition-colors"
            libraryClassName="inline-flex h-7 shrink-0 items-center font-display ml-3 text-[10px] font-bold uppercase leading-none tracking-[0.1em] transition-colors sm:ml-4"
          />

          <div className="ml-auto flex shrink-0 items-center gap-1">
            <LayoutToggle variant="dropdown" />
            <LanguageToggle id="site-lang-select-mobile" compact />
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.header.supportAria}
              title={t.header.supportTitle}
              className="btn-support btn-support--icon-only shrink-0"
            >
              <span className="btn-support__content">
                <span className="btn-support__icon" aria-hidden="true">
                  <SupportHeartIcon className="text-zinc-500" />
                </span>
              </span>
            </a>
          </div>
        </div>

        {/* PC（非縦型）：1行ヘッダー */}
        <div
          className={`site-header__bar site-header__bar--desktop relative items-center justify-between gap-x-4 py-3 ${
            isPortrait ? "hidden" : "hidden lg:flex"
          } ${contentClassName}`}
        >
          <div className="relative z-10 flex min-w-0 flex-1 items-center gap-3.5">
            <HeaderPrimaryNav
              homeLabel={t.brand}
              libraryLabel={t.header.libraryNav}
              homeActive={homeActive}
              libraryActive={libraryActive}
              gapClassName="gap-3.5"
              brandClassName="inline-flex h-8 shrink-0 items-center font-display text-xl font-bold leading-none tracking-tight transition-colors"
              libraryClassName="inline-flex h-8 shrink-0 items-center font-display whitespace-nowrap text-xs font-bold uppercase leading-none tracking-[0.12em] transition-colors"
            />
            <LocalOnlyBadge className="local-only-badge--beside-title" />
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
                  <SupportHeartIcon className="text-zinc-500" />
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
