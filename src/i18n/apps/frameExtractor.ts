import type { AppShellCopy } from "./otherApps";

export type FrameExtractorDict = {
  shell: AppShellCopy & { titleShort: string };
  dropHint: string;
  dropSub: string;
  openFile: string;
  clearVideo: string;
  unsupported: string;
  loadError: string;
  videoError: string;
  play: string;
  pause: string;
  frameBack: string;
  frameForward: string;
  seekBack01: string;
  seekForward01: string;
  seekBack1: string;
  seekForward1: string;
  speedLabel: string;
  speedValue: string;
  fpsLabel: string;
  fpsHint: string;
  frameLabel: string;
  resolutionLabel: string;
  nativeResNote: string;
  filmstripTitle: string;
  filmstripHint: string;
  filmstripPlaying: string;
  filmstripEmpty: string;
  filmstripFailed: string;
  saveFrame: string;
  saving: string;
  sharpnessToggle: string;
  formatLabel: string;
  formatPng: string;
  formatJpeg: string;
  formatWebp: string;
  qualityLabel: string;
  fpsAuto: string;
  captureOk: string;
  captureFail: string;
  burstTitle: string;
  burstHint: string;
  burstMarkIn: string;
  burstMarkOut: string;
  burstStart: string;
  burstEnd: string;
  burstCountLabel: string;
  burstCount: string;
  burstWarn: string;
  burstTooMany: string;
  burstZip: string;
  bursting: string;
  burstCancel: string;
  burstOk: string;
  burstFail: string;
  shortcutsTitle: string;
  shortcutPlay: string;
  shortcutFrame: string;
  shortcutHalf: string;
  shortcutSave: string;
  fullscreenEnter: string;
  fullscreenExit: string;
};

export const frameExtractorJa: FrameExtractorDict = {
  shell: {
    title: "コマ切り出し",
    titleShort: "コマ切り出し",
    description:
      "1フレーム単位で動画を送り、決定的な瞬間を画像として保存。処理はブラウザ内だけで完結します。",
  },
  dropHint: "動画ファイルをドロップ",
  dropSub:
    "またはクリックして選択。MP4 / WebM / MOV など。サーバーには送りません。",
  openFile: "別の動画",
  clearVideo: "閉じる",
  unsupported: "動画ファイルを選んでください（MP4 / WebM / MOV など）。",
  loadError: "ファイルの読み込みに失敗しました。",
  videoError:
    "この形式はブラウザで再生できません。MP4 または WebM で試してください。",
  play: "再生",
  pause: "一時停止",
  frameBack: "−1 コマ",
  frameForward: "＋1 コマ",
  seekBack01: "−0.1 秒",
  seekForward01: "＋0.1 秒",
  seekBack1: "−1 秒",
  seekForward1: "＋1 秒",
  speedLabel: "再生速度",
  speedValue: "{rate}×",
  fpsLabel: "コマ送り fps",
  fpsHint:
    "1コマの幅です。元動画が 60fps なら 60 を選ぶと送りが正確になります。",
  frameLabel: "フレーム {current} / {total}",
  resolutionLabel: "{width}×{height}",
  nativeResNote: "保存時は元の解像度のまま書き出します。",
  filmstripTitle: "前後フレーム",
  filmstripHint: "サムネイルをクリックすると、そのコマへ移動します。",
  filmstripPlaying: "一時停止すると、前後のコマが並びます。",
  filmstripEmpty: "フレームを準備しています…",
  filmstripFailed: "サムネイルの生成に失敗しました。再生できる位置で再試行してください。",
  saveFrame: "現在のフレームを保存",
  saving: "保存中…",
  sharpnessToggle: "✨ 輪郭をくっきりさせる（シャープネス）",
  formatLabel: "形式",
  formatPng: "PNG",
  formatJpeg: "JPEG",
  formatWebp: "WebP",
  qualityLabel: "画質",
  fpsAuto: "自動",
  captureOk: "画像を保存しました。",
  captureFail: "キャプチャに失敗しました。再生できる位置で再試行してください。",
  burstTitle: "連写（範囲を ZIP）",
  burstHint: "開始と終了を指定し、1コマずつ連番画像にして ZIP 保存します。",
  burstMarkIn: "開始に現在位置",
  burstMarkOut: "終了に現在位置",
  burstStart: "開始",
  burstEnd: "終了",
  burstCountLabel: "枚数",
  burstCount: "約 {count} 枚",
  burstWarn: "枚数が多いため、書き出しに時間がかかります。",
  burstTooMany: "{max} 枚を超える範囲は一度に書き出せません。範囲を狭めてください。",
  burstZip: "ZIP で連写保存",
  bursting: "書き出し中… {current} / {total}",
  burstCancel: "中止",
  burstOk: "{count} 枚を ZIP で保存しました。",
  burstFail: "連写の書き出しに失敗しました。",
  shortcutsTitle: "ショートカット",
  shortcutPlay: "Space：再生 / 一時停止",
  shortcutFrame: "← / →：1コマ戻る / 進む",
  shortcutHalf: "Shift + ← / →：0.5秒戻る / 進む",
  shortcutSave: "S：現在フレームを保存",
  fullscreenEnter: "全画面モード",
  fullscreenExit: "全画面を閉じる",
};

export const frameExtractorEn: FrameExtractorDict = {
  shell: {
    title: "Frame Extractor",
    titleShort: "Frames",
    description:
      "Step a video one frame at a time and save the exact moment as an image—entirely in the browser.",
  },
  dropHint: "Drop a video file",
  dropSub: "Or click to choose. MP4 / WebM / MOV, etc. Nothing is uploaded.",
  openFile: "Another video",
  clearVideo: "Close",
  unsupported: "Please choose a video file (MP4 / WebM / MOV, etc.).",
  loadError: "Failed to load the file.",
  videoError: "This format can’t play in your browser. Try MP4 or WebM.",
  play: "Play",
  pause: "Pause",
  frameBack: "−1 frame",
  frameForward: "+1 frame",
  seekBack01: "−0.1 s",
  seekForward01: "+0.1 s",
  seekBack1: "−1 s",
  seekForward1: "+1 s",
  speedLabel: "Speed",
  speedValue: "{rate}×",
  fpsLabel: "Step fps",
  fpsHint:
    "Size of one frame step. Pick 60 if the source is 60 fps for more accurate stepping.",
  frameLabel: "Frame {current} / {total}",
  resolutionLabel: "{width}×{height}",
  nativeResNote: "Exports keep the video’s native resolution.",
  filmstripTitle: "Nearby frames",
  filmstripHint: "Click a thumbnail to jump to that frame.",
  filmstripPlaying: "Pause to preview frames before and after.",
  filmstripEmpty: "Preparing frames…",
  filmstripFailed: "Failed to generate thumbnails. Try again at a playable position.",
  saveFrame: "Save current frame",
  saving: "Saving…",
  sharpnessToggle: "✨ Sharpen edges",
  formatLabel: "Format",
  formatPng: "PNG",
  formatJpeg: "JPEG",
  formatWebp: "WebP",
  qualityLabel: "Quality",
  fpsAuto: "Auto",
  captureOk: "Image saved.",
  captureFail: "Capture failed. Try again at a playable position.",
  burstTitle: "Burst (range as ZIP)",
  burstHint: "Set in/out points and export every frame as numbered images in a ZIP.",
  burstMarkIn: "Set in to now",
  burstMarkOut: "Set out to now",
  burstStart: "In",
  burstEnd: "Out",
  burstCountLabel: "Count",
  burstCount: "About {count} frames",
  burstWarn: "That’s a lot of frames—export may take a while.",
  burstTooMany: "Ranges over {max} frames can’t be exported at once. Narrow the range.",
  burstZip: "Save burst as ZIP",
  bursting: "Exporting… {current} / {total}",
  burstCancel: "Cancel",
  burstOk: "Saved {count} frames as a ZIP.",
  burstFail: "Burst export failed.",
  shortcutsTitle: "Shortcuts",
  shortcutPlay: "Space: play / pause",
  shortcutFrame: "← / →: back / forward 1 frame",
  shortcutHalf: "Shift + ← / →: back / forward 0.5 s",
  shortcutSave: "S: save current frame",
  fullscreenEnter: "Fullscreen mode",
  fullscreenExit: "Exit fullscreen",
};
