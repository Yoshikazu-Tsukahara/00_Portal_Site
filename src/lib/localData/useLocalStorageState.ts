"use client";

import { useCallback, useEffect, useState } from "react";
import { loadLocalJson, saveLocalJson } from "./storage";

/**
 * LocalStorage 連動の状態フック（オートセーブ）。
 * マウント時に読み込み、更新のたびに即時保存する。
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, (next: T | ((prev: T) => T)) => void, { hydrated: boolean }] {
  const [value, setValueState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValueState(loadLocalJson(key, initialValue));
    setHydrated(true);
    // 初回のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        saveLocalJson(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, setValue, { hydrated }];
}
