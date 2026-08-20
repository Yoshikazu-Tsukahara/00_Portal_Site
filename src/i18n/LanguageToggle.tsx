"use client";

import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { useI18n } from "./I18nProvider";
import { LOCALE_NATIVE_LABELS, LOCALE_SHORT_LABELS } from "./localeMeta";
import { switchLocalePath } from "./localePath";
import type { Locale } from "./types";

type Props = {
  /** 同一ページに複数置くときの id 衝突回避 */
  id?: string;
  /** メニュー内など幅いっぱい用 */
  fullWidth?: boolean;
  /** jp / en など短縮ラベル（スマホヘッダー向け） */
  compact?: boolean;
};

/**
 * 対応言語のドロップダウン。
 * 選択すると `/[lang]/...` へ画面遷移する（LocalStorage 単独切替はしない）。
 */
export default function LanguageToggle({
  id = "site-lang-select",
  fullWidth = false,
  compact = false,
}: Props) {
  const { locale, setLocale, locales, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={`lang-select${fullWidth ? " lang-select--full" : ""}${
        compact ? " lang-select--compact" : ""
      }`}
    >
      <label className="sr-only" htmlFor={id}>
        {t.header.langToggleAria}
      </label>
      <select
        id={id}
        value={locale}
        aria-label={t.header.langToggleAria}
        title={LOCALE_NATIVE_LABELS[locale]}
        onChange={(e) => {
          const next = e.target.value as Locale;
          if (next === locale) return;
          setLocale(next);
          trackEvent("Language Changed", { locale: next });
          router.push(switchLocalePath(next, pathname));
        }}
        className="lang-select__control"
      >
        {locales.map((code) => (
          <option key={code} value={code} title={LOCALE_NATIVE_LABELS[code]}>
            {compact ? LOCALE_SHORT_LABELS[code] : LOCALE_NATIVE_LABELS[code]}
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
