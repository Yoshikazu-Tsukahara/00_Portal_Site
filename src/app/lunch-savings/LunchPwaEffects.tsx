"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * ランチ貯金ページ共通:
 * - body にネイティブ操作向けクラスを付与（バウンス抑制）
 * - PWA standalone 時は履歴バックでポータルへ戻るのを抑止
 */
export default function LunchPwaEffects() {
  const { isStandalone } = useStandaloneDisplay();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("lunch-app-active");
    body.classList.add("lunch-app-active");

    return () => {
      html.classList.remove("lunch-app-active");
      body.classList.remove("lunch-app-active");
    };
  }, []);

  useEffect(() => {
    if (!isStandalone) return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("lunch-pwa-standalone");
    body.classList.add("lunch-pwa-standalone");

    const lockHistory = () => {
      window.history.pushState({ lunchPwa: 1 }, "", window.location.href);
    };
    lockHistory();

    function onPopState() {
      lockHistory();
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      html.classList.remove("lunch-pwa-standalone");
      body.classList.remove("lunch-pwa-standalone");
      window.removeEventListener("popstate", onPopState);
    };
  }, [isStandalone]);

  return null;
}
