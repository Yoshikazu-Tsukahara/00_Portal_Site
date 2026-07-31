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

/**
 * PWA インストール可否と beforeinstallprompt の保持。
 */
export function usePwaInstall(): PwaInstallState {
  const { isStandalone, ready } = useStandaloneDisplay();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setIsIos(detectIos());

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    function onInstalled() {
      setInstalled(true);
      setDeferred(null);
    }

    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return "unavailable" as const;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
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
    canPrompt: deferred !== null,
    promptInstall,
  };
}
