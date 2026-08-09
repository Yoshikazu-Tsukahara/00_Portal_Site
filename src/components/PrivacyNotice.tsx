"use client";

import { useI18n } from "@/i18n";

type PrivacyNoticeProps = {
  /** 追加の class（余白調整など） */
  className?: string;
  /**
   * default: 通常ツール向けの落ち着いた帯
   * plain: 暗いテーマ向けのコンパクト表示
   */
  variant?: "default" | "plain";
  /**
   * スマホ／縦型向け。短い文言＋余白縮小で最大2行に収める。
   */
  compact?: boolean;
};

/**
 * データ系ツール上部のプライバシー案内。
 * 警戒感を抑えつつ「ブラウザ内完結」を、信頼感のある帯で伝える。
 */
export default function PrivacyNotice({
  className = "",
  variant = "default",
  compact = false,
}: PrivacyNoticeProps) {
  const { t } = useI18n();
  const text = compact
    ? t.messages.privacyBannerShort
    : t.messages.privacyBanner;
  const compactClass = compact ? " privacy-notice--compact" : "";

  if (variant === "plain") {
    return (
      <p
        role="note"
        className={`privacy-notice privacy-notice--plain${compactClass} ${className}`.trim()}
      >
        <span className="privacy-notice__emoji" aria-hidden>
          🔒
        </span>
        <span className="privacy-notice__text">{text}</span>
      </p>
    );
  }

  return (
    <div
      role="note"
      className={`privacy-notice${compactClass} ${className}`.trim()}
    >
      <span className="privacy-notice__badge" aria-hidden>
        <span className="privacy-notice__emoji">🔒</span>
      </span>
      <p className="privacy-notice__text">{text}</p>
    </div>
  );
}
