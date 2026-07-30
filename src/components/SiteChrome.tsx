"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import KeepTabBridge from "@/app/link-stocker/KeepTabBridge";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * Type C（独立 PWA）のルートパス一覧。
 * ここに載っているアプリは「standalone 起動中だけ」Header / Footer を外す。
 * ブラウザで開いている間は Type B と同じくポータル枠のまま。
 * （page.tsx 側は `<AppShell isPwa>`、layout.tsx 側は `<PwaRuntime />` を使う）
 */
const STANDALONE_APP_PATHS = [
  "/lunch-savings",
  "/ultimate-probability-slot",
  "/pixel-drop-puzzle",
  "/link-stocker",
  "/palette-collector",
  "/crypto-message",
  "/robot-freethrow",
];

/**
 * Type D（没入型）のルートパス一覧。
 * ブラウザでも常にポータル枠を外し、フルスクリーンで出す（一人称ミニゲームなど）。
 * AppShell は使わず、各ページが独自ヘッダー + iframe を持つ。
 */
const ALWAYS_ISOLATE_PATHS = ["/monster-driver"];

function matchesAppPath(pathname: string | null, bases: string[]): boolean {
  if (!pathname) return false;
  return bases.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

/**
 * サイト共通ヘッダー／フッター。
 *
 * - Type B（通常ツール）: Header と Footer を必ず出す。
 * - Type C（独立 PWA）: standalone 起動中のみポータル枠を外す。
 * - Type D（没入型）: 常にポータル枠を外す。
 *
 * ブラウザ表示時:
 * - Header / Main / Footer の「舞台」は常に画面いっぱい（背景の境目を出さない）
 * - テキスト列の max-width は AppShell / 各ページ側が contentClassName で揃える
 * - 表示幅スイッチはヘッダー中央に固定
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isStandalone, ready } = useStandaloneDisplay();
  const isolatePwa =
    ready && isStandalone && matchesAppPath(pathname, STANDALONE_APP_PATHS);
  const isolateFullscreen = matchesAppPath(pathname, ALWAYS_ISOLATE_PATHS);

  if (isolatePwa || isolateFullscreen) {
    return (
      <>
        <KeepTabBridge />
        <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
      </>
    );
  }

  return (
    <>
      <KeepTabBridge />
      <div className="flex min-h-dvh flex-1 flex-col">
        <Header />
        {/* Main 舞台はフル幅。幅制限は各ページ / AppShell 内でかける */}
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    </>
  );
}
