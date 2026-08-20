"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { LOCALES } from "./localeMeta";
import { resolveDictionary } from "./resolveDictionary";
import {
  LOCALE_STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "./types";

type I18nContextValue = {
  locale: Locale;
  /**
   * URL ベース移行後は LanguageToggle が遷移するため、ここでは
   * LocalStorage への好み保存のみ（互換のため残す）。
   */
  setLocale: (locale: Locale) => void;
  locales: readonly Locale[];
  t: Dictionary;
  /** URL の lang が正なので、マウント時点で常に ready */
  ready: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocalePreference(next: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
}

type Props = {
  children: ReactNode;
  /** サーバーで URL `[lang]` から解決した Locale */
  initialLocale: Locale;
};

/**
 * URL の言語を正とする I18n。
 * `initialLocale` が変わると（言語スイッチャーで遷移）辞書も切り替わる。
 */
export function I18nProvider({ children, initialLocale }: Props) {
  useEffect(() => {
    document.documentElement.lang = initialLocale;
    persistLocalePreference(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback((next: Locale) => {
    persistLocalePreference(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: initialLocale,
      setLocale,
      locales: LOCALES,
      t: resolveDictionary(initialLocale),
      ready: true,
    }),
    [initialLocale, setLocale],
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
