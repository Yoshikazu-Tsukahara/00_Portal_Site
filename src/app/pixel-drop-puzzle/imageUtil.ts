// 極小ピクセル隙間落としパズル: アップロード画像の読み込み・切り取り
//
// パズル用の表示領域は横長 16:9 に固定。選択時に任意の範囲を切り取る。

/** ゲーム内で使う画像の出力解像度（横長 16:9 固定） */
export const GAME_IMAGE_WIDTH = 960;
export const GAME_IMAGE_HEIGHT = 540;
export const GAME_GROUND_ASPECT = GAME_IMAGE_WIDTH / GAME_IMAGE_HEIGHT;

export type LoadedGameImage = {
  dataUrl: string;
  width: number;
  height: number;
};

export type CropTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

/** 切り取り枠を隙間なく覆う最小スケール */
export function minCoverScale(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
): number {
  return Math.max(viewWidth / imageWidth, viewHeight / imageHeight);
}

/** 画像が切り取り枠からはみ出さないよう、スケールと位置を補正する */
export function clampCropTransform(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
  scale: number,
  offsetX: number,
  offsetY: number,
): CropTransform {
  const minScale = minCoverScale(imageWidth, imageHeight, viewWidth, viewHeight);
  const s = Math.max(minScale, scale);
  const drawnW = imageWidth * s;
  const drawnH = imageHeight * s;
  const minOffsetX = viewWidth - drawnW;
  const minOffsetY = viewHeight - drawnH;
  return {
    scale: s,
    offsetX: Math.min(0, Math.max(minOffsetX, offsetX)),
    offsetY: Math.min(0, Math.max(minOffsetY, offsetY)),
  };
}

/** 画面上の切り取り枠から固定解像度のゲーム用画像を生成する */
export function renderCropToGameImage(
  img: HTMLImageElement,
  viewWidth: number,
  viewHeight: number,
  transform: CropTransform,
): LoadedGameImage {
  const { scale, offsetX, offsetY } = transform;
  const sx = (0 - offsetX) / scale;
  const sy = (0 - offsetY) / scale;
  const sw = viewWidth / scale;
  const sh = viewHeight / scale;

  const canvas = document.createElement("canvas");
  canvas.width = GAME_IMAGE_WIDTH;
  canvas.height = GAME_IMAGE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("no-canvas-context");
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, GAME_IMAGE_WIDTH, GAME_IMAGE_HEIGHT);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
    width: GAME_IMAGE_WIDTH,
    height: GAME_IMAGE_HEIGHT,
  };
}

/** ファイルをデコードして HTMLImageElement を返す（切り取り UI 用） */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => resolve(img);
      img.src = typeof reader.result === "string" ? reader.result : "";
    };
    reader.readAsDataURL(file);
  });
}

/** 既存の DataURL から自然サイズだけを読み直す（LocalStorage 復元時に使用） */
export function readImageSize(
  dataUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("decode-failed"));
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = dataUrl;
  });
}
