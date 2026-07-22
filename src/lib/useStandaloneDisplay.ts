"use client";

import { useEffect, useState } from "react";

/** PWA（standalone / iOS ホーム画面）として表示中か */
export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMq = window.matchMedia("(display-mode: standalone)").matches;
  const minimalUi = window.matchMedia("(display-mode: minimal-ui)").matches;
  const fullscreen = window.matchMedia("(display-mode: fullscreen)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const twa = document.referrer.startsWith("android-app://");

  return standaloneMq || minimalUi || fullscreen || iosStandalone || twa;
}

/**
 * 現在の表示が PWA standalone か（ブラウザタブか）を返すフック。
 * SSR 直後は false → マウント後に実測値へ更新。
 */
export function useStandaloneDisplay(): {
  isStandalone: boolean;
  ready: boolean;
} {
  const [isStandalone, setIsStandalone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      setIsStandalone(isStandaloneDisplay());
      setReady(true);
    }

    sync();

    const mqs = [
      window.matchMedia("(display-mode: standalone)"),
      window.matchMedia("(display-mode: minimal-ui)"),
      window.matchMedia("(display-mode: fullscreen)"),
    ];

    mqs.forEach((mq) => mq.addEventListener?.("change", sync));
    window.addEventListener("appinstalled", sync);

    return () => {
      mqs.forEach((mq) => mq.removeEventListener?.("change", sync));
      window.removeEventListener("appinstalled", sync);
    };
  }, []);

  return { isStandalone, ready };
}
