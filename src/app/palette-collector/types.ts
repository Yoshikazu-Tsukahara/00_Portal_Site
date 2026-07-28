import type { ColorFormat } from "./colorMath";
import { normalizeHex } from "./colorMath";

/** LocalStorage 保存キー（作業中パレット） */
export const STORAGE_KEY = "palette-collector:v1";
/** LocalStorage 保存キー（画像＋パレットのプロジェクト一覧） */
export const PROJECTS_STORAGE_KEY = "palette-collector:projects:v1";
/** PWA / バックアップ識別用アプリID */
export const APP_ID = "palette-collector";
/** プロジェクト保存時の画像長辺上限（px） */
export const PROJECT_IMAGE_MAX_EDGE = 800;
/** プロジェクト保存時の JPEG 品質 */
export const PROJECT_IMAGE_QUALITY = 0.72;

/** 画像からスポイトしたときの元ピクセル座標 */
export type ColorPickSource = {
  x: number;
  y: number;
};

export type PaletteColorEntry = {
  id: string;
  /** "#rrggbb" 小文字で正規化して保持 */
  hex: string;
  createdAt: string;
  /** スポイトで追加した場合のみ。オート抽出などでは未設定 */
  source?: ColorPickSource;
};

export type PaletteCollectorData = {
  colors: PaletteColorEntry[];
  format: ColorFormat;
};

export function emptyData(): PaletteCollectorData {
  return { colors: [], format: "hex" };
}

/** 画像＋パレットを1セットで保存したプロジェクト */
export type SavedProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  /** 圧縮済み JPEG の data URL */
  imageDataUrl: string;
  colors: PaletteColorEntry[];
  format: ColorFormat;
};

export function emptyProjects(): SavedProject[] {
  return [];
}

/** プロジェクト配列を安全な形へ正規化 */
export function normalizeProjects(raw: unknown): SavedProject[] {
  if (!Array.isArray(raw)) return emptyProjects();
  return raw.reduce<SavedProject[]>((acc, item) => {
    if (!item || typeof item !== "object") return acc;
    const r = item as Partial<SavedProject>;
    const name = typeof r.name === "string" ? r.name.trim() : "";
    const imageDataUrl =
      typeof r.imageDataUrl === "string" && r.imageDataUrl.startsWith("data:image/")
        ? r.imageDataUrl
        : "";
    if (!name || !imageDataUrl) return acc;
    const palette = normalizePaletteData({
      colors: r.colors,
      format: r.format,
    });
    acc.push({
      id: typeof r.id === "string" && r.id ? r.id : createId("p"),
      name: name.slice(0, 80),
      createdAt:
        typeof r.createdAt === "string" ? r.createdAt : new Date().toISOString(),
      updatedAt:
        typeof r.updatedAt === "string" ? r.updatedAt : new Date().toISOString(),
      imageDataUrl,
      colors: palette.colors,
      format: palette.format,
    });
    return acc;
  }, []);
}

/** 衝突しにくい簡易ID生成（サーバー通信なしの完全ローカル用途で十分な強度） */
export function createId(prefix = "c"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** LocalStorage から読み込んだ未検証データを安全な形へ正規化する */
export function normalizePaletteData(raw: unknown): PaletteCollectorData {
  if (!raw || typeof raw !== "object") return emptyData();
  const r = raw as Partial<PaletteCollectorData>;

  const colors: PaletteColorEntry[] = Array.isArray(r.colors)
    ? r.colors.reduce<PaletteColorEntry[]>((acc, item) => {
        if (!item || typeof item !== "object") return acc;
        const raw = item as Partial<PaletteColorEntry>;
        const hex = typeof raw.hex === "string" ? normalizeHex(raw.hex) : null;
        if (!hex) return acc;
        const sourceRaw = (item as Partial<PaletteColorEntry>).source;
        let source: ColorPickSource | undefined;
        if (sourceRaw && typeof sourceRaw === "object") {
          const sx = (sourceRaw as ColorPickSource).x;
          const sy = (sourceRaw as ColorPickSource).y;
          if (
            typeof sx === "number" &&
            typeof sy === "number" &&
            Number.isFinite(sx) &&
            Number.isFinite(sy)
          ) {
            source = {
              x: Math.max(0, Math.round(sx)),
              y: Math.max(0, Math.round(sy)),
            };
          }
        }
        acc.push({
          id: typeof raw.id === "string" && raw.id ? raw.id : createId(),
          hex,
          createdAt:
            typeof raw.createdAt === "string"
              ? raw.createdAt
              : new Date().toISOString(),
          ...(source ? { source } : {}),
        });
        return acc;
      }, [])
    : [];

  const format: ColorFormat =
    r.format === "rgb" || r.format === "hsl" ? r.format : "hex";

  return { colors, format };
}
