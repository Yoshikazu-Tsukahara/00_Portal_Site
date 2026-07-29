"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LINK_STOCKER_CHANNEL } from "./types";

type KeepRequestMsg = {
  type?: string;
  url?: string;
  title?: string;
  image?: string;
  description?: string;
};

function isKeepAppPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/link-stocker" || pathname.startsWith("/link-stocker/");
}

function isBridgePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/link-stocker/bridge" ||
    pathname.startsWith("/link-stocker/bridge/")
  );
}

function buildKeepQuery(msg: KeepRequestMsg): string {
  const q = new URLSearchParams();
  if (typeof msg.url === "string") q.set("url", msg.url);
  if (typeof msg.title === "string" && msg.title) {
    q.set("ot", msg.title.slice(0, 200));
  }
  if (typeof msg.image === "string" && msg.image) {
    q.set("oi", msg.image);
  }
  if (typeof msg.description === "string" && msg.description) {
    q.set("od", msg.description.slice(0, 400));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * マイツールボックス全タブでキープ依頼を受け取る。
 * ブックマークレットは別オリジンのため BroadcastChannel が届かないので、
 * 同一オリジンの bridge ページ経由でここに届く。
 */
export default function KeepTabBridge() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(LINK_STOCKER_CHANNEL);
      channel.onmessage = (ev: MessageEvent<KeepRequestMsg>) => {
        const msg = ev.data;
        if (msg?.type !== "keep-request" || typeof msg.url !== "string") return;

        const path = pathnameRef.current;
        // bridge 自身は受信側にしない（ack して自分で閉じる側）
        if (isBridgePath(path)) return;

        // 既存タブがあると bridge に伝える（これを見て bridge が閉じる）
        try {
          channel?.postMessage({ type: "keep-ack" });
        } catch {
          // ignore
        }

        // すでにキープ画面なら、page.tsx 側のリスナーが追加する
        if (isKeepAppPath(path) && !isBridgePath(path)) {
          try {
            window.focus();
          } catch {
            // ignore
          }
          return;
        }

        // 背面タブは開いたまま、前面のタブだけ遷移させる
        if (document.visibilityState !== "visible") return;

        const query = buildKeepQuery(msg);
        if (!query) return;
        window.location.assign(`/link-stocker${query}`);
      };
    } catch {
      // BroadcastChannel 非対応
    }

    return () => {
      channel?.close();
    };
  }, []);

  return null;
}
