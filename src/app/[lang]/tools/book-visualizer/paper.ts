// 書籍タイプ（用紙プリセット）の定義。
// 寸法に加え、そのタイプで一般的な開き方・レイアウト既定値を持つ。
// ※ types.ts とは循環参照しない（PaperSizeId を types 側が import する）

/** 書籍タイプ選択時に合わせる既定の組版レイアウト */
export type PresetLayout = "japanese" | "western" | "photo";

/** 書籍タイプの識別子（10 種類） */
export type PaperSizeId =
  | "bunko"
  | "shinsho"
  | "shiroku"
  | "a5"
  | "b5"
  | "a4"
  | "massMarket"
  | "trade"
  | "square"
  | "phone";

export const PAPER_SIZE_IDS: readonly PaperSizeId[] = [
  "bunko",
  "shinsho",
  "shiroku",
  "a5",
  "b5",
  "a4",
  "massMarket",
  "trade",
  "square",
  "phone",
] as const;

/** 本の開き方（ページの左右順） */
export type BookBinding = "right" | "left";

export type PaperPreset = {
  id: PaperSizeId;
  /** キャンバス幅（px） */
  width: number;
  /** キャンバス高さ（px） */
  height: number;
  /**
   * 開き方。
   * - right: 右開き（和書など。奇数ページ＝右、見開きは [2|1]）
   * - left: 左開き（洋書など。奇数ページ＝右、見開きは [空|1] / [2|3]）
   */
  binding: BookBinding;
  /** このタイプを選んだときの既定レイアウト */
  defaultLayout: PresetLayout;
};

/**
 * 書籍タイプのベース寸法と開き方。
 * 物理サイズの比率を保ち、画面に収まるようスケール済み。
 */
export const PAPER_PRESETS: Record<PaperSizeId, PaperPreset> = {
  bunko: {
    id: "bunko",
    width: 360,
    height: 512,
    binding: "right",
    defaultLayout: "japanese",
  },
  shinsho: {
    id: "shinsho",
    width: 360,
    height: 640,
    binding: "right",
    defaultLayout: "japanese",
  },
  shiroku: {
    id: "shiroku",
    width: 420,
    height: 620,
    binding: "right",
    defaultLayout: "japanese",
  },
  a5: {
    id: "a5",
    width: 480,
    height: 680,
    binding: "right",
    defaultLayout: "japanese",
  },
  b5: {
    id: "b5",
    width: 560,
    height: 790,
    binding: "right",
    defaultLayout: "japanese",
  },
  a4: {
    id: "a4",
    width: 620,
    height: 880,
    binding: "left",
    defaultLayout: "western",
  },
  massMarket: {
    id: "massMarket",
    width: 360,
    height: 600,
    binding: "left",
    defaultLayout: "western",
  },
  trade: {
    id: "trade",
    width: 480,
    height: 720,
    binding: "left",
    defaultLayout: "western",
  },
  square: {
    id: "square",
    width: 560,
    height: 560,
    binding: "left",
    defaultLayout: "photo",
  },
  phone: {
    id: "phone",
    width: 360,
    height: 720,
    binding: "left",
    defaultLayout: "western",
  },
};

export function isPaperSizeId(value: unknown): value is PaperSizeId {
  return (
    typeof value === "string" &&
    (PAPER_SIZE_IDS as readonly string[]).includes(value)
  );
}

export function getPaperPreset(id: PaperSizeId): PaperPreset {
  return PAPER_PRESETS[id] ?? PAPER_PRESETS.bunko;
}

/** 書籍タイプから開き方を取得 */
export function getBookBinding(paperSize: PaperSizeId): BookBinding {
  return getPaperPreset(paperSize).binding;
}

/** 右開きか（見開きの左右順の判定用） */
export function isRightBound(paperSize: PaperSizeId): boolean {
  return getBookBinding(paperSize) === "right";
}
