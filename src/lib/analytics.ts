/**
 * 匿名アクセス解析（Vercel Analytics）用の薄いラッパー。
 * Cookie による個人トラッキングは行わない。ツール内のファイル／入力内容は送らない。
 */

import { track as vercelTrack } from "@vercel/analytics";

/** カスタムイベントに付けられるプロパティ（匿名・非個人情報のみ） */
export type AnalyticsProps = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * カスタムイベントを記録する。
 * ローカル／ブロッカー環境などで失敗してもアプリは止めない。
 */
export function trackEvent(name: string, props?: AnalyticsProps): void {
  try {
    if (typeof window === "undefined") return;
    vercelTrack(name, props);
  } catch {
    // 計測失敗は無視
  }
}

/** ツール利用の定型イベント（名前を揃えてダッシュボードで集計しやすくする） */
export function trackToolUsed(
  toolName: string,
  action: string,
  extra?: AnalyticsProps,
): void {
  trackEvent("Tool Used", { toolName, action, ...extra });
}
