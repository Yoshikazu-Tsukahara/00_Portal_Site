/**
 * 後方互換用：文言の正本は src/i18n/ja.ts・en.ts。
 * 非 React コンテキスト向けに日本語定数を再エクスポートする。
 */
import { ja } from "@/i18n/ja";

/** 動作環境の概要（フッター向け・日本語） */
export const SITE_ENVIRONMENT_MESSAGE = ja.messages.environment;

/** LocalStorage に関する注意（日本語） */
export const DATA_PERSISTENCE_NOTICE = ja.messages.persistence;

/** データの安全性について（日本語） */
export const DATA_SAFETY_MESSAGE = ja.messages.safety;

/** 短い一言（日本語） */
export const DATA_SAFETY_SHORT = ja.messages.safetyShort;
