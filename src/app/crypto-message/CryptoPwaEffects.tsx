"use client";

import { useEffect } from "react";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";

/**
 * standalone 時の操作ロックとアプリ活性クラス付与。
 */
export default function CryptoPwaEffects() {
  const { isStandalone } = useStandaloneDisplay();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("cm-app-active");
    body.classList.add("cm-app-active");

    return () => {
      html.classList.remove("cm-app-active");
      body.classList.remove("cm-app-active");
    };
  }, []);

  useEffect(() => {
    if (!isStandalone) return;

    const html = document.documentElement;
    const body = document.body;
    html.classList.add("cm-pwa-standalone");
    body.classList.add("cm-pwa-standalone");

    const lockHistory = () => {
      window.history.pushState({ cryptoMessagePwa: 1 }, "", window.location.href);
    };
    lockHistory();

    function onPopState() {
      lockHistory();
    }

    window.addEventListener("popstate", onPopState);
    return () => {
      html.classList.remove("cm-pwa-standalone");
      body.classList.remove("cm-pwa-standalone");
      window.removeEventListener("popstate", onPopState);
    };
  }, [isStandalone]);

  return null;
}
