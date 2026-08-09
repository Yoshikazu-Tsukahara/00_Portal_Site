"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { deepMerge } from "./deepMerge";
import { en } from "./en";
import { ja } from "./ja";
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  isLocale,
  LOCALES,
  resolveInitialLocale,
} from "./localeMeta";
import { partialDictionaries } from "./locales";
import {
  LOCALE_STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "./types";

/** 完全辞書（ja / en）＋部分辞書を en にマージして解決 */
function resolveDictionary(locale: Locale): Dictionary {
  if (locale === "ja") return ja;
  if (locale === "en") return en;
  const partial = partialDictionaries[locale];
  return partial ? deepMerge(en, partial) : en;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** 利用可能な言語一覧 */
  locales: readonly Locale[];
  t: Dictionary;
  /** LocalStorage / ブラウザ判定前は false（チラつき抑制用） */
  ready: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** 同一タブ内の購読者 */
const listeners = new Set<() => void>();

/** ハイドレーション完了前はサーバーと同じ DEFAULT を返す（不一致防止） */
let hasHydrated = false;

function emitLocaleChange() {
  listeners.forEach((l) => l());
}

function subscribeLocale(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === LOCALE_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function readLocaleFromStorage(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && isLocale(saved)) return saved;
    return detectBrowserLocale();
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * クライアント用スナップショット。
 * ハイドレーション中はサーバーと同じ en を返し、完了後だけ LocalStorage / ブラウザ言語を読む。
 */
function getClientLocale(): Locale {
  if (!hasHydrated) return DEFAULT_LOCALE;
  return readLocaleFromStorage();
}

function getServerLocale(): Locale {
  return DEFAULT_LOCALE;
}

function getClientReady(): boolean {
  return hasHydrated;
}

function getServerReady(): boolean {
  return false;
}

function persistLocale(next: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* 保存失敗時も UI 上の切替は反映する */
  }
  emitLocaleChange();
}

function finishHydration() {
  if (hasHydrated) return;
  hasHydrated = true;

  // 未保存ならブラウザ判定結果を保存
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const { locale: next, shouldPersist } = resolveInitialLocale(saved);
    if (shouldPersist) {
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }

  emitLocaleChange();
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getClientLocale,
    getServerLocale,
  );
  const ready = useSyncExternalStore(
    subscribeLocale,
    getClientReady,
    getServerReady,
  );

  // マウント後（＝ハイドレーション後）にだけ実言語へ切替
  useEffect(() => {
    finishHydration();
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    persistLocale(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      locales: LOCALES,
      t: resolveDictionary(locale),
      ready,
    }),
    [locale, setLocale, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** サイト共通の翻訳フック */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n は I18nProvider 内で使用してください");
  }
  return ctx;
}
