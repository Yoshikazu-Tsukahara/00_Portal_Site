"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LAYOUT_MODE,
  LAYOUT_MODE_STORAGE_KEY,
  isLayoutMode,
  layoutContentClass,
  type LayoutMode,
} from "./types";

type LayoutContextValue = {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  /**
   * Header 内・Main・Footer 内の「中身」に付けるクラス。
   * 外側の背景はフル幅のままにし、コンテンツ幅だけ揃える。
   */
  contentClassName: string;
  /** localStorage から読み込み済みか（SSR 直後のちらつき対策） */
  ready: boolean;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

/**
 * サイト全体の表示幅（default / wide / full）を共有する。
 * 選択値は localStorage に保存し、リロード後も維持する。
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(
    DEFAULT_LAYOUT_MODE,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
      if (isLayoutMode(raw)) {
        setLayoutModeState(raw);
      }
    } catch {
      // private mode などでは保存できないだけなので無視
    }
    setReady(true);
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayoutModeState(mode);
    try {
      window.localStorage.setItem(LAYOUT_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      layoutMode,
      setLayoutMode,
      contentClassName: layoutContentClass(layoutMode),
      ready,
    }),
    [layoutMode, ready, setLayoutMode],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

/** 表示幅の状態を読む。LayoutProvider の外では使えない */
export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) {
    throw new Error("useLayout は LayoutProvider の内側で使ってください");
  }
  return ctx;
}
