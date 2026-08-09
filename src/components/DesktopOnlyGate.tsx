"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n";
import { useCompactLayout } from "@/lib/useCompactLayout";

type Props = {
  /** アプリ名（案内文に使う） */
  title: string;
  children: ReactNode;
};

/**
 * スマホ非対応アプリ用ゲート。
 * 縦長（compact）では本体の代わりに PC 利用案内を出す。
 */
export default function DesktopOnlyGate({ title, children }: Props) {
  const { t } = useI18n();
  const { compact } = useCompactLayout();

  if (!compact) return children;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
      <p className="text-base font-medium text-zinc-800">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-600">
        {t.card.pcRecommendedHint}
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition-opacity hover:opacity-70"
      >
        {t.header.homeNav}
      </Link>
    </div>
  );
}
