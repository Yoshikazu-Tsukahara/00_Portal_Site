import type { AppShellCopy } from "./otherApps";

export type MediaMetadataDict = {
  shell: AppShellCopy;
  privacyBanner: string;
  dropHint: string;
  dropSub: string;
  addFiles: string;
  unsupported: string;
  unsupportedSome: string;
  loadError: string;
  modeAudio: string;
  modeVideo: string;
  fileList: {
    heading: string;
    empty: string;
    remove: string;
    audio: string;
    video: string;
  };
  stage: {
    artworkTitle: string;
    artworkHint: string;
    artworkDrop: string;
    artworkDropSub: string;
    noArtwork: string;
    clearArtwork: string;
    videoTitle: string;
    videoHint: string;
    captureFrame: string;
    capturing: string;
    captureError: string;
    thumbPreview: string;
  };
  form: {
    heading: string;
    hint: string;
    fileName: string;
    fileNameHint: string;
    title: string;
    artist: string;
    year: string;
    album: string;
    track: string;
    comment: string;
    removeHistory: string;
    removeHistoryAria: string;
  };
  export: {
    button: string;
    buttonAll: string;
    hint: string;
    videoSoon: string;
    videoSkipped: string;
    downloading: string;
    ok: string;
    okZip: string;
    fail: string;
  };
  clearAll: string;
  selectPrompt: string;
};

export const mediaMetadataJa: MediaMetadataDict = {
  shell: {
    title: "メディア・メタデータ エディター",
    description:
      "音楽・動画のタグとカバー／サムネを、ブラウザ内だけで編集するクリエイター向けツール。",
  },
  privacyBanner:
    "ファイルと編集内容はすべてブラウザ内で処理します。サーバーへ送信しません。",
  dropHint: "音楽・動画ファイルをドロップ（複数可）",
  dropSub:
    "またはクリックして選択（MP3 / MP4 / WebM など）。複数ファイルをまとめて編集できます。処理は完全ローカルです。",
  addFiles: "ファイルを追加",
  unsupported: "対応していない形式です。音楽または動画ファイルを選んでください。",
  unsupportedSome:
    "一部のファイルは非対応のためスキップしました。",
  loadError: "ファイルの読み込みに失敗しました。",
  modeAudio: "Music mode",
  modeVideo: "Video mode",
  fileList: {
    heading: "ファイル",
    empty: "まだありません",
    remove: "このファイルを削除",
    audio: "音楽",
    video: "動画",
  },
  stage: {
    artworkTitle: "カバーアート",
    artworkHint: "JPG / PNG をドロップすると新しいジャケットとして使えます。",
    artworkDrop: "新しいカバー画像をドロップ",
    artworkDropSub: "またはクリックして JPG / PNG を選択",
    noArtwork: "アートワークなし",
    clearArtwork: "カバーをクリア",
    videoTitle: "プレビュー",
    videoHint:
      "シークバーでシーンを選び、「このシーンをサムネイルにする」でフレームをキャプチャします。",
    captureFrame: "このシーンをサムネイルにする",
    capturing: "キャプチャ中…",
    captureError:
      "フレームのキャプチャに失敗しました。再生可能な位置で再試行してください。",
    thumbPreview: "サムネイル プレビュー",
  },
  form: {
    heading: "メタデータ",
    hint: "選択中のファイルだけを編集します。直近の入力は履歴として残り、フォーカス時に候補が出ます。",
    fileName: "ファイル名",
    fileNameHint:
      "ダウンロード時の名前になります。拡張子を消しても元の形式で補完します。",
    title: "タイトル",
    artist: "アーティスト",
    year: "制作年（Year）",
    album: "アルバム名",
    track: "トラック番号",
    comment: "コメント（Description）",
    removeHistory: "履歴から削除",
    removeHistoryAria: "「{value}」を履歴から削除",
  },
  export: {
    button: "選択をダウンロード",
    buttonAll: "すべてダウンロード",
    hint: "編集内容を埋め込んだファイルを、このブラウザから保存します。複数時は ZIP になります。",
    videoSoon:
      "動画へのメタデータ／サムネ書き込みは次フェーズ（ffmpeg.wasm）で接続します。いまはプレビューまで利用できます。",
    videoSkipped: "動画ファイルは書き込み未対応のためスキップしました。",
    downloading: "ファイルを生成中…",
    ok: "ダウンロードを開始しました",
    okZip: "ZIP のダウンロードを開始しました",
    fail: "ファイルの生成に失敗しました",
  },
  clearAll: "すべてクリア",
  selectPrompt: "左の一覧からファイルを選んで編集を開始してください",
};

export const mediaMetadataEn: MediaMetadataDict = {
  shell: {
    title: "Media Metadata Editor",
    description:
      "A local-first creator tool to edit audio/video tags and cover/thumbnail art in the browser.",
  },
  privacyBanner:
    "Files and edits stay in your browser. Nothing is sent to a server.",
  dropHint: "Drop audio or video files (multiple OK)",
  dropSub:
    "Or click to choose (MP3 / MP4 / WebM, etc.). Edit several files in one session—fully local.",
  addFiles: "Add files",
  unsupported: "Unsupported type. Choose an audio or video file.",
  unsupportedSome: "Some unsupported files were skipped.",
  loadError: "Failed to load the file.",
  modeAudio: "Music mode",
  modeVideo: "Video mode",
  fileList: {
    heading: "Files",
    empty: "None yet",
    remove: "Remove this file",
    audio: "Audio",
    video: "Video",
  },
  stage: {
    artworkTitle: "Cover art",
    artworkHint: "Drop a JPG / PNG to set a new cover.",
    artworkDrop: "Drop a new cover image",
    artworkDropSub: "or click to choose JPG / PNG",
    noArtwork: "No artwork",
    clearArtwork: "Clear cover",
    videoTitle: "Preview",
    videoHint:
      "Scrub to a frame, then click “Use this frame as thumbnail” to capture it.",
    captureFrame: "Use this frame as thumbnail",
    capturing: "Capturing…",
    captureError:
      "Could not capture the frame. Try again at a playable position.",
    thumbPreview: "Thumbnail preview",
  },
  form: {
    heading: "Metadata",
    hint: "Edits apply to the selected file only. Recent values are saved for suggestions on focus.",
    fileName: "File name",
    fileNameHint:
      "Used when downloading. If you remove the extension, the original one is restored.",
    title: "Title",
    artist: "Artist",
    year: "Year",
    album: "Album",
    track: "Track number",
    comment: "Comment (Description)",
    removeHistory: "Remove from history",
    removeHistoryAria: "Remove “{value}” from history",
  },
  export: {
    button: "Download selected",
    buttonAll: "Download all",
    hint: "Saves rewritten files from this browser. Multiple files become a ZIP.",
    videoSoon:
      "Writing metadata/thumbnails into video lands in the next phase (ffmpeg.wasm). Preview works now.",
    videoSkipped: "Video files were skipped (write support coming next).",
    downloading: "Generating file…",
    ok: "Download started",
    okZip: "ZIP download started",
    fail: "Failed to generate the file",
  },
  clearAll: "Clear all",
  selectPrompt: "Select a file from the list to start editing",
};
