"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LanguageToggle, useI18n } from "@/i18n";

/**
 * モンスタードライバー
 * 一人称疑似3Dのゲーム本体は public/monster-driver.html。
 * 没入感を優先し、ポータル枠は薄いヘッダーのみ残す。
 */
export default function MonsterDriverPage() {
  const { t } = useI18n();
  const tool = t.tools["monster-driver"];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // キー操作（Space / Q / E）が効くよう iframe にフォーカス
    iframeRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="shrink-0 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          {t.common.backToPortal}
        </Link>
        <span aria-hidden className="h-4 w-px shrink-0 bg-white/15" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-amber-300 sm:text-base">
            {tool?.title ?? "モンスタードライバー"}
          </h1>
          <p className="hidden truncate text-xs text-zinc-500 sm:block">
            {tool?.description}
          </p>
        </div>
        <LanguageToggle />
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        <iframe
          ref={iframeRef}
          title={tool?.title ?? "モンスタードライバー"}
          src="/monster-driver.html"
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
          tabIndex={0}
        />
      </div>
    </div>
  );
}
