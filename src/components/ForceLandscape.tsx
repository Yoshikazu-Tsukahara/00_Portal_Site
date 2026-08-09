"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";

/**
 * 縦向きのとき全面で横画面へ誘導する。
 * PWA / 対応ブラウザでは orientation.lock("landscape") も試す。
 */
export default function ForceLandscape({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [portrait, setPortrait] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    // ScreenOrientation.lock は型定義が環境により欠けているため拡張して扱う
    const orient = window.screen?.orientation as
      | (ScreenOrientation & {
          lock?: (orientation: string) => Promise<void>;
        })
      | undefined;
    if (!orient || typeof orient.lock !== "function") return;
    void orient.lock("landscape").catch(() => {
      // ユーザージェスチャ前や未対応環境では失敗しうる
    });
    return () => {
      try {
        orient.unlock();
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <div className="force-landscape relative flex min-h-0 w-full min-w-0 flex-1 flex-col">
      {children}
      {portrait ? (
        <div
          className="force-landscape-gate"
          role="alert"
          aria-live="assertive"
        >
          <div className="force-landscape-gate__phone" aria-hidden />
          <p className="force-landscape-gate__title">
            {t.common.forceLandscape.title}
          </p>
          <p className="force-landscape-gate__hint">
            {t.common.forceLandscape.hint}
          </p>
        </div>
      ) : null}
    </div>
  );
}
