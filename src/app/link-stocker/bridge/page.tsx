"use client";

import { useEffect, useState } from "react";
import {
  LINK_STOCKER_CHANNEL,
  LINK_STOCKER_WINDOW_NAME,
} from "../types";

/**
 * ブックマークレット用の中継ページ（同一オリジン）。
 * すでにマイツールボックスのタブがあれば BroadcastChannel で渡し、このタブは閉じる。
 * なければこのタブをキープ画面に切り替える。
 */
export default function LinkStockerBridgePage() {
  const [status, setStatus] = useState("キープに送信中…");

  useEffect(() => {
    try {
      window.name = LINK_STOCKER_WINDOW_NAME;
    } catch {
      // ignore
    }

    const search = window.location.search;
    const params = new URLSearchParams(search);

    // URL が取れないときは本体へ
    if (!params.get("url")?.trim()) {
      window.location.replace(`/link-stocker${search}`);
      return undefined;
    }

    let acked = false;
    let channel: BroadcastChannel | null = null;
    let timer: number | undefined;

    try {
      channel = new BroadcastChannel(LINK_STOCKER_CHANNEL);
      channel.onmessage = (ev: MessageEvent<{ type?: string }>) => {
        if (ev.data?.type !== "keep-ack") return;
        acked = true;
        setStatus("既存のタブへ送りました。このタブを閉じます…");
        try {
          channel?.close();
        } catch {
          // ignore
        }
        // スクリプトで開いたウィンドウだけ close できる
        window.setTimeout(() => {
          try {
            window.close();
          } catch {
            // ignore
          }
          // 閉じられない環境では本体へ（タブは残るが重複登録は page 側で抑止）
          window.setTimeout(() => {
            if (!window.closed) {
              window.location.replace(`/link-stocker${search}`);
            }
          }, 250);
        }, 50);
      };

      channel.postMessage({
        type: "keep-request",
        url: params.get("url"),
        title: params.get("ot") || params.get("ogTitle") || undefined,
        image: params.get("oi") || params.get("ogImage") || undefined,
        description:
          params.get("od") || params.get("ogDescription") || undefined,
      });
    } catch {
      // BC 不可 → このタブでキープ
      window.location.replace(`/link-stocker${search}`);
      return;
    }

    // 既存タブからの ack を待つ
    timer = window.setTimeout(() => {
      if (acked) return;
      setStatus("キープ画面を開いています…");
      try {
        channel?.close();
      } catch {
        // ignore
      }
      window.location.replace(`/link-stocker${search}`);
    }, 450);

    return () => {
      if (timer) window.clearTimeout(timer);
      try {
        channel?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 px-6 text-center">
      <p className="text-sm font-medium text-zinc-600">{status}</p>
    </main>
  );
}
