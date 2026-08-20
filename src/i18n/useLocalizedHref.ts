"use client";

import { useCallback } from "react";
import { useI18n } from "./I18nProvider";
import { localizedHref } from "./localePath";

/** 言語無しパス → 現在言語付きパス */
export function useLocalizedHref() {
  const { locale } = useI18n();
  return useCallback(
    (path: string) => localizedHref(locale, path),
    [locale],
  );
}
