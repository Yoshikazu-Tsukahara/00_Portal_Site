/**
 * 全アプリ共通の5色パレット（淡いパステル調）。
 * Tailwind の zinc/slate ミニマル基調を崩さないトーン。
 */
export const COLOR_PALETTE = {
  red: "palette-red",
  blue: "palette-blue",
  green: "palette-green",
  purple: "palette-purple",
  orange: "palette-orange",
} as const;

export type PaletteColor = keyof typeof COLOR_PALETTE;
