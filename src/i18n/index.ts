export { I18nProvider, useI18n } from "./I18nProvider";
export { default as LanguageToggle } from "./LanguageToggle";
export { default as LocaleLink } from "./LocaleLink";
export { useLocalizedHref } from "./useLocalizedHref";
export { resolveDictionary } from "./resolveDictionary";
export { fmt } from "./fmt";
export type { Dictionary, Locale } from "./types";
export { LOCALE_STORAGE_KEY } from "./types";
export {
  DEFAULT_LOCALE,
  INTL_BY_LOCALE,
  detectBrowserLocale,
  isLocale,
  LOCALES,
  LOCALE_NATIVE_LABELS,
  LOCALE_SHORT_LABELS,
  intlLocale,
  matchNavigatorLanguage,
  resolveInitialLocale,
} from "./localeMeta";
export type { DeepPartial, PartialDictionary } from "./localeMeta";
export {
  fromUrlLocale,
  getLocaleFromPathname,
  isUrlLocale,
  localizedHref,
  LOCALE_TO_URL,
  matchAcceptLanguageHeader,
  stripLocalePrefix,
  switchLocalePath,
  toHrefLang,
  toUrlLocale,
  URL_LOCALES,
  URL_TO_LOCALE,
} from "./localePath";
export type { UrlLocale } from "./localePath";
