import type { Locale } from "../types";
import type { PartialDictionary } from "../localeMeta";
import { de } from "./de";
import { es } from "./es";
import { fr } from "./fr";
import { ko } from "./ko";
import { pt } from "./pt";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";

/** ja / en 以外の部分辞書（未訳キーは en にフォールバック） */
export const partialDictionaries: Partial<
  Record<Exclude<Locale, "ja" | "en">, PartialDictionary>
> = {
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ko,
  es,
  fr,
  de,
  pt,
};
