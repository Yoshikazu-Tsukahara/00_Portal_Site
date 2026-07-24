// 極小ピクセル隙間落としパズル: アプリ内 UI 辞書（JA / EN）

import type { ErrorTier } from "../../app/pixel-drop-puzzle/ironicQuips";
import {
  pixelDropPuzzleFailQuipsEn,
  pixelDropPuzzleFailQuipsJa,
} from "./pixelDropPuzzleQuips";

export type PixelDropPuzzleDict = {
  shell: { title: string; description: string };
  install: {
    button: string;
    buttonShort: string;
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
  upload: {
    title: string;
    lead: string;
    button: string;
    buttonBusy: string;
    hint: string;
    changeButton: string;
    errorInvalidFile: string;
    cropTitle: string;
    cropLead: string;
    cropZoomLabel: string;
    cropConfirm: string;
    cropCancel: string;
    /** プレイ中「画像を変更」全面オーバーレイ */
    changeOverlayEyebrow: string;
    changeOverlayTitle: string;
    changeOverlayLead: string;
    changeOverlayResume: string;
  };
  stage: {
    stageLabel: string;
    toleranceLabel: string;
    bestStageLabel: string;
    bestErrorLabel: string;
    bestErrorEmpty: string;
  };
  hud: {
    stopButton: string;
    attemptsLabel: string;
    resetButton: string;
    resetConfirm: string;
    /** 左サイドレール見出し（現在の状況） */
    statusEyebrow: string;
    /** 右サイドレール見出し（記録・アーカイブ） */
    archiveEyebrow: string;
    /** ライフ表示ラベル */
    lifeLabel: string;
    lifeUnit: string;
  };
  /** 起動時のルール説明（毎回表示） */
  rules: {
    eyebrow: string;
    title: string;
    lead: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    close: string;
  };
  /** ライフ枯渇による降格警告 */
  deplete: {
    title: string;
    body: string;
    stageLabel: string;
    continueButton: string;
  };
  fail: {
    title: string;
    statusLabel: string;
    statusValue: string;
    errorLabel: string;
    timeDeltaLabel: string;
    toleranceLabel: string;
    tierLabel: string;
    retryButton: string;
    tierLabels: Record<ErrorTier, string>;
    quips: Record<ErrorTier, string[]>;
  };
  success: {
    title: string;
    /** タイトル下の短い達成コピー（任意） */
    subtitle: string;
    reportTitle: string;
    deltaLabel: string;
    toleranceLabel: string;
    confidenceLabel: string;
    probabilityLabel: string;
    sampleIdLabel: string;
    stageClearedLabel: string;
    nextToleranceLabel: string;
    timestampLabel: string;
    nextButton: string;
    completedImageAlt: string;
  };
  toast: {
    settingsSaved: string;
    runReset: string;
  };
};

export const pixelDropPuzzleJa: PixelDropPuzzleDict = {
  shell: {
    title: "極小ピクセル隙間落としパズル",
    description:
      "上空の縦棒をタイミングよく落とし、地表の隙間にハメる。判定は小数点以下のピクセル単位。",
  },
  install: {
    button: "📱 ホーム画面に追加",
    buttonShort: "追加",
    buttonAria: "ホーム画面に追加",
    modalTitle: "ホーム画面に追加",
    modalLead: "アプリのように独立した画面で、隙間に人生を捧げましょう。",
    step1Title: "共有ボタンをタップ",
    step1Body: "Safari下部（または上部）の共有アイコンをタップします。",
    step2Title: "「ホーム画面に追加」を選択",
    step2Body: "一覧から選んで追加すると、単独アプリとして起動できます。",
    desktopTitle: "アプリとしてインストール",
    desktopLead: "ブラウザのアドレスバーやメニューからインストールできます。",
    desktopStep1Title: "アドレスバーのアイコンを確認",
    desktopStep1Body: "インストール可能な場合、アドレスバー右側にアイコンが表示されます。",
    desktopStep2Title: "「インストール」を選択",
    desktopStep2Body: "確認ダイアログでインストールすると、独立ウィンドウで起動します。",
    modalClose: "閉じる",
  },
  upload: {
    title: "画像をアップロード",
    lead: "横長（16:9）の枠内で、使いたい部分を切り取ってパズルにします。",
    button: "画像を選択",
    buttonBusy: "読み込み中…",
    hint: "画像はブラウザ内でのみ処理されます（サーバー送信なし）。",
    changeButton: "画像を変更",
    errorInvalidFile: "画像の読み込みに失敗しました。別のファイルをお試しください。",
    cropTitle: "表示範囲を調整",
    cropLead: "ドラッグで位置、スライダーで拡大。枠内がパズルの地表になります。",
    cropZoomLabel: "拡大",
    cropConfirm: "この範囲で決定",
    cropCancel: "キャンセル",
    changeOverlayEyebrow: "PAUSE",
    changeOverlayTitle: "画像を変更",
    changeOverlayLead:
      "プレイはいったん停止しています。新しい画像を選び、16:9 の枠で切り取ってください。",
    changeOverlayResume: "プレイに戻る",
  },
  stage: {
    stageLabel: "STAGE",
    toleranceLabel: "許容誤差",
    bestStageLabel: "最高到達ステージ",
    bestErrorLabel: "自己ベスト誤差",
    bestErrorEmpty: "記録なし",
  },
  hud: {
    stopButton: "DROP",
    attemptsLabel: "生涯試行回数",
    resetButton: "進行状況をリセット",
    resetConfirm: "ステージ進行と記録をすべてリセットしますか？（画像は保持されます）",
    statusEyebrow: "NOW",
    archiveEyebrow: "ARCHIVE",
    lifeLabel: "LIFE",
    lifeUnit: "pt",
  },
  rules: {
    eyebrow: "BRIEFING",
    title: "実験プロトコル",
    lead: "極小の隙間へ棒を落とせ。誤差はライフを削り、尽きれば降格する。",
    step1: "上空の棒を、地表の極小の隙間へタイミングよく落とす。",
    step2: "落下のたびに、隙間とのX誤差（px）の絶対値だけライフが減る。",
    step3: "ライフが残ったまま許容誤差内にハメればクリア（ライフは全回復）。",
    step4: "クリア前にライフが尽きると、1つ前のステージへ強制降格する。",
    close: "START EXPERIMENT",
  },
  deplete: {
    title: "LIFE DEPLETED. DOWNGRADING STAGE...",
    body: "観測リソースが枯渇した。難易度を1段階下げてプロトコルを再開する。",
    stageLabel: "降格先",
    continueButton: "RESUME",
  },
  fail: {
    title: "位置ズレを検出",
    statusLabel: "ステータス",
    statusValue: "失敗",
    errorLabel: "誤差",
    timeDeltaLabel: "時間差",
    toleranceLabel: "許容誤差",
    tierLabel: "誤差分類",
    retryButton: "もう一度挑戦する",
    ...pixelDropPuzzleFailQuipsJa,
  },
  success: {
    title: "PERFECT ALIGNMENT ACHIEVED",
    subtitle: "完全整合を達成",
    reportTitle: "観測レポート",
    deltaLabel: "X方向ズレ",
    toleranceLabel: "許容誤差",
    confidenceLabel: "信頼度",
    probabilityLabel: "偶然一致確率",
    sampleIdLabel: "サンプルID",
    stageClearedLabel: "ステージクリア",
    nextToleranceLabel: "次の許容誤差",
    timestampLabel: "観測時刻",
    nextButton: "次のステージへ",
    completedImageAlt: "完成した画像",
  },
  toast: {
    settingsSaved: "画像を設定しました",
    runReset: "進行状況をリセットしました",
  },
};

export const pixelDropPuzzleEn: PixelDropPuzzleDict = {
  shell: {
    title: "Tiny Pixel Gap Drop Puzzle",
    description:
      "Drop the tall bar from high above into the ground gap. Judged to fractions of a pixel.",
  },
  install: {
    button: "📱 Add to Home Screen",
    buttonShort: "Add",
    buttonAria: "Add to Home Screen",
    modalTitle: "Add to Home Screen",
    modalLead: "Devote your life to the gap in its own dedicated window.",
    step1Title: "Tap the Share button",
    step1Body: "Tap the share icon in Safari's toolbar.",
    step2Title: "Choose \"Add to Home Screen\"",
    step2Body: "Select it from the list to launch this as a standalone app.",
    desktopTitle: "Install as an app",
    desktopLead: "Install directly from your browser's address bar or menu.",
    desktopStep1Title: "Check the address bar icon",
    desktopStep1Body: "If installable, an icon appears on the right side of the address bar.",
    desktopStep2Title: "Choose \"Install\"",
    desktopStep2Body: "Confirm the dialog to launch it in its own window.",
    modalClose: "Close",
  },
  upload: {
    title: "Upload an image",
    lead: "Crop any photo to a fixed 16:9 frame—that area becomes the puzzle ground.",
    button: "Choose image",
    buttonBusy: "Loading…",
    hint: "Processed entirely in your browser (nothing is ever uploaded).",
    changeButton: "Change image",
    errorInvalidFile: "Could not load that image. Please try a different file.",
    cropTitle: "Adjust the crop",
    cropLead: "Drag to reposition, use the slider to zoom. The frame is your puzzle ground.",
    cropZoomLabel: "Zoom",
    cropConfirm: "Use this crop",
    cropCancel: "Cancel",
    changeOverlayEyebrow: "PAUSE",
    changeOverlayTitle: "Change image",
    changeOverlayLead:
      "Gameplay is paused. Choose a new image and crop it to the 16:9 frame.",
    changeOverlayResume: "Back to game",
  },
  stage: {
    stageLabel: "STAGE",
    toleranceLabel: "TOLERANCE",
    bestStageLabel: "Best stage reached",
    bestErrorLabel: "Personal best error",
    bestErrorEmpty: "No record yet",
  },
  hud: {
    stopButton: "DROP",
    attemptsLabel: "Lifetime attempts",
    resetButton: "Reset progress",
    resetConfirm: "Reset all stage progress and records? (Your image is kept.)",
    statusEyebrow: "NOW",
    archiveEyebrow: "ARCHIVE",
    lifeLabel: "LIFE",
    lifeUnit: "pt",
  },
  rules: {
    eyebrow: "BRIEFING",
    title: "Experiment protocol",
    lead: "Drop the bar into a tiny gap. Error drains life. Empty life forces a downgrade.",
    step1: "Drop the bar from above into the ground's tiny gap.",
    step2: "Each drop subtracts the absolute X error (px) from your life.",
    step3: "Clear within tolerance while life remains (life fully restores).",
    step4: "If life hits zero before a clear, you are forced one stage down.",
    close: "START EXPERIMENT",
  },
  deplete: {
    title: "LIFE DEPLETED. DOWNGRADING STAGE...",
    body: "Observation resources exhausted. Downgrading difficulty by one stage.",
    stageLabel: "DOWNGRADE TO",
    continueButton: "RESUME",
  },
  fail: {
    title: "MISALIGNMENT DETECTED",
    statusLabel: "STATUS",
    statusValue: "FAILED",
    errorLabel: "ERROR",
    timeDeltaLabel: "TIME_DELTA",
    toleranceLabel: "TOLERANCE",
    tierLabel: "CLASSIFICATION",
    retryButton: "Try again",
    ...pixelDropPuzzleFailQuipsEn,
  },
  success: {
    title: "PERFECT ALIGNMENT ACHIEVED",
    subtitle: "Pixel-perfect seat confirmed",
    reportTitle: "OBSERVATION REPORT",
    deltaLabel: "DELTA-X",
    toleranceLabel: "TOLERANCE",
    confidenceLabel: "CONFIDENCE",
    probabilityLabel: "PROBABILITY",
    sampleIdLabel: "SAMPLE ID",
    stageClearedLabel: "STAGE CLEARED",
    nextToleranceLabel: "NEXT TOLERANCE",
    timestampLabel: "OBSERVED AT",
    nextButton: "Proceed to next stage",
    completedImageAlt: "Completed image",
  },
  toast: {
    settingsSaved: "Image set",
    runReset: "Progress has been reset",
  },
};
