"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * 隙間落としパズル共通:
 * - body にネイティブ操作向けクラスを付与（バウンス抑制）
 * - PWA standalone 時は履歴バックでポータルへ戻るのを抑止
 * - SiteChrome 側で共通ヘッダー／フッターも完全非表示
 */
export default function PixelDropPwaEffects() {
  const { isStandalone } = useStandaloneDisplay();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("pxd-app-active");
    body.classList.add("pxd-app-active");

    return () => {
      html.classList.remove("pxd-app-active");
      body.classList.remove("pxd-app-active");
    };
  }, []);

  useEffect(() => {
    if (!isStandalone) return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("pxd-pwa-standalone");
    body.classList.add("pxd-pwa-standalone");

    const lockHistory = () => {
      window.history.pushState({ pixelDropPwa: 1 }, "", window.location.href);
    };
    lockHistory();

    function onPopState() {
      lockHistory();
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      html.classList.remove("pxd-pwa-standalone");
      body.classList.remove("pxd-pwa-standalone");
      window.removeEventListener("popstate", onPopState);
    };
  }, [isStandalone]);

  return null;
}
