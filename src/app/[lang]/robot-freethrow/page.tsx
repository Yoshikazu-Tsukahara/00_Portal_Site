"use client";

import { useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import DesktopOnlyGate from "@/components/DesktopOnlyGate";
import { useI18n } from "@/i18n";
import { ROBOT_FREETHROW_MIN_STAGE } from "@/lib/minigameStage";
import { useCompactLayout } from "@/lib/useCompactLayout";

/** iframe 内ゲームへ portal からの指示を送る */
function postToGame(
  iframe: HTMLIFrameElement | null,
  payload: Record<string, unknown>,
) {
  const win = iframe?.contentWindow;
  if (!win) return;
  win.postMessage(
    { source: "portal-rft", ...payload },
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
  const { compact } = useCompactLayout();

  useEffect(() => {
    iframeRef.current?.focus();
  }, []);

  // 言語切替を iframe 内 UI（問付箋など）へ反映
  useEffect(() => {
    postToGame(iframeRef.current, { type: "setLocale", locale });
  }, [locale]);

  // スマホ／縦型を iframe へ同期（左右オーバーレイの畳み込み用）
  useEffect(() => {
    postToGame(iframeRef.current, { type: "setCompact", compact });
  }, [compact]);

  function handleIframeLoad() {
    postToGame(iframeRef.current, { type: "setLocale", locale });
    postToGame(iframeRef.current, {
      type: "setCompact",
      compact,
    });
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport
      minStageSize={ROBOT_FREETHROW_MIN_STAGE}
      isPwa
    >
      <DesktopOnlyGate title={copy.shell.title}>
        <div className="relative h-full min-h-0 w-full max-w-full min-w-0 flex-1 overflow-x-hidden overflow-hidden rounded-lg border border-zinc-200 bg-[#f3e6c8]">
          <iframe
            ref={iframeRef}
            title={copy.shell.title}
            src={`/robot-freethrow/game.html?lang=${locale}`}
            className="absolute inset-0 h-full w-full max-w-full border-0"
            allow="fullscreen"
            tabIndex={0}
            onLoad={handleIframeLoad}
          />
        </div>
      </DesktopOnlyGate>
    </AppShell>
  );
}
