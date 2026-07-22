"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

function isLunchSavingsPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/lunch-savings" || pathname.startsWith("/lunch-savings/");
}

/**
 * サイト共通ヘッダー／フッター。
 * ランチ貯金を PWA standalone で起動中のみポータル枠を完全非表示。
 * 通常ブラウザでは全ページ共通のヘッダー配置を維持する。
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isStandalone, ready } = useStandaloneDisplay();
  const isolatePwa =
    ready && isStandalone && isLunchSavingsPath(pathname);

  if (isolatePwa) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col">{children}</div>
    );
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
