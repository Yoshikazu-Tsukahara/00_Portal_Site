import type { AppsDictionary } from "../../apps";
import { appsDe } from "./de";
import { appsEs } from "./es";
import { appsFr } from "./fr";
import { appsKo } from "./ko";
import { appsPt } from "./pt";
import { appsZhCN } from "./zh-CN";
import { appsZhTW } from "./zh-TW";

/** ja / en 以外のアプリ内 UI 完全辞書 */
export const appsByLocale = {
  "zh-CN": appsZhCN,
  "zh-TW": appsZhTW,
  ko: appsKo,
  es: appsEs,
  fr: appsFr,
  de: appsDe,
  pt: appsPt,
} as const satisfies Record<
  "zh-CN" | "zh-TW" | "ko" | "es" | "fr" | "de" | "pt",
  AppsDictionary
>;

export {
  appsDe,
  appsEs,
  appsFr,
  appsKo,
  appsPt,
  appsZhCN,
  appsZhTW,
};
