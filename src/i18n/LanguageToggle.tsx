"use client";

import { useI18n } from "./I18nProvider";
import type { Locale } from "./types";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "ja", label: "JA" },
  { value: "en", label: "EN" },
];

/**
 * JA / EN をワンクリックで切り替えるセグメントトグル。
 * zinc 基調のミニマルなピル型 UI。
 */
export default function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.header.langToggleAria}
      className="inline-flex items-center rounded-full border border-zinc-200/90 bg-white/80 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm"
    >
      {OPTIONS.map(({ value, label }) => {
        const active = locale === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLocale(value)}
            aria-pressed={active}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors duration-200 sm:px-3 sm:text-xs ${
              active
                ? "bg-zinc-900 text-zinc-50 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
