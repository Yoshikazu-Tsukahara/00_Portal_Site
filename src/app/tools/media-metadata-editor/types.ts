/** メディア・メタデータエディター用の型定義 */

export type MediaKind = "audio" | "image" | "video" | "other";

/** 音声向け編集可能なメタデータ項目 */
export type MetadataFields = {
  title: string;
  artist: string;
  album: string;
  albumArtist: string;
  genre: string;
  year: string;
  track: string;
  comment: string;
};

/** 画像（Exif）向け編集状態 */
export type ImageEditState = {
  title: string;
  description: string;
  comment: string;
  copyright: string;
  /** datetime-local 用（YYYY-MM-DDTHH:mm） */
  datetime: string;
  /** GPS を含む不要 Exif を完全削除して再エンコード */
  stripExif: boolean;
  /** 読み込み時に GPS が含まれていたか（表示用） */
  hasGps: boolean;
};

export type ArtworkState = {
  /** プレビュー用 Object URL */
  previewUrl: string | null;
  /** 書き込み用バイナリ（未変更なら null のことも） */
  data: ArrayBuffer | null;
  mime: string;
  /** 読み込み時から変更したか */
  dirty: boolean;
};

export type MediaItem = {
  id: string;
  file: File;
  kind: MediaKind;
  /** 書き込み対応（MP3 / JPEG / PNG） */
  writable: boolean;
  fields: MetadataFields;
  originalFields: MetadataFields;
  imageEdit: ImageEditState | null;
  originalImageEdit: ImageEditState | null;
  artwork: ArtworkState;
  /** 画像の幅・高さなど */
  extra: {
    width?: number;
    height?: number;
    durationHint?: string;
  };
  status: "loading" | "ready" | "error";
  error?: string;
};

export type FieldPreset = {
  id: string;
  name: string;
  fields: Partial<MetadataFields>;
  createdAt: string;
};

/** LocalStorage / バックアップ対象 */
export type MediaEditorAppData = {
  presets: FieldPreset[];
};

export const EMPTY_FIELDS: MetadataFields = {
  title: "",
  artist: "",
  album: "",
  albumArtist: "",
  genre: "",
  year: "",
  track: "",
  comment: "",
};

export const EMPTY_IMAGE_EDIT: ImageEditState = {
  title: "",
  description: "",
  comment: "",
  copyright: "",
  datetime: "",
  stripExif: false,
  hasGps: false,
};

export const STORAGE_KEY = "media-metadata-editor:v1";
export const APP_ID = "media-metadata-editor";
