"use client";

import { useCallback, useEffect, useState } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/** Chromium 系の beforeinstallprompt イベント型 */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type PwaInstallState = {
  canShow: boolean;
  isStandalone: boolean;
  isIos: boolean;
  canPrompt: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
};

function detectIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return (
    navigator.platform === "MacIntel" &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1
  );
}

/** React マウント前に BIP が来ても取りこぼさないためのモジュールキャッシュ */
let cachedBip: BeforeInstallPromptEvent | null = null;
let bipListenerBound = false;

function ensureBipCapture() {
  if (typeof window === "undefined" || bipListenerBound) return;
  bipListenerBound = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    cachedBip = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event("pwa:bip"));
  });

  window.addEventListener("appinstalled", () => {
    cachedBip = null;
    window.dispatchEvent(new Event("pwa:installed"));
  });
}

ensureBipCapture();

/**
 * PWA インストール可否と beforeinstallprompt の保持。
 * BIP が無くてもボタンは表示し、クリック時にネイティブ prompt か案内モーダルへ分岐する。
 */
export function usePwaInstall(): PwaInstallState {
  const { isStandalone, ready } = useStandaloneDisplay();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    ensureBipCapture();
    setIsIos(detectIos());
    if (cachedBip) setDeferred(cachedBip);

    function onBip() {
      setDeferred(cachedBip);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    window.addEventListener("pwa:bip", onBip);
    window.addEventListener("pwa:installed", onInstalled);

    return () => {
      window.removeEventListener("pwa:bip", onBip);
      window.removeEventListener("pwa:installed", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const event = deferred ?? cachedBip;
    if (!event) return "unavailable" as const;
    try {
      await event.prompt();
      const { outcome } = await event.userChoice;
      cachedBip = null;
      setDeferred(null);
      if (outcome === "accepted") setInstalled(true);
      return outcome;
    } catch {
      return "unavailable" as const;
    }
  }, [deferred]);

  const canShow = ready && !isStandalone && !installed;

  return {
    canShow,
    isStandalone,
    isIos,
    canPrompt: deferred !== null || cachedBip !== null,
    promptInstall,
  };
}
