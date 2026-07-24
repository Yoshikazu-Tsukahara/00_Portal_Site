import {
  clampCropTransform,
  GAME_IMAGE_HEIGHT,
  GAME_IMAGE_WIDTH,
  loadImageFromUrl,
  minCoverScale,
  renderCropToGameImage,
  type LoadedGameImage,
} from "./imageUtil";

/** 同梱デフォルト画像（public） */
export const DEFAULT_IMAGE_ASSET_PATH = "/pixel-drop-puzzle/default-source.png";

/** 中央 16:9 で切り出したゲーム用デフォルト画像を生成する */
export async function loadDefaultGameImage(): Promise<LoadedGameImage> {
  const img = await loadImageFromUrl(DEFAULT_IMAGE_ASSET_PATH);
  const viewW = GAME_IMAGE_WIDTH;
  const viewH = GAME_IMAGE_HEIGHT;
  const minScale = minCoverScale(img.naturalWidth, img.naturalHeight, viewW, viewH);
  const drawnW = img.naturalWidth * minScale;
  const drawnH = img.naturalHeight * minScale;
  const offsetX = (viewW - drawnW) / 2;
  const offsetY = (viewH - drawnH) / 2;
  const transform = clampCropTransform(
    img.naturalWidth,
    img.naturalHeight,
    viewW,
    viewH,
    minScale,
    offsetX,
    offsetY,
  );
  return renderCropToGameImage(img, viewW, viewH, transform);
}

/** LocalStorage 上でデフォルト画像を使っているか（カスタム DataURL 未保存） */
export function isDefaultImageStored(lastImage: string | null): boolean {
  return lastImage === null;
}
