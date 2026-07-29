"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LanguageToggle, useI18n } from "@/i18n";

/**
 * 手書きノート風 投射フリースロー
 * ゲーム本体は public/robot-freethrow.html（Matter.js 単一 HTML）。
 */
export default function RobotFreethrowPage() {
  const { t } = useI18n();
  const tool = t.tools["robot-freethrow"];
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    iframeRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#d9c9a8]">
      <header className="flex shrink-0 items-center gap-3 border-b border-[#333]/20 px-3 py-2 sm:px-4">
        <Link
          href="/"
          className="shrink-0 text-sm text-[#555] transition-colors hover:text-[#222]"
        >
          {t.common.backToPortal}
        </Link>
        <span aria-hidden className="h-4 w-px shrink-0 bg-[#333]/20" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-[#333] sm:text-base">
            {tool?.title ?? "手書きノート風 投射フリースロー"}
          </h1>
          <p className="hidden truncate text-xs text-[#666] sm:block">
            {tool?.description}
          </p>
        </div>
        <LanguageToggle />
      </header>

      <div className="relative min-h-0 flex-1 bg-[#f3e6c8]">
        <iframe
          ref={iframeRef}
          title={tool?.title ?? "手書きノート風 投射フリースロー"}
          src="/robot-freethrow.html"
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
          tabIndex={0}
        />
      </div>
    </div>
  );
}
