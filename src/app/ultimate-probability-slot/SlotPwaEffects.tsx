"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * 究極確率スロット共通:
 * - body にネイティブ操作向けクラスを付与（バウンス抑制）
 * - PWA standalone 時は履歴バックでポータルへ戻るのを抑止
 */
export default function SlotPwaEffects() {
  const { isStandalone } = useStandaloneDisplay();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("slot-app-active");
    body.classList.add("slot-app-active");

    return () => {
      html.classList.remove("slot-app-active");
      body.classList.remove("slot-app-active");
    };
  }, []);

  useEffect(() => {
    if (!isStandalone) return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("slot-pwa-standalone");
    body.classList.add("slot-pwa-standalone");

    const lockHistory = () => {
      window.history.pushState({ slotPwa: 1 }, "", window.location.href);
    };
    lockHistory();

    function onPopState() {
      lockHistory();
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      html.classList.remove("slot-pwa-standalone");
      body.classList.remove("slot-pwa-standalone");
      window.removeEventListener("popstate", onPopState);
    };
  }, [isStandalone]);

  return null;
}
