"use client";

import { useI18n } from "@/i18n";
import { THEME_META, type CipherTheme } from "./types";

const THEME_ORDER: CipherTheme[] = ["cyber", "fantasy", "spy"];

type Props = {
  value: CipherTheme;
  onChange: (theme: CipherTheme) => void;
};

/** 暗号文の見た目テーマ選択（Cyber / Fantasy / Spy） */
export default function ThemeSelector({ value, onChange }: Props) {
  const { t } = useI18n();
  const themes = t.apps.cryptoMessage.themes;

  return (
    <div className="cm-theme-selector" role="tablist" aria-label={themes.aria}>
      {THEME_ORDER.map((theme) => {
        const meta = THEME_META[theme];
        const active = value === theme;
        return (
          <button
            key={theme}
            type="button"
            role="tab"
            aria-selected={active}
            title={themes[theme].description}
            onClick={() => onChange(theme)}
            className={`cm-theme-btn cm-theme-btn--${theme}${
              active ? " cm-theme-btn--active" : ""
            }`}
          >
            <span aria-hidden className="cm-theme-btn__icon">
              {meta.icon}
            </span>
            <span className="cm-theme-btn__label">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
