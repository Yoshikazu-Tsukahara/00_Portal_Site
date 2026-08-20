// 究極確率スロット: 型定義 / LocalStorage データ構造 / デフォルト値生成
//
// データはすべて LocalStorage 内に閉じる（サーバー送信なし）。
// 「設定（リール構成）」「現在の試行ラン」「生涯統計」「解放済み実績」を分けて保持し、
// 設定変更や的中でランがリセットされても、生涯統計と実績は失われないようにする。
//
// 絵柄は全リール共通（symbols を1セットだけ保持）。リール数だけ独立に抽選する。

/** アイテムの絵柄の種類 */
export type SlotItemType = "text" | "number" | "emoji" | "image";

/** リール1マスの絵柄 */
export type SlotItem = {
  id: string;
  type: SlotItemType;
  /**
   * text/number/emoji はそのままの文字列。
   * image は DataURL、または public パス（デフォルト JP）。
   */
  value: string;
};

/** プレイモード：当たるまで回す or 外し続ける（アンチビンゴ） */
export type PlayMode = "hitUntilWin" | "antiBingo";

/**
 * 停止操作モード（互換のため残す。常に一括順次として扱う）
 * @deprecated 個別 STOP は廃止。正規化時は常に "batch"
 */
export type StopMode = "batch";

/** スロットのカスタマイズ設定 */
export type SlotSettings = {
  /** リール本数（すべて同じ絵柄セットを使う） */
  reelCount: number;
  /** 全リール共通の絵柄リスト（先頭が JACKPOT） */
  symbols: SlotItem[];
  mode: PlayMode;
  /** 互換フィールド。常に "batch"（一括順次） */
  stopMode: StopMode;
};

/** 現在進行中の1ラン（的中 or モード変更でリセットされる） */
export type RunState = {
  attempts: number;
  startedAt: string;
};

/** 生涯（リセットされない）統計 */
export type SlotStats = {
  lifetimeAttempts: number;
  lifetimeWins: number;
  lifetimeMisses: number;
  /** 的中までの最短試行回数（null = まだ未達成） */
  bestWinAttempts: number | null;
  /** アンチビンゴ最長継続記録 */
  longestMissStreak: number;
  /** アンチビンゴで的中してしまった回数 */
  antiBingoFailCount: number;
};

/** モード別の解放済み実績（当たるまで回す / 外し続ける） */
export type UnlockedBadgesByMode = {
  hitUntilWin: string[];
  antiBingo: string[];
};

/** LocalStorage に保存する全データ */
export type SlotAppData = {
  settings: SlotSettings | null;
  run: RunState;
  stats: SlotStats;
  unlockedBadges: UnlockedBadgesByMode;
};

export const STORAGE_KEY = "ultimate-probability-slot-data";

/** ジャックポット（当たり）と判定するインデックス。常に絵柄リストの先頭。 */
export const JACKPOT_INDEX = 0;

/** デフォルトの JP 画像（public 配下） */
export const DEFAULT_JP_IMAGE_PATH =
  "/ultimate-probability-slot/default-jp.png";

/** ハズレ用 BAR 画像（7️⃣ の代わり） */
export const DEFAULT_BAR_IMAGE_PATH =
  "/ultimate-probability-slot/bar-symbol.png";

export const MIN_REELS = 3;
export const MAX_REELS = 10;
export const MIN_ITEMS_PER_REEL = 5;
export const MAX_ITEMS_PER_REEL = 10;

/** 一括順次ストップ時の基本ディレイ（ms） */
export const BATCH_STOP_DELAY_MS = 280;
/** ジャックポット継続時、停止間隔を伸ばす量（ms / 連続本数） */
export const BATCH_STOP_TEASE_STEP_MS = 140;

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * ハズレ絵柄の王道スロットプリセット。
 * 種類数に応じて先頭から順番に割り当てる（JP は別途 index 0）。
 */
const MISS_SYMBOL_POOL: Array<Pick<SlotItem, "type" | "value">> = [
  { type: "emoji", value: "🍒" }, // チェリー
  { type: "emoji", value: "🔔" }, // ベル
  { type: "emoji", value: "🍉" }, // スイカ
  { type: "emoji", value: "🍋" }, // レモン
  { type: "emoji", value: "🍇" }, // プラム／ブドウ
  { type: "emoji", value: "💎" }, // ダイヤモンド
  { type: "emoji", value: "⭐" }, // スター
  { type: "emoji", value: "👑" }, // クラウン
  { type: "image", value: DEFAULT_BAR_IMAGE_PATH }, // BAR（旧 7️⃣）
  { type: "emoji", value: "⬛" }, // BAR タグ
];

/** デフォルトのジャックポット絵柄（画像） */
export function buildDefaultJackpot(): SlotItem {
  return {
    id: createId(),
    type: "image",
    value: DEFAULT_JP_IMAGE_PATH,
  };
}

/** ハズレ1マス（王道スロット絵柄を順番に割り当て） */
export function buildMissItem(index: number): SlotItem {
  // index は 1 始まり想定（0 は JP）。プールは 0 始まりで順番に取る
  const poolIndex = Math.max(0, index - 1) % MISS_SYMBOL_POOL.length;
  const preset = MISS_SYMBOL_POOL[poolIndex];
  return {
    id: createId(),
    type: preset.type,
    value: preset.value,
  };
}

/**
 * 絵柄セットを構築。
 * 先頭は JP 画像、残りはシステム自動のハズレ記号。
 */
export function buildSymbols(
  count: number,
  jackpot: SlotItem = buildDefaultJackpot(),
): SlotItem[] {
  const n = Math.min(
    Math.max(Math.floor(count), MIN_ITEMS_PER_REEL),
    MAX_ITEMS_PER_REEL,
  );
  const jp: SlotItem = {
    id: jackpot.id || createId(),
    type: "image",
    value:
      typeof jackpot.value === "string" && jackpot.value.length > 0
        ? jackpot.value
        : DEFAULT_JP_IMAGE_PATH,
  };
  return Array.from({ length: n }, (_, i) =>
    i === JACKPOT_INDEX ? jp : buildMissItem(i),
  );
}

/** @deprecated buildSymbols を使う */
export function buildDefaultItem(index: number): SlotItem {
  if (index === JACKPOT_INDEX) return buildDefaultJackpot();
  return buildMissItem(index);
}

export function buildDefaultSymbols(count: number): SlotItem[] {
  return buildSymbols(count);
}

export function buildDefaultSettings(): SlotSettings {
  return {
    reelCount: 3,
    symbols: buildDefaultSymbols(8),
    mode: "hitUntilWin",
    stopMode: "batch",
  };
}

export function buildInitialRun(): RunState {
  return { attempts: 0, startedAt: new Date().toISOString() };
}

export function buildInitialStats(): SlotStats {
  return {
    lifetimeAttempts: 0,
    lifetimeWins: 0,
    lifetimeMisses: 0,
    bestWinAttempts: null,
    longestMissStreak: 0,
    antiBingoFailCount: 0,
  };
}

export function buildEmptyUnlockedBadges(): UnlockedBadgesByMode {
  return { hitUntilWin: [], antiBingo: [] };
}

export function buildEmptyAppData(): SlotAppData {
  return {
    settings: null,
    run: buildInitialRun(),
    stats: buildInitialStats(),
    unlockedBadges: buildEmptyUnlockedBadges(),
  };
}

function isSlotItemType(v: unknown): v is SlotItemType {
  return v === "text" || v === "number" || v === "emoji" || v === "image";
}

/** 旧データから JP 画像を抽出。画像以外／空ならデフォルトへ */
function extractJackpot(raw: unknown): SlotItem {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const type = isSlotItemType(obj.type) ? obj.type : null;
    const value = typeof obj.value === "string" ? obj.value : "";
    // 画像として保存されている場合のみ引き継ぐ（DataURL または public パス）
    if (type === "image" && value.length > 0) {
      return {
        id: typeof obj.id === "string" ? obj.id : createId(),
        type: "image",
        value,
      };
    }
  }
  return buildDefaultJackpot();
}

/** 読み込んだ設定を安全な形に正規化（旧 reels 構造・旧絵柄設定からの移行含む） */
export function normalizeSettings(raw: unknown): SlotSettings | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  // 新形式: symbols + reelCount
  let symbolsRaw: unknown = obj.symbols;
  let reelCount =
    typeof obj.reelCount === "number" && Number.isFinite(obj.reelCount)
      ? Math.floor(obj.reelCount)
      : 0;

  // 旧形式: reels[] から移行（先頭リールの絵柄を共通セットとして採用）
  if (
    (!Array.isArray(symbolsRaw) || symbolsRaw.length === 0) &&
    Array.isArray(obj.reels)
  ) {
    const rawReels = obj.reels;
    if (rawReels.length === 0) return null;
    reelCount = rawReels.length;
    const first = rawReels[0];
    if (first && typeof first === "object") {
      symbolsRaw = (first as Record<string, unknown>).items;
    }
  }

  if (!Array.isArray(symbolsRaw) || symbolsRaw.length === 0) return null;

  reelCount = Math.min(Math.max(reelCount || 3, MIN_REELS), MAX_REELS);
  const itemsPerReel = Math.min(
    Math.max(symbolsRaw.length, MIN_ITEMS_PER_REEL),
    MAX_ITEMS_PER_REEL,
  );
  // ハズレは常に自動生成。JP 画像だけ旧データを引き継ぐ
  const jackpot = extractJackpot(symbolsRaw[0]);
  const symbols = buildSymbols(itemsPerReel, jackpot);
  const mode: PlayMode = obj.mode === "antiBingo" ? "antiBingo" : "hitUntilWin";
  // 個別 STOP は廃止。旧データも一括順次へ寄せる
  const stopMode: StopMode = "batch";

  return { reelCount, symbols, mode, stopMode };
}

function normalizeRun(raw: unknown): RunState {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const attempts =
      typeof obj.attempts === "number" && Number.isFinite(obj.attempts) && obj.attempts >= 0
        ? Math.floor(obj.attempts)
        : 0;
    const startedAt =
      typeof obj.startedAt === "string" ? obj.startedAt : new Date().toISOString();
    return { attempts, startedAt };
  }
  return buildInitialRun();
}

function normalizeStats(raw: unknown): SlotStats {
  const base = buildInitialStats();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  const num = (key: keyof SlotStats, fallback: number) => {
    const v = obj[key];
    return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  return {
    lifetimeAttempts: num("lifetimeAttempts", base.lifetimeAttempts),
    lifetimeWins: num("lifetimeWins", base.lifetimeWins),
    lifetimeMisses: num("lifetimeMisses", base.lifetimeMisses),
    bestWinAttempts:
      typeof obj.bestWinAttempts === "number" && Number.isFinite(obj.bestWinAttempts)
        ? obj.bestWinAttempts
        : null,
    longestMissStreak: num("longestMissStreak", base.longestMissStreak),
    antiBingoFailCount: num("antiBingoFailCount", base.antiBingoFailCount),
  };
}

/** バックアップ／LocalStorage から読み込んだ生データを安全な形へ正規化 */
export function normalizeAppData(raw: unknown): SlotAppData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const settings = normalizeSettings(obj.settings);
  const run = normalizeRun(obj.run);
  const stats = normalizeStats(obj.stats);
  const unlockedBadges = normalizeUnlockedBadgesRaw(obj.unlockedBadges);
  return { settings, run, stats, unlockedBadges };
}

/** 旧フラット配列は新実績体系と非互換のため破棄する */
function normalizeUnlockedBadgesRaw(raw: unknown): UnlockedBadgesByMode {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return buildEmptyUnlockedBadges();
  }
  const obj = raw as Record<string, unknown>;
  const pick = (v: unknown) =>
    Array.isArray(v) ? v.filter((b): b is string => typeof b === "string") : [];
  return {
    hitUntilWin: pick(obj.hitUntilWin),
    antiBingo: pick(obj.antiBingo),
  };
}
