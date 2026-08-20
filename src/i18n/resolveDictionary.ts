import { deepMerge } from "./deepMerge";
import { en } from "./en";
import { ja } from "./ja";
import { partialDictionaries } from "./locales";
import type { Dictionary, Locale } from "./types";

/**
 * サーバー／クライアント共通の辞書解決。
 * ja / en は完全辞書、その他は en に部分辞書をマージ。
 */
export function resolveDictionary(locale: Locale): Dictionary {
  if (locale === "ja") return ja;
  if (locale === "en") return en;
  const partial = partialDictionaries[locale];
  return partial ? deepMerge(en, partial) : en;
}
