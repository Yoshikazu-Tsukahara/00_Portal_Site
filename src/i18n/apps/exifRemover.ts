import type { AppShellCopy } from "./otherApps";

export type ExifRemoverDict = {
  shell: AppShellCopy;
  dropHint: string;
  dropHintCompact: string;
  dropSub: string;
  /** アップロード付近の安心テキスト */
  privacyNote: string;
  status: {
    label: string;
    idle: string;
    processingProgress: string;
    done: string;
    doneMany: string;
    partial: string;
    error: string;
  };
  item: {
    pending: string;
    processing: string;
    done: string;
    error: string;
    remove: string;
    removeAria: string;
  };
  result: {
    previewAltNamed: string;
  };
  actions: {
    download: string;
    downloadAll: string;
    downloadOne: string;
    downloadOneAria: string;
    zipping: string;
    zipHint: string;
    clear: string;
  };
  errors: {
    notImage: string;
    notImageSome: string;
    processFailed: string;
    zipFailed: string;
  };
};

export const exifRemoverJa: ExifRemoverDict = {
  shell: {
    title: "Exif削除",
    description:
      "写真の位置情報（GPS）や撮影日時などのメタデータを、ブラウザ内だけで削除。複数枚も一括OK。",
  },
  dropHint: "画像をドロップ、またはクリックして選択（複数可）",
  dropHintCompact: "画像を追加（複数可）",
  dropSub:
    "JPEG / PNG / WebP などに対応。選んだ瞬間から端末内で処理を開始します。",
  privacyNote:
    "この処理はすべてお使いの端末内で行われます。サーバーには一切送信されないため安全です。",
  status: {
    label: "ステータス",
    idle: "処理待ち",
    processingProgress: "処理中… {done}/{total}",
    done: "✅ Exif（位置情報・メタデータ）を削除しました",
    doneMany: "✅ {count}件の Exif（位置情報・メタデータ）を削除しました",
    partial: "✅ {done}件完了 · {failed}件失敗",
    error: "処理に失敗しました",
  },
  item: {
    pending: "待ち",
    processing: "処理中",
    done: "完了",
    error: "失敗",
    remove: "一覧から外す",
    removeAria: "{name} を一覧から外す",
  },
  result: {
    previewAltNamed: "{name} のプレビュー",
  },
  actions: {
    download: "安全な画像を保存",
    downloadAll: "安全な画像を一括保存（{count}件）",
    downloadOne: "この画像を保存",
    downloadOneAria: "{name} を保存",
    zipping: "ZIP を作成中…",
    zipHint: "複数枚は ZIP でまとめてダウンロードします",
    clear: "すべてクリア",
  },
  errors: {
    notImage: "画像ファイルを選択してください",
    notImageSome: "画像以外のファイルを {count}件スキップしました",
    processFailed: "画像の処理に失敗しました。別のファイルをお試しください。",
    zipFailed: "ZIP の作成に失敗しました。もう一度お試しください。",
  },
};

export const exifRemoverEn: ExifRemoverDict = {
  shell: {
    title: "Exif Remover",
    description:
      "Remove GPS location, timestamps, and other photo metadata in your browser. Batch-friendly.",
  },
  dropHint: "Drop images, or click to choose (multiple OK)",
  dropHintCompact: "Add images (multiple OK)",
  dropSub:
    "Supports JPEG / PNG / WebP and more. Processing starts on your device as soon as you pick files.",
  privacyNote:
    "Everything runs on your device. Nothing is uploaded to a server, so your photos stay private.",
  status: {
    label: "Status",
    idle: "Waiting",
    processingProgress: "Processing… {done}/{total}",
    done: "✅ Exif (location & metadata) removed",
    doneMany: "✅ Removed Exif (location & metadata) from {count} images",
    partial: "✅ {done} done · {failed} failed",
    error: "Processing failed",
  },
  item: {
    pending: "Queued",
    processing: "Working",
    done: "Done",
    error: "Failed",
    remove: "Remove",
    removeAria: "Remove {name} from the list",
  },
  result: {
    previewAltNamed: "Preview of {name}",
  },
  actions: {
    download: "Save safe image",
    downloadAll: "Save all safe images ({count})",
    downloadOne: "Save this image",
    downloadOneAria: "Save {name}",
    zipping: "Creating ZIP…",
    zipHint: "Multiple images download as a single ZIP",
    clear: "Clear all",
  },
  errors: {
    notImage: "Please select an image file",
    notImageSome: "Skipped {count} non-image file(s)",
    processFailed: "Could not process the image. Try another file.",
    zipFailed: "Could not create the ZIP. Please try again.",
  },
};
