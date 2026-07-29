"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import KeepTabBridge from "@/app/link-stocker/KeepTabBridge";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/** 単体 PWA として独立させているアプリのルートパス一覧 */
const STANDALONE_APP_PATHS = [
  "/lunch-savings",
  "/ultimate-probability-slot",
  "/pixel-drop-puzzle",
  "/link-stocker",
  "/palette-collector",
  "/crypto-message",
];

/**
 * ブラウザでもポータル枠を外し、没入型フルスクリーンで出すアプリ。
 * （一人称ミニゲームなど）
 */
const ALWAYS_ISOLATE_PATHS = ["/monster-driver", "/robot-freethrow"];

function matchesAppPath(pathname: string | null, bases: string[]): boolean {
  if (!pathname) return false;
  return bases.some(
    (base) => pathname === base || pathname.startsWith(`${base}/`),
  );
}

/**
 * サイト共通ヘッダー／フッター。
 * 独立 PWA 対応アプリを standalone で起動中、または没入型アプリではポータル枠を非表示。
 * 通常ブラウザでは全ページ共通のヘッダー配置を維持する。
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
      <Header />
      {children}
      <Footer />
    </>
  );
}
