// 「ひみつメッセージ」共通の型定義

/** 暗号文の見た目テーマ（3種類から選択） */
export type CipherTheme = "cyber" | "fantasy" | "spy";

/** 上部タブ：ひみつ作成 / 解読・チャレンジ */
export type TopMode = "create" | "decode";

/** 解読タブ内の切り替え：合言葉で解読 / シーザー暗号チャレンジ */
export type DecodeSubMode = "password" | "caesar";

/** テーマのブランド名とアイコン（言語非依存） */
export const THEME_META: Record<
  CipherTheme,
  { label: string; icon: string }
> = {
  cyber: { label: "Cyber", icon: "💻" },
  fantasy: { label: "Fantasy", icon: "🔮" },
  spy: { label: "Spy", icon: "📡" },
};

/**
 * スクランブル演出：1文字あたりの確定間隔（ミリ秒・固定）。
 * 旧「じっくり」(110ms) より少し遅め。
 */
export const FIXED_REVEAL_SPEED_MS = 150;
