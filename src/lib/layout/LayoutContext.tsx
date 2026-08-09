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
  /** localStorage / メモリと同期済みか */
  ready: boolean;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

/**
 * モジュールスコープのキャッシュ。
 * Provider がページ遷移で再マウントされても、DEFAULT に戻してチラつかせない。
 */
let memoryLayoutMode: LayoutMode | null = null;

function coerceLayoutMode(value: unknown): LayoutMode {
  return isLayoutMode(value) ? value : DEFAULT_LAYOUT_MODE;
}

function readLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return DEFAULT_LAYOUT_MODE;
  try {
    const fromDom = document.documentElement.dataset[LAYOUT_MODE_DATASET_ATTR];
    if (isLayoutMode(fromDom)) return fromDom;
    const raw = window.localStorage.getItem(LAYOUT_MODE_STORAGE_KEY);
    // 旧「portrait」などは標準幅へ寄せる
    if (raw === "portrait") {
      try {
        window.localStorage.setItem(
          LAYOUT_MODE_STORAGE_KEY,
          DEFAULT_LAYOUT_MODE,
        );
      } catch {
        // ignore
      }
      return DEFAULT_LAYOUT_MODE;
    }
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
 *
 * - 初回 SSR / ハイドレーション: DEFAULT（サーバーと一致）
 * - 一度復元したあとの再マウント: memoryLayoutMode を即使う（ページ遷移のチラつき防止）
 * - コンテンツ幅自体は bootstrap の data-layout-mode + CSS が先に決める
 * - 狭い画面のコンパクト表示は viewport 幅で自動判定（縦型モードは廃止）
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(() =>
    coerceLayoutMode(memoryLayoutMode),
  );
  const [ready, setReady] = useState(
    () => memoryLayoutMode !== null && isLayoutMode(memoryLayoutMode),
  );

  useEffect(() => {
    const mode = coerceLayoutMode(memoryLayoutMode ?? readLayoutMode());
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
