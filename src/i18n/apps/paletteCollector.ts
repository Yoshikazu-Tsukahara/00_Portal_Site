import type { AppShellCopy } from "./otherApps";

export type PaletteCollectorDict = {
  shell: AppShellCopy;
  install: {
    button: string;
    buttonShort: string;
    buttonTiny: string;
    buttonAria: string;
    modalTitle: string;
    modalLead: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    desktopTitle: string;
    desktopLead: string;
    desktopStep1Title: string;
    desktopStep1Body: string;
    desktopStep2Title: string;
    desktopStep2Body: string;
    modalClose: string;
  };
  stage: {
    dropTitle: string;
    dropHint: string;
    pasteHint: string;
    chooseFile: string;
    changeImage: string;
    pickHint: string;
    loupeHint: string;
    regionHint: string;
    regionSelectBanner: string;
    regionSelectHint: string;
    panHint: string;
    resetZoom: string;
    colorLocationActive: string;
    noImageAlt: string;
    invalidFile: string;
  };
  toast: {
    added: string;
    copied: string;
    cssCopied: string;
    jsonCopied: string;
    cleared: string;
    autoAdded: string;
    projectSaved: string;
    projectLoaded: string;
    projectDeleted: string;
    projectSaveFailed: string;
    projectLoadFailed: string;
  };
  palette: {
    heading: string;
    countLabel: string;
    empty: string;
    emptyHint: string;
    formatLabel: string;
    formatHex: string;
    formatRgb: string;
    formatHsl: string;
    clearAll: string;
    clearConfirm: string;
    exportCss: string;
    exportJson: string;
    copyAria: string;
    deleteAria: string;
    /** 長押しメニューのコピー */
    copyAction: string;
    /** 長押しメニューの削除 */
    deleteAction: string;
    cancelAction: string;
    suggestionsToggleAria: string;
    complementaryLabel: string;
    analogousLabel: string;
    addSuggestionAria: string;
    selectForLocation: string;
    /** 長押しで操作できる旨の案内 */
    longPressHint: string;
    selectColorAria: string;
  };
  autoExtract: {
    heading: string;
    description: string;
    extractFull: string;
    extractRegion: string;
    extracting: string;
    addAll: string;
    dismiss: string;
    resultHint: string;
    noImage: string;
    noRegion: string;
    clearRegion: string;
    regionActive: string;
    regionSelectActive: string;
    cancelRegionSelect: string;
  };
  contrast: {
    heading: string;
    description: string;
    textColorLabel: string;
    bgColorLabel: string;
    ratioLabel: string;
    previewSample: string;
    aaNormal: string;
    aaLarge: string;
    aaaNormal: string;
    aaaLarge: string;
    pass: string;
    fail: string;
    needPaletteColor: string;
    textPresetBlack: string;
    textPresetWhite: string;
    textPresetGray: string;
    textPresetOffWhite: string;
    textCustomLabel: string;
  };
  projects: {
    heading: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    saveButton: string;
    saving: string;
    needImage: string;
    listToggle: string;
    empty: string;
    countLabel: string;
    metaLabel: string;
    loadAria: string;
    deleteAria: string;
    deleteConfirm: string;
    replaceConfirm: string;
  };
};

export const paletteCollectorJa: PaletteCollectorDict = {
  shell: {
    title: "Palette Collector",
    description:
      "画像からカラーコードをスポイト抽出し、自分だけのカラーパレットを作成・管理。",
  },
  install: {
    button: "このアプリをインストール",
    buttonShort: "インストール",
    buttonTiny: "インストール",
    buttonAria: "Palette Collector をインストールして、個別アプリとして使う",
    modalTitle: "アプリをインストール",
    modalLead:
      "対応ブラウザからインストールすると、Palette Collector だけを個別アプリとしてすぐ開けます。",
    step1Title: "共有をタップ",
    step1Body: "画面下（または上）の共有アイコン［↑］をタップします。",
    step2Title: "「ホーム画面に追加」",
    step2Body: "メニューを下にスクロールし、「ホーム画面に追加」を選びます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead:
      "Chrome / Edge なら、アドレスバーやメニューから Palette Collector を独立アプリとして追加できます。",
    desktopStep1Title: "ブラウザのメニューを開く",
    desktopStep1Body:
      "画面右上の「︙」またはアドレスバー横のインストールアイコンを探します。",
    desktopStep2Title: "「アプリをインストール」",
    desktopStep2Body:
      "「Palette Collector をインストール」や「アプリをインストール」を選ぶとホーム／デスクトップに追加されます。",
    modalClose: "わかった",
  },
  stage: {
    dropTitle: "画像をここにドラッグ＆ドロップ",
    dropHint: "クリックしてファイルを選ぶか、画像をドロップしてください",
    pasteHint: "Ctrl+V（Macは⌘+V）で画面のどこにでも直接ペーストできます",
    chooseFile: "画像を選ぶ",
    changeImage: "画像を変更",
    pickHint: "クリックで色を追加／ホイールでズーム",
    loupeHint: "1ピクセル単位で正確に選択できます",
    regionHint: "画像上をドラッグすると、オートパレット用の選択枠を作れます",
    regionSelectBanner: "ドラッグして領域を選択",
    regionSelectHint: "ドラッグで矩形を描き、離すと自動抽出します",
    panHint: "拡大中: Space＋ドラッグ、または中ボタンドラッグ／スクロールで移動",
    resetZoom: "リセット",
    colorLocationActive: "選択中の色が使われている領域を表示しています",
    noImageAlt: "読み込んだ画像",
    invalidFile: "画像ファイルを選んでください。",
  },
  toast: {
    added: "{hex} を追加しました",
    copied: "{value} をコピーしました",
    cssCopied: "CSS変数形式でコピーしました",
    jsonCopied: "JSON形式でコピーしました",
    cleared: "パレットをすべて削除しました",
    autoAdded: "{count}色を追加しました",
    projectSaved: "「{name}」を保存しました",
    projectLoaded: "「{name}」を読み込みました",
    projectDeleted: "保存データを削除しました",
    projectSaveFailed:
      "保存に失敗しました。容量不足の可能性があります。不要な保存を削除してください。",
    projectLoadFailed: "保存データの読み込みに失敗しました",
  },
  palette: {
    heading: "マイパレット",
    countLabel: "{count}色",
    empty: "まだ色がありません",
    emptyHint: "左の画像をクリックすると、ここに色が追加されます",
    formatLabel: "表示形式",
    formatHex: "HEX",
    formatRgb: "RGB",
    formatHsl: "HSL",
    clearAll: "全消去",
    clearConfirm: "マイパレットの色をすべて削除しますか？この操作は取り消せません。",
    exportCss: "CSS変数でコピー",
    exportJson: "JSONでコピー",
    copyAria: "{value} をコピー",
    deleteAria: "{value} を削除",
    copyAction: "コピー",
    deleteAction: "削除",
    cancelAction: "閉じる",
    suggestionsToggleAria: "{value} の配色提案を開く",
    complementaryLabel: "補色",
    analogousLabel: "類似色",
    addSuggestionAria: "{value} をパレットに追加",
    selectForLocation:
      "色見本またはコードをタップすると、画像上の位置・同色の領域を表示します",
    longPressHint: "長押し（PCは右クリック）でコピー・削除",
    selectColorAria: "{value} を選択して画像上に表示",
  },
  autoExtract: {
    heading: "オートパレット",
    description: "画像全体、または選択した領域から代表色を自動抽出します",
    extractFull: "画像全体から抽出",
    extractRegion: "選択領域から抽出",
    extracting: "解析中…",
    addAll: "すべてパレットに追加",
    dismiss: "閉じる",
    resultHint: "抽出された{count}色（使用比率が高い順）",
    noImage: "先に画像を読み込んでください",
    noRegion: "先に画像上をドラッグして領域を選択してください",
    clearRegion: "選択を解除",
    regionActive: "領域選択中",
    regionSelectActive:
      "画像上をドラッグして領域を決めてください（確定すると自動抽出します）",
    cancelRegionSelect: "選択をやめる",
  },
  contrast: {
    heading: "コントラストチェッカー",
    description:
      "背景色はパレットから、文字色は黒・白などから選んで WCAG 2.1 の読みやすさを判定します",
    textColorLabel: "文字色",
    bgColorLabel: "背景色",
    ratioLabel: "コントラスト比",
    previewSample: "Aa 読みやすさプレビュー",
    aaNormal: "AA（通常文字）",
    aaLarge: "AA（大きな文字）",
    aaaNormal: "AAA（通常文字）",
    aaaLarge: "AAA（大きな文字）",
    pass: "合格",
    fail: "不合格",
    needPaletteColor: "パレットに1色以上追加すると判定できます",
    textPresetBlack: "黒",
    textPresetWhite: "白",
    textPresetGray: "灰",
    textPresetOffWhite: "薄",
    textCustomLabel: "文字色を自分で選ぶ",
  },
  projects: {
    heading: "セット保存",
    description:
      "今の画像とパレットを名前付きで保存し、あとからまとめて呼び出せます",
    nameLabel: "パレット名",
    namePlaceholder: "例：夏の海のデザイン",
    saveButton: "保存",
    saving: "保存中…",
    needImage: "先に画像を読み込んでから保存できます",
    listToggle: "保存済みを呼び出す",
    empty: "まだ保存されたセットはありません",
    countLabel: "{count}件",
    metaLabel: "{count}色 · {date}",
    loadAria: "「{name}」を読み込む",
    deleteAria: "「{name}」を削除",
    deleteConfirm: "この保存セットを削除しますか？この操作は取り消せません。",
    replaceConfirm:
      "新しい画像を読み込むと、現在のパレット情報はリセットされます。よろしいですか？（※残したい場合は先に保存してください）",
  },
};

export const paletteCollectorEn: PaletteCollectorDict = {
  shell: {
    title: "Palette Collector",
    description:
      "Pick colors from any image with an eyedropper and build your own color palette.",
  },
  install: {
    button: "Install this app",
    buttonShort: "Install",
    buttonTiny: "Install",
    buttonAria: "Install Palette Collector as a standalone app",
    modalTitle: "Install app",
    modalLead:
      "Install Palette Collector from Safari to open it as its own app — not the portal.",
    step1Title: "Tap Share",
    step1Body: "Tap the Share icon [↑] at the bottom (or top) of Safari.",
    step2Title: "Add to Home Screen",
    step2Body: "Scroll the menu and choose “Add to Home Screen”.",
    desktopTitle: "Install as an app",
    desktopLead:
      "In Chrome or Edge, install Palette Collector as its own app from the address bar or browser menu.",
    desktopStep1Title: "Open the browser menu",
    desktopStep1Body:
      "Look for the ⋮ menu or the install icon near the address bar.",
    desktopStep2Title: "Install app",
    desktopStep2Body:
      "Choose “Install Palette Collector” / “Install app” to add it to your home screen or desktop.",
    modalClose: "Got it",
  },
  stage: {
    dropTitle: "Drag & drop an image here",
    dropHint: "Click to choose a file, or drop an image",
    pasteHint:
      "Press Ctrl+V (⌘+V on Mac) anywhere on the page to paste directly",
    chooseFile: "Choose image",
    changeImage: "Change image",
    pickHint: "Click to pick a color / scroll to zoom",
    loupeHint: "Pick colors with pixel-level accuracy",
    regionHint: "Drag on the image to create a selection for Auto Palette",
    regionSelectBanner: "Drag to select a region",
    regionSelectHint: "Drag a rectangle, then release to extract automatically",
    panHint: "Zoomed: Space+drag, middle-click drag, or scroll to pan",
    resetZoom: "Reset",
    colorLocationActive: "Showing where the selected color appears on the image",
    noImageAlt: "Loaded image",
    invalidFile: "Please choose an image file.",
  },
  toast: {
    added: "Added {hex}",
    copied: "Copied {value}",
    cssCopied: "Copied as CSS variables",
    jsonCopied: "Copied as JSON",
    cleared: "Cleared the whole palette",
    autoAdded: "Added {count} colors",
    projectSaved: "Saved “{name}”",
    projectLoaded: "Loaded “{name}”",
    projectDeleted: "Deleted saved set",
    projectSaveFailed:
      "Couldn’t save. Storage may be full — delete unused sets and try again.",
    projectLoadFailed: "Couldn’t load the saved set",
  },
  palette: {
    heading: "My Palette",
    countLabel: "{count} colors",
    empty: "No colors yet",
    emptyHint: "Click on the image to add colors here",
    formatLabel: "Format",
    formatHex: "HEX",
    formatRgb: "RGB",
    formatHsl: "HSL",
    clearAll: "Clear all",
    clearConfirm: "Delete every color in your palette? This cannot be undone.",
    exportCss: "Copy as CSS variables",
    exportJson: "Copy as JSON",
    copyAria: "Copy {value}",
    deleteAria: "Delete {value}",
    copyAction: "Copy",
    deleteAction: "Delete",
    cancelAction: "Close",
    suggestionsToggleAria: "Show color suggestions for {value}",
    complementaryLabel: "Complementary",
    analogousLabel: "Analogous",
    addSuggestionAria: "Add {value} to palette",
    selectForLocation:
      "Tap a swatch or code to highlight its location and matching areas on the image",
    longPressHint: "Long-press (right-click on PC) to copy or delete",
    selectColorAria: "Select {value} and show on image",
  },
  autoExtract: {
    heading: "Auto Palette",
    description:
      "Automatically extract dominant colors from the whole image or a selected region",
    extractFull: "Extract from full image",
    extractRegion: "Extract from selection",
    extracting: "Analyzing…",
    addAll: "Add all to palette",
    dismiss: "Dismiss",
    resultHint: "Extracted {count} colors (sorted by usage)",
    noImage: "Load an image first",
    noRegion: "Drag on the image to select a region first",
    clearRegion: "Clear selection",
    regionActive: "Region selected",
    regionSelectActive:
      "Drag on the image to define a region (release to extract automatically)",
    cancelRegionSelect: "Cancel selection",
  },
  contrast: {
    heading: "Contrast Checker",
    description:
      "Pick a background from your palette and text color (black, white, or custom) for WCAG 2.1 checks",
    textColorLabel: "Text color",
    bgColorLabel: "Background color",
    ratioLabel: "Contrast ratio",
    previewSample: "Aa readability preview",
    aaNormal: "AA (normal text)",
    aaLarge: "AA (large text)",
    aaaNormal: "AAA (normal text)",
    aaaLarge: "AAA (large text)",
    pass: "Pass",
    fail: "Fail",
    needPaletteColor: "Add at least one palette color to check contrast",
    textPresetBlack: "Black",
    textPresetWhite: "White",
    textPresetGray: "Gray",
    textPresetOffWhite: "Off",
    textCustomLabel: "Pick a custom text color",
  },
  projects: {
    heading: "Save set",
    description:
      "Save the current image and palette under a name, then restore them anytime",
    nameLabel: "Palette name",
    namePlaceholder: "e.g. Summer sea design",
    saveButton: "Save",
    saving: "Saving…",
    needImage: "Load an image first to save a set",
    listToggle: "Open saved sets",
    empty: "No saved sets yet",
    countLabel: "{count}",
    metaLabel: "{count} colors · {date}",
    loadAria: "Load “{name}”",
    deleteAria: "Delete “{name}”",
    deleteConfirm: "Delete this saved set? This cannot be undone.",
    replaceConfirm:
      "Loading a new image will reset the current palette. Continue? (Save first if you want to keep it.)",
  },
};
