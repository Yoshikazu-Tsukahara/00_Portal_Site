"use client";

/**
 * サイト全体共通の運営者情報フッター。
 * 連絡先・外部リンクは下の定数だけ書き換えれば反映される。
 * 表示文言は i18n 辞書を参照する。
 */

import Link from "next/link";
import { useI18n } from "@/i18n";

/** note プロフィールなど（未設定時は "#" のまま） */
const NOTE_URL = "#";

/** お問い合わせ用メール（後から実アドレスに差し替え） */
const CONTACT_EMAIL = "contact@example.com";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto w-full border-t border-zinc-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 sm:py-12">
        {/* コンセプト */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium tracking-tight text-zinc-800">
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
          <a
            href={NOTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            note
          </a>
          <span aria-hidden className="hidden h-3 w-px bg-zinc-200 sm:block" />
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            {CONTACT_EMAIL}
          </a>
          <span aria-hidden className="hidden h-3 w-px bg-zinc-200 sm:block" />
          <Link
            href="/terms"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            {t.footer.terms}
          </Link>
          <span aria-hidden className="hidden h-3 w-px bg-zinc-200 sm:block" />
          <Link
            href="/privacy"
            className="text-zinc-600 transition-colors hover:text-zinc-900"
          >
            {t.footer.privacy}
          </Link>
        </nav>

        {/* 動作環境・注意事項・ローカル処理の安心メッセージ */}
        <div className="space-y-3 rounded-md border border-zinc-200/80 bg-zinc-100/60 px-3.5 py-3.5">
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
