"use client";

import { useEffect, useRef } from "react";
import { LanguageToggle, LocaleLink, useI18n } from "@/i18n";

/**
 * モンスタードライバー
 * 一人称疑似3Dのゲーム本体は public/monster-driver.html。
 * 没入感を優先し、ポータル枠は薄いヘッダーのみ残す。
 * （SiteChrome 隔離のため、タイトルタップでポータルへ戻る）
 */
export default function MonsterDriverPage() {
  const { t } = useI18n();
  const tool = t.tools["monster-driver"];
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const title = tool?.title ?? "モンスタードライバー";

  useEffect(() => {
    // キー操作（Space / Q / E）が効くよう iframe にフォーカス
    iframeRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-white/10 px-3 py-2 sm:px-4">
        <div className="min-w-0 flex-1">
          <LocaleLink
            href="/"
            className="block truncate text-sm font-bold text-amber-300 transition-opacity hover:opacity-80 sm:text-base"
            title={t.brand}
          >
            {title}
          </LocaleLink>
          <p className="hidden truncate text-xs text-zinc-500 sm:block">
            {tool?.description}
          </p>
        </div>
        <LanguageToggle />
      </header>

      <div className="relative min-h-0 flex-1 bg-black">
        <iframe
          ref={iframeRef}
          title={title}
          src="/monster-driver.html"
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
          tabIndex={0}
        />
      </div>
    </div>
  );
}
