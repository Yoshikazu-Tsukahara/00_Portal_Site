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
  /** text/number/emoji はそのままの文字列、image は DataURL */
  value: string;
};

/** プレイモード：当たるまで回す or 外し続ける（アンチビンゴ） */
export type PlayMode = "hitUntilWin" | "antiBingo";

/**
 * 停止操作モード
 * - individual: 各リールに STOP
 * - batch: 1つの STOP で左から順次停止
 */
export type StopMode = "individual" | "batch";

/** スロットのカスタマイズ設定 */
export type SlotSettings = {
  /** リール本数（すべて同じ絵柄セットを使う） */
  reelCount: number;
  /** 全リール共通の絵柄リスト（先頭が JACKPOT） */
  symbols: SlotItem[];
  mode: PlayMode;
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

export const MIN_REELS = 2;
export const MAX_REELS = 8;
export const MIN_ITEMS_PER_REEL = 2;
export const MAX_ITEMS_PER_REEL = 24;

/** 一括順次ストップ時のリール間ディレイ（ms） */
export const BATCH_STOP_DELAY_MS = 280;

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 先頭（index 0）ほどレアな絵柄になるよう並べたデフォルト絵文字プール */
const DEFAULT_EMOJI_POOL = [
  "⭐",
  "7️⃣",
  "💎",
  "🔔",
  "👑",
  "🍇",
  "🍋",
  "🍒",
  "🍀",
  "🎯",
  "⚡",
  "🔥",
  "🌙",
  "☄️",
  "🪙",
  "🎲",
  "🧿",
  "🔮",
  "🛰️",
  "🧬",
  "⚛️",
  "🌀",
  "🔷",
  "🔺",
];

export function buildDefaultItem(index: number): SlotItem {
  const value = DEFAULT_EMOJI_POOL[index % DEFAULT_EMOJI_POOL.length];
  return { id: createId(), type: "emoji", value };
}

export function buildDefaultSymbols(count: number): SlotItem[] {
  return Array.from({ length: count }, (_, i) => buildDefaultItem(i));
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

function normalizeItem(raw: unknown, fallbackIndex: number): SlotItem {
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const type = isSlotItemType(obj.type) ? obj.type : "emoji";
    const value =
      typeof obj.value === "string" && obj.value.length > 0
        ? obj.value
        : buildDefaultItem(fallbackIndex).value;
    const id = typeof obj.id === "string" ? obj.id : createId();
    return { id, type, value };
  }
  return buildDefaultItem(fallbackIndex);
}

function normalizeSymbols(raw: unknown, count: number): SlotItem[] {
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: count }, (_, i) => normalizeItem(list[i], i));
}

/** 読み込んだ設定を安全な形に正規化（旧 reels 構造からの移行含む） */
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
  if ((!Array.isArray(symbolsRaw) || symbolsRaw.length === 0) && Array.isArray(obj.reels)) {
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
  const symbols = normalizeSymbols(symbolsRaw, itemsPerReel);
  const mode: PlayMode = obj.mode === "antiBingo" ? "antiBingo" : "hitUntilWin";
  const stopMode: StopMode = obj.stopMode === "individual" ? "individual" : "batch";

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
