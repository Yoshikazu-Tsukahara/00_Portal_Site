"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import KeepTabBridge from "@/app/link-stocker/KeepTabBridge";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import UsageGuideHost from "@/components/UsageGuideHost";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * Type C-shell / C-install のルート。standalone 起動中だけ Header / Footer を外す。
 * `isPwa` を付けたら必ずここにも足す（RULEBOOK.md）。
 */
const STANDALONE_APP_PATHS = [
  "/lunch-savings",
  "/ultimate-probability-slot",
  "/pixel-drop-puzzle",
  "/link-stocker",
  "/palette-collector",
  "/crypto-message",
  "/robot-freethrow",
  "/tools/mail-template",
  "/tools/pdf-editor",
  "/tools/image-compressor",
];

/**
 * AppShell `fillViewport` を使うルート。
 * Header + Main をちょうど 100dvh にし、Footer はその直下（初期表示では見えない）に置く。
 */
const FILL_VIEWPORT_PATHS = [
  "/", // ホーム：ランチャーを画面いっぱいにし、Footer はスクロール先へ
  // ライブラリはジャンル一覧が長いので通常のページスクロール（二重スクロール防止）
  "/robot-freethrow",
  "/ultimate-probability-slot",
  "/pixel-drop-puzzle",
  "/crypto-message",
  // メールテンプレはページ全体スクロール（内部スクロールなし）
  "/tools/pdf-editor",
  "/tools/image-compressor",
  "/tools/text-cleaner",
  // メディア・メタデータはスマホでページ全体スクロール（項目数で縦に伸びる）
  "/tools/character-relation-editor",
  "/tools/book-visualizer",
  // コマ切り出し: 大画面プレイヤー＋操作を 1 画面に収める
  "/tools/frame-extractor",
];

/**
 * 独立 PWA でもビューポート固定せず、ページ全体が伸びてスクロールするルート。
 * （内部スクロール禁止・コンテンツ縦伸び前提のアプリ）
 */
const PAGE_SCROLL_STANDALONE_PATHS = ["/tools/mail-template"];

/**
 * ミニゲーム（AppShell `minStageSize` 併用）。
 * 最低サイズ未満のときはアプリ内スクロールではなく、
 * Header〜Footer を含むページ全体が伸びてスクロールする。
 */
const MIN_STAGE_PAGE_SCROLL_PATHS = [
  "/robot-freethrow",
  "/ultimate-probability-slot",
  "/pixel-drop-puzzle",
];

/**
 * Type D（没入型）。常にポータル枠なし。AppShell は使わない（RULEBOOK.md）。
 */
const ALWAYS_ISOLATE_PATHS = ["/monster-driver"];

function matchesAppPath(pathname: string | null, bases: string[]): boolean {
  if (!pathname) return false;
  return bases.some((base) => {
    // "/" はホームのみ（全パスにマッチさせない）
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}

/**
 * サイト共通ヘッダー／フッター。
 *
 * - Type B（通常ツール）: Header と Footer を必ず出す。
 * - Type C（独立 PWA）: standalone 起動中のみポータル枠を外す。
 * - Type D（没入型）: 常にポータル枠を外す。
 * - fillViewport ルート: Header+Main を 100dvh に固定し、Footer は画面外すぐ下へ。
 *
 * ブラウザ表示時:
 * - Header / Main / Footer の「舞台」は常に画面いっぱい（背景の境目を出さない）
 * - テキスト列の max-width は AppShell / 各ページ側が contentClassName で揃える
 * - 表示幅スイッチはヘッダー中央に固定
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isStandalone, ready } = useStandaloneDisplay();
  /**
   * ライブラリカード用プレビュー（?preview=1）。
   * useSearchParams は layout に Suspense が必要で、Header のハイドレーションが遅れ
   * I18n の言語切替と交差して mismatch になるため、マウント後にだけ判定する。
   * （SSR / ハイドレーション中は常に false＝サーバー HTML と一致）
   */
  const [isPreview, setIsPreview] = useState(false);
  useEffect(() => {
    try {
      setIsPreview(
        new URLSearchParams(window.location.search).get("preview") === "1",
      );
    } catch {
      setIsPreview(false);
    }
  }, []);
  const isolatePwa =
    ready && isStandalone && matchesAppPath(pathname, STANDALONE_APP_PATHS);
  const isolateFullscreen = matchesAppPath(pathname, ALWAYS_ISOLATE_PATHS);
  const fillViewport = matchesAppPath(pathname, FILL_VIEWPORT_PATHS);
  const minStagePageScroll = matchesAppPath(
    pathname,
    MIN_STAGE_PAGE_SCROLL_PATHS,
  );
  const pageScrollStandalone = matchesAppPath(
    pathname,
    PAGE_SCROLL_STANDALONE_PATHS,
  );

  /** ポータル枠があるときだけ初回ガイドを出す */
  const showUsageGuide = !isPreview && !isolatePwa && !isolateFullscreen;

  let body: ReactNode;

  // プレビュー埋め込み：サイト枠を外し、アプリ本体だけを固定サイズで見せる
  if (isPreview) {
    body = (
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--background)]">
        {children}
      </div>
    );
  } else if (isolatePwa || isolateFullscreen) {
    // ミニゲーム PWA / ページスクロール前提 PWA: 狭いときはページ全体が伸びる
    if (isolatePwa && (minStagePageScroll || pageScrollStandalone)) {
      body = (
        <>
          <KeepTabBridge />
          <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
        </>
      );
    } else {
      body = (
        <>
          <KeepTabBridge />
          <div className="flex h-dvh flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </>
      );
    }
  } else if (fillViewport && minStagePageScroll) {
    // ミニゲーム: 広いときは Header〜画面下端を埋め、狭いときはページ全体＋Footer が下がる
    body = (
      <>
        <KeepTabBridge />
        <div className="flex min-h-dvh flex-col">
          <Header />
          <div
            className="relative flex w-full flex-1 flex-col"
            style={{
              minHeight: "calc(100dvh - var(--site-header-height, 4.5rem))",
            }}
          >
            {children}
          </div>
        </div>
        <Footer />
      </>
    );
  } else if (fillViewport) {
    // fillViewport: ビューポートは Header+Main だけ。Footer は直後に続けて初期表示では隠す
    body = (
      <>
        <KeepTabBridge />
        <div className="flex h-dvh flex-col overflow-hidden">
          <Header />
          <div className="relative flex min-h-0 flex-1 flex-col">
            {children}
          </div>
        </div>
        <Footer />
      </>
    );
  } else {
    body = (
      <>
        <KeepTabBridge />
        <div className="flex min-h-dvh flex-1 flex-col">
          <Header />
          {/* Main 舞台はフル幅。幅制限は各ページ / AppShell 内でかける。
              min-h-0 は高さ固定スクロール用なので付けない（内容に合わせて下へ伸ばす） */}
          <div className="relative flex w-full flex-1 flex-col">{children}</div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      {showUsageGuide ? <UsageGuideHost /> : null}
      {body}
    </>
  );
}
