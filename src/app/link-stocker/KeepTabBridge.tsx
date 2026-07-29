"use client";

import { useEffect } from "react";
import { LINK_STOCKER_WINDOW_NAME } from "./types";

/**
 * マイツールボックス全ページで固定ウィンドウ名を付ける。
 * ブックマークレットの window.open(..., name) が、
 * キープ以外のページを開いていても同一タブを再利用できるようにする。
 */
export default function KeepTabBridge() {
  useEffect(() => {
    try {
      window.name = LINK_STOCKER_WINDOW_NAME;
    } catch {
      // ignore
    }
  }, []);

  return null;
}
