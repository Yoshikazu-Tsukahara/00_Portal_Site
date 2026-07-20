import type { AppShellCopy } from "./otherApps";

export type MediaMetadataDict = {
  shell: AppShellCopy;
  loading: string;
  privacyBanner: string;
  dropHint: string;
  dropSub: string;
  fileList: string;
  listEmpty: string;
  selectPrompt: string;
  kindAudio: string;
  kindImage: string;
  kindVideo: string;
  kindOther: string;
  writableBadge: string;
  readError: string;
  removeFile: string;
  fileInfo: string;
  infoName: string;
  infoType: string;
  infoModified: string;
  infoDimensions: string;
  writeMp3Note: string;
  writeImageNote: string;
  writeLimitedNote: string;
  properties: string;
  propertiesHint: string;
  imagePreview: string;
  imageProperties: string;
  imagePropertiesHint: string;
  imageFields: {
    title: string;
    description: string;
    comment: string;
    copyright: string;
    datetime: string;
  };
  stripExifLabel: string;
  stripExifHint: string;
  gpsDetected: string;
  dirtyBadge: string;
  fields: {
    title: string;
    artist: string;
    album: string;
    albumArtist: string;
    genre: string;
    year: string;
    track: string;
    comment: string;
  };
  artwork: string;
  artworkHint: string;
  artworkDrop: string;
  artworkDropSub: string;
  noArtwork: string;
  changeArtwork: string;
  clearArtwork: string;
  presetsHeading: string;
  presetsEmpty: string;
  savePreset: string;
  presetNamePrompt: string;
  deletePreset: string;
  presetApplied: string;
  applyDownload: string;
  applyDownloadHint: string;
  downloadOne: string;
  downloadAll: string;
  downloading: string;
  downloadOk: string;
  downloadFail: string;
  clearAll: string;
  statusEmpty: string;
  statusCount: string;
};

export const mediaMetadataJa: MediaMetadataDict = {
  shell: {
    title: "メディア・メタデータ エディター",
    description:
      "MP3 のタグ／ジャケットと、JPEG の Exif をブラウザ内で編集して書き出し。",
  },
  loading: "読込中…",
  privacyBanner:
    "🔒 アップロードしたファイルと編集内容は、すべてお使いのブラウザ内でのみ処理されます。サーバーへ送信されることは一切ありません。",
  dropHint: "ファイルをドロップ、または選択",
  dropSub:
    "MP3・JPEG・PNG などに対応。音声タグと画像 Exif の書き換えはブラウザ内で完結します。",
  fileList: "ファイル一覧",
  listEmpty: "まだファイルがありません",
  selectPrompt: "左の一覧からファイルを選択して編集を開始してください",
  kindAudio: "音声",
  kindImage: "画像",
  kindVideo: "動画",
  kindOther: "その他",
  writableBadge: "編集・再生成可",
  readError: "読込失敗",
  removeFile: "ファイルを削除",
  fileInfo: "ファイル情報",
  infoName: "名前",
  infoType: "種類",
  infoModified: "更新日時",
  infoDimensions: "サイズ",
  writeMp3Note:
    "フォームの変更はリアルタイムに反映されます。「変更を適用してダウンロード」で、タグとジャケットを埋め込んだ新しい MP3 をブラウザ内で生成します。",
  writeImageNote:
    "JPEG は Exif（撮影日時・説明・著作権など）を書き換えて保存できます。PNG はメタデータ削除（ストリップ）に対応しています。処理はすべてブラウザ内です。",
  writeLimitedNote:
    "この形式は内容の確認が中心です。タグ／Exif の再書き込みは MP3・JPEG（および PNG のストリップ）向けです。",
  properties: "メタデータ編集",
  propertiesHint:
    "入力内容はそのまま反映され、ダウンロード時にファイルへ書き込まれます。",
  imagePreview: "画像プレビュー",
  imageProperties: "画像メタデータ（Exif）編集",
  imagePropertiesHint:
    "撮影日時・説明・著作権などを編集できます。プライバシー保護のため、保存時は GPS を除去します。",
  imageFields: {
    title: "タイトル",
    description: "説明（Image Description）",
    comment: "コメント",
    copyright: "著作権（Copyright）",
    datetime: "撮影日時",
  },
  stripExifLabel: "位置情報（GPS）や不要な Exif を完全削除する",
  stripExifHint:
    "オンにすると、画像を再エンコードしてメタデータをすべて取り除きます（プライバシー保護向け）。",
  gpsDetected: "GPS 情報あり",
  dirtyBadge: "未保存の変更あり",
  fields: {
    title: "タイトル",
    artist: "アーティスト",
    album: "アルバム",
    albumArtist: "アルバムアーティスト",
    genre: "ジャンル",
    year: "年（リリース年）",
    track: "トラック番号",
    comment: "コメント",
  },
  artwork: "ジャケット写真（アルバムアート）",
  artworkHint:
    "JPEG / PNG をドロップまたは選択すると、プレビューが即反映され、ダウンロード時に MP3 へ埋め込まれます。",
  artworkDrop: "ジャケット画像をドロップ",
  artworkDropSub: "またはクリックして JPEG / PNG を選択",
  noArtwork: "アートワークなし",
  changeArtwork: "画像を選ぶ",
  clearArtwork: "クリア",
  presetsHeading: "お気に入りプリセット",
  presetsEmpty: "保存されたプリセットはまだありません",
  savePreset: "＋ 現在の値を保存",
  presetNamePrompt: "プリセット名を入力",
  deletePreset: "プリセットを削除",
  presetApplied: "プリセットを適用しました",
  applyDownload: "変更を適用してダウンロード",
  applyDownloadHint:
    "サーバーを使わず、このブラウザ内でタグ／Exif を書き込んだファイルを生成して保存します。",
  downloadOne: "選択をダウンロード",
  downloadAll: "すべてに適用してダウンロード",
  downloading: "ファイルを生成中…",
  downloadOk: "書き込み済みファイルのダウンロードを開始しました",
  downloadFail: "ファイルの生成に失敗しました",
  clearAll: "すべてクリア",
  statusEmpty: "ファイルを追加して編集を開始してください",
  statusCount: "{ready} / {total} 件準備完了",
};

export const mediaMetadataEn: MediaMetadataDict = {
  shell: {
    title: "Media Metadata Editor",
    description:
      "Edit MP3 tags/artwork and JPEG Exif in the browser, then export rewritten files.",
  },
  loading: "Loading…",
  privacyBanner:
    "🔒 Uploaded files and edits stay entirely in your browser. Nothing is sent to a server.",
  dropHint: "Drop files, or choose",
  dropSub:
    "Supports MP3, JPEG, PNG, and more. Audio tags and image Exif are rewritten locally in your browser.",
  fileList: "Files",
  listEmpty: "No files yet",
  selectPrompt: "Select a file from the list to start editing",
  kindAudio: "Audio",
  kindImage: "Image",
  kindVideo: "Video",
  kindOther: "Other",
  writableBadge: "Editable",
  readError: "Read failed",
  removeFile: "Remove file",
  fileInfo: "File info",
  infoName: "Name",
  infoType: "Type",
  infoModified: "Modified",
  infoDimensions: "Dimensions",
  writeMp3Note:
    "Edits update instantly. “Apply changes & download” regenerates an MP3 with tags and artwork—entirely in your browser.",
  writeImageNote:
    "JPEG supports Exif rewrite (datetime, description, copyright, etc.). PNG supports metadata stripping. All processing stays in your browser.",
  writeLimitedNote:
    "This format is mainly for inspection. Tag/Exif rewrite targets MP3, JPEG, and PNG stripping.",
  properties: "Edit metadata",
  propertiesHint:
    "Your input is live; values are written into the file when you download.",
  imagePreview: "Image preview",
  imageProperties: "Image metadata (Exif)",
  imagePropertiesHint:
    "Edit datetime, description, copyright, and more. GPS is removed on save for privacy.",
  imageFields: {
    title: "Title",
    description: "Description (Image Description)",
    comment: "Comment",
    copyright: "Copyright",
    datetime: "Date taken",
  },
  stripExifLabel: "Strip GPS and all unnecessary Exif data",
  stripExifHint:
    "When on, the image is re-encoded with all metadata removed (privacy-focused).",
  gpsDetected: "Contains GPS",
  dirtyBadge: "Unsaved changes",
  fields: {
    title: "Title",
    artist: "Artist",
    album: "Album",
    albumArtist: "Album artist",
    genre: "Genre",
    year: "Year",
    track: "Track",
    comment: "Comment",
  },
  artwork: "Cover artwork",
  artworkHint:
    "Drop or choose a JPEG / PNG. The preview updates immediately and is embedded on download.",
  artworkDrop: "Drop cover image",
  artworkDropSub: "or click to choose JPEG / PNG",
  noArtwork: "No artwork",
  changeArtwork: "Choose image",
  clearArtwork: "Clear",
  presetsHeading: "Favorite presets",
  presetsEmpty: "No saved presets yet",
  savePreset: "+ Save current values",
  presetNamePrompt: "Enter a preset name",
  deletePreset: "Delete preset",
  presetApplied: "Preset applied",
  applyDownload: "Apply changes & download",
  applyDownloadHint:
    "No server involved—your browser rewrites tags/Exif and saves the new file locally.",
  downloadOne: "Download selected",
  downloadAll: "Apply all & download",
  downloading: "Generating file…",
  downloadOk: "Download of the rewritten file started",
  downloadFail: "Failed to generate the file",
  clearAll: "Clear all",
  statusEmpty: "Add files to start editing",
  statusCount: "{ready} / {total} ready",
};
