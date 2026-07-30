"use client";

import { useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import InstallAppButton from "./InstallAppButton";

/** iframe 内ゲームへ言語を同期する */
function postLocaleToGame(
  iframe: HTMLIFrameElement | null,
  locale: string,
) {
  const win = iframe?.contentWindow;
  if (!win) return;
  win.postMessage(
    { source: "portal-rft", type: "setLocale", locale },
    window.location.origin,
  );
}

/**
 * 投射フリースロー（Type C）
 * ゲーム本体は public/robot-freethrow/game.html（Matter.js）。
 */
export default function RobotFreethrowPage() {
  const { t, locale } = useI18n();
  const copy = t.apps.robotFreethrow;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    iframeRef.current?.focus();
  }, []);

  // 言語切替を iframe 内 UI（問付箋など）へ反映
  useEffect(() => {
    postLocaleToGame(iframeRef.current, locale);
  }, [locale]);

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport
      isPwa
      afterDataManager={<InstallAppButton copy={copy.install} />}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-[#f3e6c8]">
        <iframe
          ref={iframeRef}
          title={copy.shell.title}
          src={`/robot-freethrow/game.html?lang=${locale}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="fullscreen"
          tabIndex={0}
          onLoad={() => postLocaleToGame(iframeRef.current, locale)}
        />
      </div>
    </AppShell>
  );
}
