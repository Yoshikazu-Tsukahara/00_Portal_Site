/** 小説相関図エディターの型定義 */

import {
  isAvatarPresetId,
  type AvatarPresetId,
} from "./DefaultAvatars";

export type { AvatarPresetId };

/** 詳細項目キー（キャンバス表示チェックの対象） */
export type DetailFieldKey =
  | "note"
  | "nickname"
  | "age"
  | "gender"
  | "appearance"
  | "goal"
  | "secret"
  | "relationMemo"
  | "backstory";

export const DETAIL_FIELD_KEYS: DetailFieldKey[] = [
  "note",
  "nickname",
  "age",
  "gender",
  "appearance",
  "goal",
  "secret",
  "relationMemo",
  "backstory",
];

/** カードに同時表示できる詳細項目数の上限 */
export const MAX_CARD_VISIBLE_FIELDS = 3;
/** カード上の1項目あたりの表示文字数上限 */
export const MAX_CARD_FIELD_CHARS = 32;

/** 関係線の線種（矢印とは独立） */
export type RelationStrokeStyle = "solid" | "dashed" | "dotted";

export const RELATION_STROKE_STYLES: RelationStrokeStyle[] = [
  "solid",
  "dashed",
  "dotted",
];

/** 関係線の矢印（線種とは独立） */
export type RelationArrowHead = "none" | "end" | "start" | "both";

export const RELATION_ARROW_HEADS: RelationArrowHead[] = [
  "none",
  "end",
  "start",
  "both",
];

/** @deprecated 旧データ互換用。normalizeRelation で strokeStyle / arrowHead へ移行 */
export type RelationLineStyle = "solid" | "dashed" | "arrow";

export type CharacterDetails = {
  /** 短い説明・立ち位置 */
  note: string;
  nickname: string;
  age: string;
  gender: string;
  appearance: string;
  goal: string;
  secret: string;
  relationMemo: string;
  backstory: string;
};

export type Character = {
  id: string;
  name: string;
  /** アップロード画像の data URL（未設定は空文字） */
  avatarDataUrl: string;
  /** デフォルトアイコン（画像未設定時に使用） */
  avatarPreset: AvatarPresetId | "";
  accent: "zinc" | "rose" | "amber" | "emerald" | "sky" | "violet";
  x: number;
  y: number;
  details: CharacterDetails;
  /** キャンバスカードに表示する詳細キー（上限あり） */
  cardVisibleKeys: DetailFieldKey[];
};

export type Relation = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  /** 実線 / 点線 / 破線 */
  strokeStyle: RelationStrokeStyle;
  /** 矢印なし / 終点 / 始点 / 両端 */
  arrowHead: RelationArrowHead;
};

export type DiagramData = {
  characters: Character[];
  relations: Relation[];
};

/** キャンバスのズーム・スクロールのお気に入り表示 */
export type CanvasViewFavorite = {
  zoom: number;
  scrollLeft: number;
  scrollTop: number;
};

/** カード配置モード */
export type PlacementMode = "snap" | "free";

/** キャンバス UI 設定（LocalStorage） */
export type CanvasUiPrefs = {
  favorite: CanvasViewFavorite | null;
  placementMode: PlacementMode;
};

export const STORAGE_KEY = "character-relation-editor:v2";
/** 原点パディング導入後の表示設定（旧キーは読み捨て） */
export const VIEW_STORAGE_KEY = "character-relation-editor:view-v2";
export const APP_ID = "character-relation-editor";

/**
 * キャンバス座標系:
 * - キャラ座標 (0,0) が論理原点
 * - 描画時は ORIGIN_PAD 分だけ右下へオフセットし、原点を画面中央へスクロール可能にする
 * - コンテンツ側は必要に応じて伸びる（半無限）
 */
/** 原点より手前の余白（GRID_SIZE の倍数） */
export const ORIGIN_PAD = 4800;
/** コンテンツ領域の最小サイズ */
export const WORLD_CONTENT_MIN = 16000;
/** 最遠のカードから外側へ確保する余白 */
export const WORLD_EDGE_PAD = 4000;

/** @deprecated 旧固定サイズ。動的算出を優先 */
export const WORLD_W = ORIGIN_PAD + WORLD_CONTENT_MIN;
/** @deprecated 旧固定サイズ。動的算出を優先 */
export const WORLD_H = ORIGIN_PAD + WORLD_CONTENT_MIN;

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.1;
export const DEFAULT_ZOOM = 1;

export const ACCENTS: Character["accent"][] = [
  "zinc",
  "rose",
  "amber",
  "emerald",
  "sky",
  "violet",
];

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyDetails(): CharacterDetails {
  return {
    note: "",
    nickname: "",
    age: "",
    gender: "",
    appearance: "",
    goal: "",
    secret: "",
    relationMemo: "",
    backstory: "",
  };
}

export function emptyDiagram(): DiagramData {
  return { characters: [], relations: [] };
}

export function clampZoom(z: number): number {
  const stepped = Math.round(z / ZOOM_STEP) * ZOOM_STEP;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(stepped.toFixed(2))));
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function normalizeDetails(raw: unknown, fallbackNote = ""): CharacterDetails {
  const d =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Partial<CharacterDetails>)
      : {};
  return {
    note: asString(d.note) || fallbackNote,
    nickname: asString(d.nickname),
    age: asString(d.age),
    gender: asString(d.gender),
    appearance: asString(d.appearance),
    goal: asString(d.goal),
    secret: asString(d.secret),
    relationMemo: asString(d.relationMemo),
    backstory: asString(d.backstory),
  };
}

function normalizeVisibleKeys(raw: unknown): DetailFieldKey[] {
  if (!Array.isArray(raw)) return ["note"];
  const keys = raw.filter(
    (k): k is DetailFieldKey =>
      typeof k === "string" && DETAIL_FIELD_KEYS.includes(k as DetailFieldKey),
  );
  const unique = [...new Set(keys)];
  return unique.slice(0, MAX_CARD_VISIBLE_FIELDS);
}

function normalizeStrokeStyle(raw: unknown): RelationStrokeStyle {
  if (raw === "dashed" || raw === "dotted" || raw === "solid") return raw;
  return "solid";
}

function normalizeArrowHead(raw: unknown): RelationArrowHead {
  if (raw === "end" || raw === "start" || raw === "both" || raw === "none") {
    return raw;
  }
  return "none";
}

/** 旧 style フィールドから線種・矢印へ移行 */
function migrateRelationAppearance(r: Record<string, unknown>): {
  strokeStyle: RelationStrokeStyle;
  arrowHead: RelationArrowHead;
} {
  if ("strokeStyle" in r || "arrowHead" in r) {
    return {
      strokeStyle: normalizeStrokeStyle(r.strokeStyle),
      arrowHead: normalizeArrowHead(r.arrowHead),
    };
  }
  const legacy = r.style;
  if (legacy === "dashed") {
    return { strokeStyle: "dashed", arrowHead: "none" };
  }
  if (legacy === "arrow") {
    return { strokeStyle: "solid", arrowHead: "end" };
  }
  return { strokeStyle: "solid", arrowHead: "none" };
}

function normalizePreset(raw: unknown): AvatarPresetId | "" {
  return isAvatarPresetId(raw) ? raw : "";
}

export function truncateCardText(text: string): string {
  const t = text.trim();
  if (t.length <= MAX_CARD_FIELD_CHARS) return t;
  return `${t.slice(0, MAX_CARD_FIELD_CHARS - 1)}…`;
}

/** カード上でバッジ横並びしやすい短い項目キー（二つ名はアイコン下に専用配置） */
export const COMPACT_CARD_FIELD_KEYS: DetailFieldKey[] = ["age", "gender"];

/** カード上で必ずフル幅にする長文寄り項目 */
export const BLOCK_CARD_FIELD_KEYS: DetailFieldKey[] = [
  "note",
  "appearance",
  "goal",
  "secret",
  "relationMemo",
  "backstory",
];

/** 短い項目とみなす文字数の目安（これ以下ならバッジ横並び） */
export const COMPACT_CARD_CHAR_LIMIT = 10;

export type CardDisplayItem = {
  key: DetailFieldKey;
  text: string;
  /** true なら横並びバッジ、false ならフル幅 */
  compact: boolean;
};

export function isCompactCardField(key: DetailFieldKey, value: string): boolean {
  if (BLOCK_CARD_FIELD_KEYS.includes(key)) return false;
  if (COMPACT_CARD_FIELD_KEYS.includes(key)) return true;
  return value.length <= COMPACT_CARD_CHAR_LIMIT;
}

/** カードに表示する項目を組み立てる（短い項目は横並び用フラグ付き） */
export function getCardDisplayItems(ch: Character): CardDisplayItem[] {
  const items: CardDisplayItem[] = [];
  for (const key of ch.cardVisibleKeys) {
    const value = ch.details[key]?.trim();
    if (!value) continue;
    const text = truncateCardText(value);
    items.push({
      key,
      text,
      compact: isCompactCardField(key, value),
    });
    if (items.length >= MAX_CARD_VISIBLE_FIELDS) break;
  }
  return items;
}

/** @deprecated getCardDisplayItems を使用 */
export function getCardDisplayLines(ch: Character): string[] {
  return getCardDisplayItems(ch).map((i) => i.text);
}

export function normalizeDiagram(raw: unknown): DiagramData {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return emptyDiagram();
  }
  const obj = raw as {
    characters?: unknown;
    relations?: unknown;
  };
  const characters = Array.isArray(obj.characters)
    ? obj.characters
        .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
        .map((c, i) => {
          const legacyNote = asString(c.note);
          const legacyIcon = asString(c.icon);
          const avatar =
            asString(c.avatarDataUrl) ||
            (legacyIcon.startsWith("data:image/") ? legacyIcon : "");

          return {
            id: asString(c.id) || createId("ch"),
            name: asString(c.name),
            avatarDataUrl: avatar,
            avatarPreset: avatar ? "" : normalizePreset(c.avatarPreset),
            accent: ACCENTS.includes(c.accent as Character["accent"])
              ? (c.accent as Character["accent"])
              : "zinc",
            x: typeof c.x === "number" ? c.x : 80 + (i % 4) * 200,
            y: typeof c.y === "number" ? c.y : 80 + Math.floor(i / 4) * 160,
            details: normalizeDetails(c.details, legacyNote),
            cardVisibleKeys: normalizeVisibleKeys(c.cardVisibleKeys),
          } satisfies Character;
        })
    : [];

  const charIds = new Set(characters.map((c) => c.id));
  const relations = Array.isArray(obj.relations)
    ? obj.relations
        .filter((r): r is Record<string, unknown> => !!r && typeof r === "object")
        .filter(
          (r) =>
            typeof r.fromId === "string" &&
            typeof r.toId === "string" &&
            charIds.has(r.fromId) &&
            charIds.has(r.toId) &&
            r.fromId !== r.toId,
        )
        .map((r) => {
          const { strokeStyle, arrowHead } = migrateRelationAppearance(r);
          return {
            id: typeof r.id === "string" ? r.id : createId("rel"),
            fromId: r.fromId as string,
            toId: r.toId as string,
            label: typeof r.label === "string" ? r.label : "",
            strokeStyle,
            arrowHead,
          };
        })
    : [];

  return { characters, relations };
}

export function normalizeViewFavorite(raw: unknown): CanvasViewFavorite | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Partial<CanvasViewFavorite>;
  if (
    typeof o.zoom !== "number" ||
    typeof o.scrollLeft !== "number" ||
    typeof o.scrollTop !== "number"
  ) {
    return null;
  }
  return {
    zoom: clampZoom(o.zoom),
    scrollLeft: Math.max(0, o.scrollLeft),
    scrollTop: Math.max(0, o.scrollTop),
  };
}

function normalizePlacementMode(raw: unknown): PlacementMode {
  return raw === "free" ? "free" : "snap";
}

/**
 * キャンバス UI 設定を正規化。
 * 旧形式（お気に入り座標のみ）も読み込める。
 */
export function normalizeCanvasUiPrefs(raw: unknown): CanvasUiPrefs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { favorite: null, placementMode: "snap" };
  }
  const o = raw as Record<string, unknown>;
  // 旧: { zoom, scrollLeft, scrollTop } を直接保存していた場合
  const legacyFavorite = normalizeViewFavorite(o);
  if (legacyFavorite && !("favorite" in o) && !("placementMode" in o)) {
    return { favorite: legacyFavorite, placementMode: "snap" };
  }
  return {
    favorite: normalizeViewFavorite(o.favorite) ?? legacyFavorite,
    placementMode: normalizePlacementMode(o.placementMode),
  };
}

/**
 * 画像ファイルを読み込み、小さく圧縮した data URL にする（LocalStorage 肥大化防止）。
 */
export function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not-image"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const max = 160;
        const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          URL.revokeObjectURL(url);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}
