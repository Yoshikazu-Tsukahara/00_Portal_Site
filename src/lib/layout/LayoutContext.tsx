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
  LAYOUT_MODE_DATASET_ATTR,
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
  /** localStorage / DOM と同期済みか（トグルのスライド演出抑制用） */
  ready: boolean;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

/** Provider が再マウントされても、直前の選択を useEffect 待ちで失わない */
let memoryLayoutMode: LayoutMode | null = null;

function readLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return DEFAULT_LAYOUT_MODE;
  try {
    const fromDom = document.documentElement.dataset[LAYOUT_MODE_DATASET_ATTR];
    if (isLayoutMode(fromDom)) return fromDom;
    const raw = window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
    if (isLayoutMode(raw)) return raw;
  } catch {
    // private mode など
  }
  return DEFAULT_LAYOUT_MODE;
}

function applyLayoutModeToDom(mode: LayoutMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset[LAYOUT_MODE_DATASET_ATTR] = mode;
}

/**
 * サイト全体の表示幅（default / wide / full）を共有する。
 * 選択値は localStorage と html[data-layout-mode] に保存し、リロード・遷移後も維持する。
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() => {
    if (memoryLayoutMode) return memoryLayoutMode;
    const mode = readLayoutMode();
    memoryLayoutMode = mode;
    return mode;
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mode = readLayoutMode();
    memoryLayoutMode = mode;
    setLayoutModeState(mode);
    applyLayoutModeToDom(mode);
    setReady(true);
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    memoryLayoutMode = mode;
    setLayoutModeState(mode);
    applyLayoutModeToDom(mode);
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
