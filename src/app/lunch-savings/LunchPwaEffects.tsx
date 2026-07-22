"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * PWA standalone 時のみ:
 * - overscroll 抑制クラスを html/body に付与
 * - 履歴バック（端スワイプ含む）でポータルへ戻るのを抑止
 */
export default function LunchPwaEffects() {
  const { isStandalone } = useStandaloneDisplay();

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
