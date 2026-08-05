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
import { deepMerge } from "./deepMerge";
import { en } from "./en";
import { ja } from "./ja";
import {
  DEFAULT_LOCALE,
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

function persistLocale(next: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* 保存失敗時も UI 上の切替は反映する */
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // SSR／初回描画はフォールバック（en）。マウント後に保存値 or ブラウザ言語へ切替
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      /* LocalStorage 不可でもブラウザ言語判定へ進む */
    }
    const { locale: next, shouldPersist } = resolveInitialLocale(saved);
    setLocaleState(next);
    // 手動設定が無い初回（または不正値）だけ、判定結果を保存する
    if (shouldPersist) {
      persistLocale(next);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
  }, [locale, ready]);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
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
