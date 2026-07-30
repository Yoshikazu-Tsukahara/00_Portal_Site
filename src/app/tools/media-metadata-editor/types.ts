/** メディア・メタデータエディター（音楽 / 動画）用の型 */

/** MIME / 拡張子から判定した編集モード */
export type MediaMode = "audio" | "video";

/**
 * 編集フォームの厳選項目。
 * 音楽・動画で共通の項目＋モード専用項目を1オブジェクトにまとめる。
 */
export type MetadataFields = {
  title: string;
  artist: string;
  year: string;
  /** 音楽のみ */
  album: string;
  /** 音楽のみ */
  track: string;
  /** 動画のみ（Description） */
  comment: string;
};

export type ArtworkState = {
  /** プレビュー用 Object URL */
  previewUrl: string | null;
  /** 書き込み用バイナリ */
  data: ArrayBuffer | null;
  mime: string;
  /** 読み込み時から変更したか */
  dirty: boolean;
};

/** 読み込んだ1ファイルのセッション状態 */
export type MediaSession = {
  id: string;
  file: File;
  mode: MediaMode;
  /** プレビュー再生用 Object URL（音声・動画） */
  mediaUrl: string;
  /** ダウンロード時に使う編集可能な表示ファイル名（拡張子含む） */
  displayName: string;
  fields: MetadataFields;
  artwork: ArtworkState;
  status: "ready" | "error";
  error?: string;
};

export const EMPTY_FIELDS: MetadataFields = {
  title: "",
  artist: "",
  year: "",
  album: "",
  track: "",
  comment: "",
};

export const EMPTY_ARTWORK: ArtworkState = {
  previewUrl: null,
  data: null,
  mime: "image/jpeg",
  dirty: false,
};

export const APP_ID = "media-metadata-editor";
