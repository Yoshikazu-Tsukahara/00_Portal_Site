"use client";

import { ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useI18n } from "./I18nProvider";
import { LOCALE_NATIVE_LABELS } from "./localeMeta";
import type { Locale } from "./types";

type Props = {
  /** 同一ページに複数置くときの id 衝突回避 */
  id?: string;
  /** メニュー内など幅いっぱい用 */
  fullWidth?: boolean;
};

/**
 * 9 言語対応の言語ドロップダウン。
 * ブラウザのネイティブ select でアクセシブルに切替。
 */
export default function LanguageToggle({
  id = "site-lang-select",
  fullWidth = false,
}: Props) {
  const { locale, setLocale, locales, t } = useI18n();

  return (
    <div className={`lang-select${fullWidth ? " lang-select--full" : ""}`}>
      <label className="sr-only" htmlFor={id}>
        {t.header.langToggleAria}
      </label>
      <select
        id={id}
        value={locale}
        aria-label={t.header.langToggleAria}
        onChange={(e) => {
          const next = e.target.value as Locale;
          setLocale(next);
          trackEvent("Language Changed", { locale: next });
        }}
        className="lang-select__control"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {LOCALE_NATIVE_LABELS[code]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="lang-select__chevron"
        aria-hidden
        strokeWidth={2}
      />
    </div>
  );
}
