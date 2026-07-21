import type { TagColorId, TagMasterItem } from "./types";
import { createId } from "./types";

export type TagColorStyle = {
  id: TagColorId;
  /** バッジ（通常） */
  badge: string;
  /** 選択中カード上のバッジ */
  badgeOnDark: string;
  /** フィルターボタン（未選択） */
  filter: string;
  /** フィルターボタン（選択中） */
  filterActive: string;
  /** カラーピッカーのドット */
  swatch: string;
};

/** 10色パレット（zinc 基調に馴染む淡色） */
export const TAG_COLORS: TagColorStyle[] = [
  {
    id: "red",
    badge: "bg-red-50 text-red-700 border-red-200",
    badgeOnDark: "bg-red-500/25 text-red-100 border-red-400/40",
    filter: "border-red-200 bg-red-50/80 text-red-700 hover:bg-red-100",
    filterActive: "border-red-600 bg-red-600 text-white",
    swatch: "bg-red-500",
  },
  {
    id: "orange",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    badgeOnDark: "bg-orange-500/25 text-orange-100 border-orange-400/40",
    filter: "border-orange-200 bg-orange-50/80 text-orange-700 hover:bg-orange-100",
    filterActive: "border-orange-600 bg-orange-600 text-white",
    swatch: "bg-orange-500",
  },
  {
    id: "amber",
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    badgeOnDark: "bg-amber-500/25 text-amber-100 border-amber-400/40",
    filter: "border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100",
    filterActive: "border-amber-600 bg-amber-600 text-white",
    swatch: "bg-amber-500",
  },
  {
    id: "green",
    badge: "bg-green-50 text-green-700 border-green-200",
    badgeOnDark: "bg-green-500/25 text-green-100 border-green-400/40",
    filter: "border-green-200 bg-green-50/80 text-green-700 hover:bg-green-100",
    filterActive: "border-green-600 bg-green-600 text-white",
    swatch: "bg-green-500",
  },
  {
    id: "emerald",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeOnDark: "bg-emerald-500/25 text-emerald-100 border-emerald-400/40",
    filter:
      "border-emerald-200 bg-emerald-50/80 text-emerald-700 hover:bg-emerald-100",
    filterActive: "border-emerald-600 bg-emerald-600 text-white",
    swatch: "bg-emerald-500",
  },
  {
    id: "cyan",
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    badgeOnDark: "bg-cyan-500/25 text-cyan-100 border-cyan-400/40",
    filter: "border-cyan-200 bg-cyan-50/80 text-cyan-700 hover:bg-cyan-100",
    filterActive: "border-cyan-600 bg-cyan-600 text-white",
    swatch: "bg-cyan-500",
  },
  {
    id: "blue",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    badgeOnDark: "bg-blue-500/25 text-blue-100 border-blue-400/40",
    filter: "border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100",
    filterActive: "border-blue-600 bg-blue-600 text-white",
    swatch: "bg-blue-500",
  },
  {
    id: "indigo",
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badgeOnDark: "bg-indigo-500/25 text-indigo-100 border-indigo-400/40",
    filter:
      "border-indigo-200 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100",
    filterActive: "border-indigo-600 bg-indigo-600 text-white",
    swatch: "bg-indigo-500",
  },
  {
    id: "purple",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    badgeOnDark: "bg-purple-500/25 text-purple-100 border-purple-400/40",
    filter:
      "border-purple-200 bg-purple-50/80 text-purple-700 hover:bg-purple-100",
    filterActive: "border-purple-600 bg-purple-600 text-white",
    swatch: "bg-purple-500",
  },
  {
    id: "pink",
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    badgeOnDark: "bg-pink-500/25 text-pink-100 border-pink-400/40",
    filter: "border-pink-200 bg-pink-50/80 text-pink-700 hover:bg-pink-100",
    filterActive: "border-pink-600 bg-pink-600 text-white",
    swatch: "bg-pink-500",
  },
];

const COLOR_MAP = Object.fromEntries(
  TAG_COLORS.map((c) => [c.id, c]),
) as Record<TagColorId, TagColorStyle>;

export function getTagColorStyle(color: TagColorId): TagColorStyle {
  return COLOR_MAP[color] ?? COLOR_MAP.blue;
}

export function isTagColorId(value: unknown): value is TagColorId {
  return typeof value === "string" && value in COLOR_MAP;
}

/** 初期タグマスタ（名前は自由に変更可） */
export function createDefaultTagMaster(
  defs: { name: string; color: TagColorId }[],
): TagMasterItem[] {
  return defs.map((d) => ({
    id: createId("tag"),
    name: d.name,
    color: d.color,
  }));
}

/** ID 順でタグを解決 */
export function resolveTags(
  master: TagMasterItem[],
  tagIds: string[],
): TagMasterItem[] {
  const map = new Map(master.map((t) => [t.id, t]));
  return tagIds
    .map((id) => map.get(id))
    .filter((t): t is TagMasterItem => t !== undefined);
}
