"use client";

/**
 * サイト全体共通の運営者情報フッター。
 * 上線は画面いっぱい。中身の列だけ layoutMode の幅に揃える。
 */

import Link from "next/link";
import { useI18n } from "@/i18n";
import { useLayout } from "@/lib/layout";

export default function Footer() {
  const { t } = useI18n();
  const { contentClassName } = useLayout();

  return (
    <footer className="mt-auto w-full border-t border-zinc-200 bg-[var(--background)]">
      <div className={`flex flex-col gap-8 py-12 sm:py-14 ${contentClassName}`}>
        {/* コンセプト */}
        <div className="flex flex-col gap-2">
          <p className="font-display text-sm font-bold tracking-tight text-zinc-800">
            {t.brand}
          </p>
          <p className="text-sm leading-relaxed text-zinc-500">
            {t.footer.tagline}
          </p>
        </div>

        {/* リンク・連絡先 */}
        <nav
          aria-label={t.footer.navAria}
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"
        >
          <Link
            href="/contact"
            className="text-zinc-600 transition-all duration-150 hover:text-zinc-900"
          >
            {t.footer.contact}
          </Link>
          <span aria-hidden className="hidden h-3 w-px bg-zinc-200 sm:block" />
          <Link
            href="/terms"
            className="text-zinc-600 transition-all duration-150 hover:text-zinc-900"
          >
            {t.footer.terms}
          </Link>
          <span aria-hidden className="hidden h-3 w-px bg-zinc-200 sm:block" />
          <Link
            href="/privacy"
            className="text-zinc-600 transition-all duration-150 hover:text-zinc-900"
          >
            {t.footer.privacy}
          </Link>
        </nav>

        {/* 動作環境・注意事項・ローカル処理の安心メッセージ */}
        <div className="space-y-3 rounded-md border border-zinc-200 px-4 py-4">
          <div>
            <p className="mb-1 text-[11px] font-medium tracking-tight text-zinc-700">
              {t.footer.environmentLabel}
            </p>
            <p className="text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
              {t.messages.environment}
            </p>
          </div>
          <div className="border-t border-zinc-200/70 pt-3">
            <p className="mb-1 text-[11px] font-medium tracking-tight text-zinc-700">
              {t.footer.noticeLabel}
            </p>
            <p className="text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
              {t.messages.persistence}
            </p>
          </div>
          <div className="border-t border-zinc-200/70 pt-3">
            <p className="text-xs leading-relaxed text-zinc-500 sm:text-[13px]">
              {t.footer.localOnly}
            </p>
          </div>
        </div>

        {/* コピーライト */}
        <p className="border-t border-zinc-200/80 pt-6 text-xs text-zinc-400">
          © 2026 Yoshikazu Tsukahara — All rights reserved.
        </p>
      </div>
    </footer>
  );
}
