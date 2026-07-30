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
    unsaved: string;
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
    save: string;
    saving: string;
    saveOk: string;
    saveOkNonMp3: string;
    saveOkUnsupportedVideo: string;
    download: string;
    hint: string;
    needSave: string;
    dirtyNeedSave: string;
    downloading: string;
    ok: string;
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
    "またはクリックして選択。タグ埋め込みは MP3 と MP4 / MOV / WebM / MKV に対応。処理は完全ローカルです。",
  addFiles: "ファイルを追加",
  unsupported: "対応していない形式です。音楽または動画ファイルを選んでください。",
  unsupportedSome:
    "一部のファイルは非対応のためスキップしました。",
  loadError: "ファイルの読み込みに失敗しました。",
  modeAudio: "音楽モード",
  modeVideo: "動画モード",
  fileList: {
    heading: "ファイル",
    empty: "まだありません",
    remove: "このファイルを削除",
    audio: "音楽",
    video: "動画",
    unsaved: "未保存",
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
    hint: "選択中のファイルだけを編集します。「変更を保存」した内容が履歴に残り、フォーカスで候補が出ます（×で個別削除）。",
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
    save: "変更を保存",
    saving: "保存中…",
    saveOk: "変更を保存しました。ダウンロードできます。",
    saveOkNonMp3:
      "保存しました（この形式はタグ埋め込み未対応のため、ファイル名のみ反映されます）。",
    saveOkUnsupportedVideo:
      "保存しました（この動画形式はタグ埋め込み未対応です。MP4 / MOV / WebM / MKV を使ってください。ファイル名のみ反映）。",
    download: "ダウンロード",
    hint: "先に「変更を保存」で内容を確定してから、下のボタンでダウンロードしてください。大きな動画は保存に時間がかかることがあります。",
    needSave: "先に「変更を保存」を押してください。",
    dirtyNeedSave: "未保存の変更があります。先に保存してください。",
    downloading: "ダウンロード準備中…",
    ok: "ダウンロードを開始しました",
    fail: "保存に失敗しました。別のファイルで試すか、サムネイル／カバーを外して再試行してください。",
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
    "Or click to choose. Tag embedding supports MP3 and MP4 / MOV / WebM / MKV—fully local.",
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
    unsaved: "Unsaved",
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
    hint: "Edits apply to the selected file only. Values are saved to history when you press “Save changes”; focus a field for suggestions (× to delete one).",
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
    save: "Save changes",
    saving: "Saving…",
    saveOk: "Saved. You can download now.",
    saveOkNonMp3:
      "Saved (tag embedding isn’t supported for this format—filename only).",
    saveOkUnsupportedVideo:
      "Saved (tag embedding isn’t supported for this video type. Use MP4 / MOV / WebM / MKV—filename only).",
    download: "Download",
    hint: "Press “Save changes” to confirm, then download below. Large videos may take a while to save.",
    needSave: "Save changes first.",
    dirtyNeedSave: "You have unsaved changes. Save before downloading.",
    downloading: "Preparing download…",
    ok: "Download started",
    fail: "Save failed. Try another file, or clear the thumbnail/cover and retry.",
  },
  clearAll: "Clear all",
  selectPrompt: "Select a file from the list to start editing",
};
