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
};

/**
 * データ系ツール上部のプライバシー案内。
 * 警戒感を抑えつつ「ブラウザ内完結」を、信頼感のある帯で伝える。
 */
export default function PrivacyNotice({
  className = "",
  variant = "default",
}: PrivacyNoticeProps) {
  const { t } = useI18n();

  if (variant === "plain") {
    return (
      <p
        role="note"
        className={`privacy-notice privacy-notice--plain ${className}`.trim()}
      >
        <span className="privacy-notice__emoji" aria-hidden>
          🔒
        </span>
        <span>{t.messages.privacyBanner}</span>
      </p>
    );
  }

  return (
    <div role="note" className={`privacy-notice ${className}`.trim()}>
      <span className="privacy-notice__badge" aria-hidden>
        <span className="privacy-notice__emoji">🔒</span>
      </span>
      <p className="privacy-notice__text">{t.messages.privacyBanner}</p>
    </div>
  );
}
