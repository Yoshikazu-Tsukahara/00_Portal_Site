"use client";

import { useI18n } from "./I18nProvider";
import type { Locale } from "./types";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "ja", label: "JA" },
  { value: "en", label: "EN" },
];

/**
 * JA / EN をワンクリックで切り替えるセグメントトグル。
 * 選択ピルがスライドするアニメーション付き。
 */
export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.header.langToggleAria}
      className="lang-toggle rounded-full border border-zinc-200/90 bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm"
    >
      <span
        aria-hidden
        className={`lang-toggle__indicator ${locale === "en" ? "lang-toggle__indicator--en" : ""}`}
      />
      {OPTIONS.map(({ value, label }) => {
        const active = locale === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            aria-pressed={active}
            className={`lang-toggle__btn min-w-[2.25rem] sm:min-w-[2.5rem] ${
              active ? "lang-toggle__btn--active" : "lang-toggle__btn--inactive"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
