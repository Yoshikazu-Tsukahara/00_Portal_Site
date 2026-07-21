import type { AppShellCopy } from "./otherApps";

export type ImageCompressorDict = {
  shell: AppShellCopy;
  zipping: string;
  downloadZip: string;
  addImages: string;
  clearAll: string;
  dropHint: string;
  dropSub: string;
  presets: {
    aria: string;
    high: { label: string; hint: string };
    standard: { label: string; hint: string };
    light: { label: string; hint: string };
  };
  settings: {
    sequentialNames: string;
    sequentialHint: string;
    outputFormat: string;
    formatOriginal: string;
    formatWebp: string;
    formatJpeg: string;
  };
  grid: {
    empty: string;
    delete: string;
    deleteAria: string;
    calculating: string;
    failed: string;
  };
  summary: {
    calculating: string;
  };
  status: {
    estimating: string;
    ready: string;
    zipHint: string;
  };
  messages: {
    added: string;
    zipped: string;
  };
  errors: {
    loadFailed: string;
    zipFailed: string;
  };
};

export const imageCompressorJa: ImageCompressorDict = {
  shell: {
    title: "画像一括軽量化",
    description: "リサイズ・圧縮をブラウザ内で一括処理。ZIPで保存。",
  },
  zipping: "ZIP生成中…",
  downloadZip: "一括ダウンロード（ZIP）",
  addImages: "画像を追加",
  clearAll: "すべてクリア",
  dropHint: "画像をドロップ、または選択",
  dropSub: "JPEG / PNG / WebP · 複数可 · ブラウザ内処理",
  presets: {
    aria: "圧縮プリセット",
    high: { label: "オリジナル重視", hint: "品質90% · リサイズなし" },
    standard: { label: "標準バランス", hint: "おすすめ · 品質70%" },
    light: { label: "最高圧縮", hint: "ファイル最小化 · 品質40%" },
  },
  settings: {
    sequentialNames: "ファイル名を連番にする",
    sequentialHint: "photo_1, photo_2…",
    outputFormat: "保存形式",
    formatOriginal: "元形式を維持",
    formatWebp: "WebPに変換",
    formatJpeg: "JPEGに変換",
  },
  grid: {
    empty: "画像なし",
    delete: "削除",
    deleteAria: "{name} を削除",
    calculating: "算出中…",
    failed: "失敗",
  },
  summary: {
    calculating: "算出中…",
  },
  status: {
    estimating: "{count} 枚 · 推定サイズ算出中…",
    ready: "{count} 枚 · 圧縮準備完了",
    zipHint: "画像追加でZIP可",
  },
  messages: {
    added: "{count} 枚を追加",
    zipped: "{count} 枚をZIP保存",
  },
  errors: {
    loadFailed: "画像読込に失敗",
    zipFailed: "ZIP生成に失敗",
  },
};

export const imageCompressorEn: ImageCompressorDict = {
  shell: {
    title: "Batch Image Compressor",
    description: "Resize and compress in the browser. Save as a ZIP.",
  },
  zipping: "Creating ZIP…",
  downloadZip: "Download all (ZIP)",
  addImages: "Add images",
  clearAll: "Clear all",
  dropHint: "Drop images, or choose files",
  dropSub: "JPEG / PNG / WebP · multiple · processed in-browser",
  presets: {
    aria: "Compression preset",
    high: { label: "Preserve quality", hint: "90% quality · no resize" },
    standard: { label: "Balanced", hint: "Recommended · 70% quality" },
    light: { label: "Max compression", hint: "Smallest files · 40% quality" },
  },
  settings: {
    sequentialNames: "Use sequential file names",
    sequentialHint: "photo_1, photo_2…",
    outputFormat: "Output format",
    formatOriginal: "Keep original format",
    formatWebp: "Convert to WebP",
    formatJpeg: "Convert to JPEG",
  },
  grid: {
    empty: "No images",
    delete: "Remove",
    deleteAria: "Remove {name}",
    calculating: "Calculating…",
    failed: "Failed",
  },
  summary: {
    calculating: "Calculating…",
  },
  status: {
    estimating: "{count} images · estimating size…",
    ready: "{count} images · ready to compress",
    zipHint: "Add images to enable ZIP download",
  },
  messages: {
    added: "Added {count} images",
    zipped: "Saved {count} images to ZIP",
  },
  errors: {
    loadFailed: "Could not load image",
    zipFailed: "ZIP creation failed",
  },
};
