"use client";

import { useI18n } from "@/i18n";

type Props = {
  className?: string;
  /** 狭いヘッダー向けに短い文言を使う */
  compact?: boolean;
};

/**
 * 「外部送信ゼロ・完全ローカル動作」の安心バッジ。
 * サイトタイトル横など、サイト枠に常駐させる。
 */
export default function LocalOnlyBadge({
  className = "",
  compact = false,
}: Props) {
  const { t } = useI18n();
  // タイトル横配置では狭い画面で短い文言へ切り替え
  const besideTitle =
    className.includes("local-only-badge--beside-title") ||
    className.includes("local-only-badge--under-title");
  const text =
    compact || besideTitle
      ? t.header.localOnlyBadgeShort
      : t.header.localOnlyBadge;

  return (
    <span className={`local-only-badge ${className}`.trim()} role="note">
      <span aria-hidden>🔒</span>
      <span className="min-w-0 truncate">
        {besideTitle ? (
          <>
            <span className="hidden sm:inline">{t.header.localOnlyBadge}</span>
            <span className="sm:hidden">{text}</span>
          </>
        ) : (
          text
        )}
      </span>
    </span>
  );
}
