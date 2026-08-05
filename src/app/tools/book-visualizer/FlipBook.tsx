"use client";

// 3D フリップブック（DOM ＋ CSS 3D）。
// WebGL / canvas ではなく実 DOM をめくるので、本文テキストは既存の組版のまま鮮明に出る。
// ページの中身は編集画面と同じ BookSheet を、用紙実寸のまま transform: scale() で縮めて置く。
// （リフローさせないので文字数・行数が変わらず、文字切れが起きない）

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import HTMLFlipBook from "react-pageflip";

import BookSheet, { type Sheet } from "./BookSheet";
import type { PageMetrics } from "./metrics";
import type { PaginatedPage } from "./paginate";
import type { TocPageSlice } from "./toc";
import type { CoverType } from "./theme";
import { isSoloSpreadPageType, type BookData } from "./types";

/** react-pageflip が ref で返すもののうち、実際に使う部分だけ */
type FlipApi = {
  flipNext: () => void;
  flipPrev: () => void;
  flip: (page: number) => void;
  turnToPage: (page: number) => void;
  getCurrentPageIndex: () => number;
  getPageCount: () => number;
  getPage: (page: number) => { setDensity: (density: string) => void };
  getFlipController: () => {
    getCalculation: () => {
      getDirection: () => number;
      getFlippingProgress: () => number;
    } | null;
  };
  getPageCollection: () => {
    getCurrentSpreadIndex: () => number;
    getSpread: () => number[][];
  };
  destroy: () => void;
};

type FlipHandle = {
  pageFlip: () => FlipApi | undefined;
};

/** 親（ViewMode）から呼ぶページ送り */
export type FlipController = {
  /** 読み進める */
  next: () => void;
  /** 読み戻す */
  prev: () => void;
  /** 読み順のページ番号へ飛ぶ */
  goTo: (readIndex: number) => void;
};

type FlipBookProps = {
  book: BookData;
  metrics: PageMetrics;
  bodyPages: PaginatedPage[];
  sheets: Sheet[];
  /** 編集と同じ実測目次分割（無いときは BookSheet 側でフォールバック） */
  tocSlices?: TocPageSlice[];
  /** 右開き（縦書き和書など）。読み方向が右→左になる */
  rightToLeft: boolean;
  /** 表紙の硬さ（用紙テーマから渡す） */
  coverType: CoverType;
  /** デジタル表示（物理的な厚み・ノド影を抑える） */
  digital?: boolean;
  onChangeIndex: (readIndex: number) => void;
  /** 1 ページ表示（スマホ）かどうかを親へ伝える */
  onChangePortrait?: (portrait: boolean) => void;
  controllerRef: RefObject<FlipController | null>;
};

/** これ未満の幅では見開きをやめて 1 ページ表示にする */
const SPREAD_MIN_WIDTH = 768;
/** 見開きにすると単ページよりこれ以上小さくなるなら 1 ページ表示 */
const SPREAD_MIN_RATIO = 0.62;
/** 本のまわりの余白（厚み・落ち影・余白感） */
const STAGE_PADDING = 72;
/** 画面に対する本の最大占有率（少し小さめにする） */
const FIT_SCALE = 0.86;
/** 小口（紙の重なり）を何枚の影で描くか。枚数を固定するとアニメーションが滑らかになる */
const STACK_LAYERS = 10;
/** 小口の最大厚み（px）。総ページ数が多いほどこれに近づく */
const MAX_THICKNESS = 13;
/** ハードカバー板の見た目の厚み（本文の紙束より一歩手前に出す） */
const COVER_BOARD_THICKNESS = 7;
/** ページめくり時間（ms）。位置スライドもこれに合わせる */
const FLIP_MS_NORMAL = 780;
const FLIP_MS_DIGITAL = 420;

/** 静止時の単独表示側（表紙=右、裏表紙=左） */
function restSoloSide(
  flipPage: number,
  flipTotal: number,
  portrait: boolean,
): "left" | "right" | null {
  if (portrait || flipTotal === 0) return null;
  if (flipPage === 0) return "right";
  if (flipPage === flipTotal - 1) return "left";
  return null;
}

function soloOffsetX(
  side: "left" | "right" | null,
  pageWidth: number,
): number {
  if (side === "right") return -pageWidth / 2;
  if (side === "left") return pageWidth / 2;
  return 0;
}

/**
 * めくり開始時点の「行き先」オフセット。
 * 表紙↔見開きの移動を、めくり進行に同期してスライドさせる。
 */
function destinationOffsetX(api: FlipApi, pageWidth: number): number {
  try {
    const spreads = api.getPageCollection().getSpread();
    const spreadIndex = api.getPageCollection().getCurrentSpreadIndex();
    const calc = api.getFlipController().getCalculation();
    if (!calc || spreads.length === 0) return 0;
    const direction = calc.getDirection();
    // 表紙（先頭単独）から開く → 見開き中央へ
    if (spreadIndex === 0) return 0;
    // 裏表紙（末尾単独）から戻る → 見開き中央へ
    if (spreadIndex === spreads.length - 1) return 0;
    // 最初の見開きから表紙へ戻る
    if (direction === 1 && spreadIndex === 1) return -pageWidth / 2;
    // 最後の見開きから裏表紙へ進む
    if (direction === 0 && spreadIndex === spreads.length - 2) {
      return pageWidth / 2;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * 小口（紙束の側面）を多重 box-shadow で描く。
 * dir = 1 なら右へ、-1 なら左へ紙が積み重なって見える。
 * 影の枚数は固定し、オフセットだけを厚みで変えるので
 * ページをめくったときに厚みがなめらかに増減する。
 */
function edgeShadow(thickness: number, dir: 1 | -1): string {
  const layers: string[] = [];
  for (let i = 1; i <= STACK_LAYERS; i++) {
    const ratio = i / STACK_LAYERS;
    const x = dir * thickness * ratio;
    // 少しだけ下にずらすと紙が重なって見える
    const y = thickness * ratio * 0.5;
    // 奥へ行くほど暗く（紙の間に落ちる陰）
    const lightness = 96 - ratio * 24;
    layers.push(
      `${x.toFixed(2)}px ${y.toFixed(2)}px 0 hsl(38 24% ${lightness.toFixed(1)}%)`,
    );
  }
  // 本が置かれている面へ落ちる控えめな影
  layers.push(
    `${(dir * thickness).toFixed(2)}px 14px 24px -12px rgba(0, 0, 0, 0.3)`,
  );
  return layers.join(", ");
}

/**
 * ハードカバーの「板」小口。
 * 紙の積層より段が少なく、色も濃くして厚板感を出す。
 */
function boardEdgeShadow(thickness: number, dir: 1 | -1): string {
  const layers: string[] = [];
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const ratio = i / steps;
    const x = dir * thickness * ratio;
    const y = thickness * ratio * 0.55;
    // 表紙ボードらしい茶系（奥ほど暗い）
    const lightness = 42 - ratio * 16;
    layers.push(
      `${x.toFixed(2)}px ${y.toFixed(2)}px 0 hsl(30 18% ${lightness.toFixed(1)}%)`,
    );
  }
  layers.push(
    `${(dir * thickness * 0.6).toFixed(2)}px ${(thickness * 0.8).toFixed(2)}px 10px -2px rgba(0, 0, 0, 0.28)`,
  );
  return layers.join(", ");
}

type FlipPageProps = {
  /** 表示上のページ寸法（px） */
  width: number;
  height: number;
  /** 用紙実寸 → 表示寸法への縮小率 */
  scale: number;
  sheetWidth: number;
  sheetHeight: number;
  /** 表紙・裏表紙は硬い紙として扱う */
  hard: boolean;
  /** 透明な遊び紙（見開き合わせ用） */
  dummy?: boolean;
  children?: ReactNode;
};

/** フリップ用の 1 枚（実ページ or 遊び紙） */
type FlipEntry =
  | { kind: "sheet"; sheet: Sheet; readIndex: number }
  | { kind: "dummy"; id: string };

/**
 * showCover 用のページ列を組む。
 *
 * 目指す見開き:
 *   [[表紙], [2ページ目, 3ページ目], …, [裏表紙]]
 *
 * - 表紙を開いた直後は本文の見開き（遊び紙なし）
 * - 裏表紙を単独にするため、総枚数が奇数になるときだけ末尾手前に遊び紙を足す
 *   （showCover では偶数枚のとき末尾が単独になる）
 */
function buildFlipEntries(sheets: Sheet[]): FlipEntry[] {
  if (sheets.length === 0) return [];
  if (sheets.length === 1) {
    return [{ kind: "sheet", sheet: sheets[0], readIndex: 0 }];
  }

  const entries: FlipEntry[] = [
    { kind: "sheet", sheet: sheets[0], readIndex: 0 },
  ];
  const lastIndex = sheets.length - 1;
  for (let i = 1; i < lastIndex; i++) {
    entries.push({ kind: "sheet", sheet: sheets[i], readIndex: i });
  }

  // [cover, ...middle] が偶数 → 裏表紙を足すと奇数になり末尾がペアになるので挟む
  if (entries.length % 2 === 0) {
    entries.push({ kind: "dummy", id: "flyleaf-pad" });
  }

  entries.push({
    kind: "sheet",
    sheet: sheets[lastIndex],
    readIndex: lastIndex,
  });
  return entries;
}

function entryKey(entry: FlipEntry): string {
  if (entry.kind === "dummy") return `dummy-${entry.id}`;
  return sheetKey(entry.sheet);
}

function sheetKey(sheet: Sheet): string {
  return sheet.kind === "page"
    ? `page-${sheet.page?.id ?? sheet.pageIndex}`
    : `body-${sheet.columnIndex}`;
}

/** 読み順 → ライブラリ内のページ番号 */
function readToLibraryIndex(
  readIndex: number,
  entries: FlipEntry[],
): number {
  const found = entries.findIndex(
    (entry) => entry.kind === "sheet" && entry.readIndex === readIndex,
  );
  return found >= 0 ? found : 0;
}

/** ライブラリ内のページ番号 → 読み順（遊び紙なら隣の実ページ） */
function libraryToReadIndex(
  libraryIndex: number,
  entries: FlipEntry[],
  sheetCount: number,
): number {
  const direct = entries[libraryIndex];
  if (direct?.kind === "sheet") return direct.readIndex;
  for (let i = libraryIndex - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry?.kind === "sheet") return entry.readIndex;
  }
  for (let i = libraryIndex + 1; i < entries.length; i++) {
    const entry = entries[i];
    if (entry?.kind === "sheet") return entry.readIndex;
  }
  return Math.max(0, Math.min(sheetCount - 1, libraryIndex));
}

/**
 * フリップブックの 1 枚。
 * react-pageflip が ref 経由で実 DOM を受け取るため forwardRef で公開する。
 */
const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>(function FlipPage(
  { width, height, scale, sheetWidth, sheetHeight, hard, dummy, children },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`bv-flip-page ${hard ? "bv-flip-page--hard" : ""} ${
        dummy ? "bv-flip-page--dummy" : ""
      }`}
      /*
       * ライブラリ密度は常に soft。
       * hard だと表紙へ戻るとき flipping/bottom が同一 DOM になり
       * （クローン不可）めくりが壊れる。硬い見た目は CSS クラスで出す。
       */
      data-density="soft"
      style={{ width, height }}
    >
      {dummy ? null : (
        <div
          className="bv-flip-page__sheet"
          style={{
            width: sheetWidth,
            height: sheetHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
});

/**
 * ハードカバーテーマのときだけ、表紙・裏表紙を硬い紙にする。
 * ソフトカバーではしなる紙として扱う。
 */
function isHardEntry(
  entry: FlipEntry,
  position: number,
  total: number,
  coverType: CoverType,
): boolean {
  if (coverType !== "hard") return false;
  if (entry.kind === "dummy") return false;
  if (position === 0 || position === total - 1) return true;
  if (entry.sheet.kind !== "page" || !entry.sheet.page) return false;
  return isSoloSpreadPageType(entry.sheet.page.pageType);
}

/**
 * showCover は load 時に表紙・裏表紙を hard に固定する。
 * それを必ず soft に戻す。
 *
 * hard のままだと表紙へ戻るアニメで flippingPage と bottomPage が
 * 同じ DOM を共有し（hard はクローンしない）、表示が壊れる。
 */
function applySoftDensity(api: FlipApi) {
  try {
    const count = api.getPageCount();
    for (let i = 0; i < count; i++) {
      api.getPage(i).setDensity("soft");
    }
  } catch {
    // 破棄直後などは無視
  }
}

function tryApplySoftDensity(flipRef: RefObject<FlipHandle | null>) {
  const api = flipRef.current?.pageFlip();
  if (!api) return false;
  try {
    if (api.getPageCount() <= 0) return false;
    applySoftDensity(api);
    return true;
  } catch {
    return false;
  }
}

export default function FlipBook({
  book,
  metrics,
  bodyPages,
  sheets,
  tocSlices,
  rightToLeft,
  coverType,
  digital = false,
  onChangeIndex,
  onChangePortrait,
  controllerRef,
}: FlipBookProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  // react-pageflip の型は any なので、使うメソッドだけ絞って扱う
  const flipRef = useRef<FlipHandle | null>(null);
  const [area, setArea] = useState({ width: 0, height: 0 });
  // サイズ変更でフリップブックを作り直すとき、読み位置を引き継ぐために保持する
  const [readIndex, setReadIndex] = useState(0);
  /** ライブラリ内のページ番号（遊び紙含む） */
  const [flipPage, setFlipPage] = useState(0);
  /** ドラッグ／自動めくり中（角のめくれは含めない） */
  const [isFlipping, setIsFlipping] = useState(false);
  /** ステージの横位置（表紙中央 ↔ 見開き中央）。めくり進行に同期して更新する */
  const [stageOffsetX, setStageOffsetX] = useState(0);
  /**
   * 空半面マスク・ページ非表示用。
   * 位置スライド中は外し、カールが切れないようにする。
   * 静止時の単独表示だけ付ける。
   */
  const [maskSolo, setMaskSolo] = useState<"left" | "right" | null>(null);
  // react-pageflip はハンドラを pages 変更時だけ付け直すため、常に最新処理へ委譲する
  const syncPageRef = useRef<(libraryPage: number) => void>(() => undefined);
  const flipTotalRef = useRef(0);
  const pageWidthRef = useRef(0);
  const stageOffsetRef = useRef(0);
  const isFlippingRef = useRef(false);
  const offsetAnimRef = useRef<{ from: number; to: number } | null>(null);
  const handleStateRef = useRef<(state: string) => void>(() => undefined);
  const stageElRef = useRef<HTMLDivElement | null>(null);

  /** 見開き→単ページへ閉じるときの残像マスクを進行度に同期 */
  function syncClosingMask(to: number, progress: number) {
    const stage = stageElRef.current;
    if (!stage) return;
    if (to < -1) {
      // 表紙（右単独）へ戻る → 左半面の見開き残像を消す
      stage.dataset.closing = "right";
      stage.style.setProperty("--bv-close-progress", progress.toFixed(3));
    } else if (to > 1) {
      // 裏表紙（左単独）へ進む → 右半面の見開き残像を消す
      stage.dataset.closing = "left";
      stage.style.setProperty("--bv-close-progress", progress.toFixed(3));
    } else {
      delete stage.dataset.closing;
      stage.style.setProperty("--bv-close-progress", "0");
    }
  }

  useEffect(() => {
    const element = areaRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setArea({ width: rect.width, height: rect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /** 実ページ数（UI のページ番号用） */
  const sheetTotal = sheets.length;

  /**
   * 読み順で遊び紙を挟み、右開きなら配列を反転する。
   * 反転すると和書の「左をめくって進む」がライブラリ標準の動きになる。
   */
  const flipEntries = useMemo(() => {
    const reading = buildFlipEntries(sheets);
    return rightToLeft ? [...reading].reverse() : reading;
  }, [sheets, rightToLeft]);

  const flipTotal = flipEntries.length;
  flipTotalRef.current = flipTotal;

  // 見開き / 単ページの判定と、用紙を画面に収める倍率
  const availWidth = Math.max(1, area.width - STAGE_PADDING * 2);
  const availHeight = Math.max(1, area.height - STAGE_PADDING * 2);
  const singleScale = Math.min(
    availWidth / metrics.width,
    availHeight / metrics.height,
  );
  const spreadScale = Math.min(
    availWidth / (metrics.width * 2),
    availHeight / metrics.height,
  );
  const portrait =
    area.width > 0 &&
    (area.width < SPREAD_MIN_WIDTH ||
      spreadScale < singleScale * SPREAD_MIN_RATIO);

  const scale = Math.max(
    0.1,
    Math.min(2, (portrait ? singleScale : spreadScale) * FIT_SCALE),
  );
  const pageWidth = Math.max(40, Math.round(metrics.width * scale));
  const pageHeight = Math.max(40, Math.round(metrics.height * scale));
  // 見開き時もライブラリは常に「2 ページ分の幅」でレイアウトする。
  // 表紙・裏表紙は showCover で片側だけ使う（空いた半面は CSS で消す）。
  const bookWidth = portrait ? pageWidth : pageWidth * 2;

  useEffect(() => {
    if (area.width > 0) onChangePortrait?.(portrait);
  }, [portrait, area.width, onChangePortrait]);

  const toFlipIndex = useCallback(
    (position: number) => readToLibraryIndex(position, flipEntries),
    [flipEntries],
  );

  /** ライブラリのページ番号を読み順と UI 状態へ反映する */
  const syncFromLibraryPage = useCallback(
    (libraryPage: number) => {
      if (!Number.isFinite(libraryPage) || flipTotal === 0) return;
      const clamped = Math.max(
        0,
        Math.min(flipTotal - 1, Math.round(libraryPage)),
      );
      setFlipPage(clamped);
      const next = libraryToReadIndex(clamped, flipEntries, sheetTotal);
      setReadIndex(next);
      onChangeIndex(next);
    },
    [flipEntries, flipTotal, onChangeIndex, sheetTotal],
  );
  syncPageRef.current = syncFromLibraryPage;

  const flipMs = digital ? FLIP_MS_DIGITAL : FLIP_MS_NORMAL;
  pageWidthRef.current = pageWidth;
  stageOffsetRef.current = stageOffsetX;

  /** 静止時の単独側（マスク・小口用）。スライド中は maskSolo を使う */
  const restSolo = restSoloSide(flipPage, flipTotal, portrait);

  // ページ変更で静止したときの位置・マスクを合わせる（めくり中は触らない）
  useEffect(() => {
    if (isFlipping) return;
    const side = restSoloSide(flipPage, flipTotal, portrait);
    const next = soloOffsetX(side, pageWidth);
    setStageOffsetX(next);
    stageOffsetRef.current = next;
    setMaskSolo(side);
    offsetAnimRef.current = null;
  }, [flipPage, flipTotal, portrait, pageWidth, isFlipping]);

  /**
   * めくり中はライブラリの進行度に合わせてステージをスライドさせる。
   * 見開き→単ページへ閉じるときは、空になる半面の見開き残像も同時に消す。
   */
  useEffect(() => {
    if (!isFlipping || portrait) return;
    let raf = 0;
    const tick = () => {
      const anim = offsetAnimRef.current;
      const api = flipRef.current?.pageFlip();
      const calc = api?.getFlipController().getCalculation() ?? null;
      if (anim && calc) {
        const progress = Math.min(
          1,
          Math.max(0, calc.getFlippingProgress() / 100),
        );
        const next = anim.from + (anim.to - anim.from) * progress;
        stageOffsetRef.current = next;
        setStageOffsetX(next);
        // 残像マスクは位置スライドより少し早めに濃くする
        syncClosingMask(anim.to, Math.min(1, progress * 1.35));
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      syncClosingMask(0, 0);
    };
  }, [isFlipping, portrait]);

  handleStateRef.current = (state: string) => {
    const dragging = state === "flipping" || state === "user_fold";
    // fold_corner（角のめくれ）では位置を動かさない（表紙がカクつく原因になる）
    if (dragging) {
      if (!isFlippingRef.current) {
        isFlippingRef.current = true;
        setIsFlipping(true);
        // スライド開始と同時にマスクを外し、カールが空半面へ入れるようにする
        setMaskSolo(null);
        const from = stageOffsetRef.current;
        offsetAnimRef.current = { from, to: from };
        // user_fold は start() より先に来るので、方向は次フレームで確定する
        window.requestAnimationFrame(() => {
          if (!isFlippingRef.current) return;
          const api = flipRef.current?.pageFlip();
          const to = api ? destinationOffsetX(api, pageWidthRef.current) : 0;
          offsetAnimRef.current = {
            from: stageOffsetRef.current,
            to,
          };
        });
      }
      return;
    }
    if (state === "read") {
      isFlippingRef.current = false;
      setIsFlipping(false);
      offsetAnimRef.current = null;
      syncClosingMask(0, 0);
      tryApplySoftDensity(flipRef);
      const api = flipRef.current?.pageFlip();
      if (!api) return;
      try {
        syncPageRef.current(api.getCurrentPageIndex());
      } catch {
        // 破棄直後などは無視
      }
    }
  };

  const stageWidth = portrait ? pageWidth : bookWidth;
  const soloSide = maskSolo;

  const stageClass = [
    "bv-flipbook-stage",
    portrait ? "bv-flipbook-stage--single" : "bv-flipbook-stage--spread",
    isFlipping ? "bv-flipbook-stage--flipping" : "",
    soloSide === "right" ? "bv-flipbook-stage--solo-right" : "",
    soloSide === "left" ? "bv-flipbook-stage--solo-left" : "",
    soloSide !== null ? "bv-flipbook-stage--solo" : "",
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * 小口（紙束）の厚み。
   * 読み進めるほど左が厚く、右が薄くなる現実の本と同じ変化をつける。
   * 右開きでもページ配列を反転済みなので、そのまま「画面上の左右」に一致する。
   */
  const maxThickness = Math.min(MAX_THICKNESS, Math.max(4, flipTotal * 0.55));
  const leftRatio = flipTotal <= 1 ? 0 : flipPage / (flipTotal - 1);
  const rightRatio = 1 - leftRatio;
  // 表紙クローズ時は右側に本文ぶんの束、裏表紙時は左側に束が見える
  const leftThickness = leftRatio * maxThickness;
  const rightThickness = rightRatio * maxThickness;
  // 単独の表紙・裏表紙では、閉じた本の束＋板の厚みが必ず見えるように下限を設ける
  const soloStackThickness = Math.max(maxThickness * 0.92, 8);
  const visibleLeftThickness =
    restSolo === "left" ? soloStackThickness : leftThickness;
  const visibleRightThickness =
    restSolo === "right" ? soloStackThickness : rightThickness;

  useEffect(() => {
    controllerRef.current = {
      next: () => {
        const flip = flipRef.current?.pageFlip();
        if (!flip) return;
        if (rightToLeft) flip.flipPrev();
        else flip.flipNext();
      },
      prev: () => {
        const flip = flipRef.current?.pageFlip();
        if (!flip) return;
        if (rightToLeft) flip.flipNext();
        else flip.flipPrev();
      },
      goTo: (position: number) => {
        const flip = flipRef.current?.pageFlip();
        if (!flip) return;
        flip.flip(toFlipIndex(position));
      },
    };
    const ref = controllerRef;
    return () => {
      ref.current = null;
    };
  }, [controllerRef, rightToLeft, toFlipIndex]);

  /** 寸法や向きが変わったら作り直す（ライブラリ側にサイズ変更 API がないため） */
  const flipKey = `${flipTotal}-${pageWidth}-${pageHeight}-${
    portrait ? "p" : "l"
  }-${rightToLeft ? "rtl" : "ltr"}-${coverType}-${digital ? "d" : "p"}`;

  const showBoard =
    coverType === "hard" && !digital && restSolo !== null && !isFlipping;

  // 作り直し時は、いまの読み位置に対応するライブラリページから再開する
  useEffect(() => {
    setFlipPage(toFlipIndex(readIndex));
    // flipKey 変更時だけ初期化する（readIndex の通常更新では動かさない）
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flipKey をトリガーにする
  }, [flipKey]);

  // react-pageflip は後片付けをしないので、作り直す前に自分で破棄する
  useEffect(() => {
    const handle = flipRef.current;
    return () => {
      try {
        handle?.pageFlip()?.destroy();
      } catch {
        // すでに DOM が外れている場合は何もしない
      }
    };
  }, [flipKey]);

  /**
   * react-pageflip は loadFromHTML のあとでイベントハンドラを付けるため、
   * onInit では密度上書きが間に合わない。マウント後に繰り返し適用する。
   */
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const tick = () => {
      if (cancelled) return;
      if (tryApplySoftDensity(flipRef) || attempts >= 20) return;
      attempts += 1;
      window.setTimeout(tick, 32);
    };
    const id = window.setTimeout(tick, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [flipKey]);

  // 中身は閲覧中に変わらないので、ページ要素はサイズが変わるまで使い回す
  const pages = useMemo(
    () =>
      flipEntries.map((entry, position) => (
        <FlipPage
          key={entryKey(entry)}
          width={pageWidth}
          height={pageHeight}
          scale={scale}
          sheetWidth={metrics.width}
          sheetHeight={metrics.height}
          hard={isHardEntry(entry, position, flipEntries.length, coverType)}
          dummy={entry.kind === "dummy"}
        >
          {entry.kind === "sheet" ? (
            <BookSheet
              sheet={entry.sheet}
              book={book}
              metrics={metrics}
              bodyPages={bodyPages}
              tocSlices={tocSlices}
            />
          ) : null}
        </FlipPage>
      )),
    [
      flipEntries,
      pageWidth,
      pageHeight,
      scale,
      metrics,
      book,
      bodyPages,
      tocSlices,
      coverType,
    ],
  );

  if (sheetTotal === 0 || flipTotal === 0) return null;

  return (
    <div ref={areaRef} className="bv-flipbook-area">
      {area.width > 0 ? (
        <div
          ref={stageElRef}
          className={stageClass}
          style={{
            width: stageWidth,
            height: pageHeight,
            transform: `translateX(${stageOffsetX}px)`,
            ["--bv-close-progress" as string]: 0,
          }}
        >
          {/* ハードカバーの板（静止時の hard テーマだけ） */}
          {showBoard && restSolo === "right" ? (
            <div
              className="bv-flipbook-board bv-flipbook-board--right"
              style={{ boxShadow: boardEdgeShadow(COVER_BOARD_THICKNESS, 1) }}
              aria-hidden
            />
          ) : null}
          {showBoard && restSolo === "left" ? (
            <div
              className="bv-flipbook-board bv-flipbook-board--left"
              style={{ boxShadow: boardEdgeShadow(COVER_BOARD_THICKNESS, -1) }}
              aria-hidden
            />
          ) : null}
          {/*
           * 小口（紙束）。デジタルテーマでは出さない。
           * 見開き時は左右それぞれの残りページ数ぶん。
           * 表紙・裏表紙の単独時は、閉じた本の束をカバーの下に厚く出す。
           */}
          {!digital && restSolo === null && leftThickness > 0.2 ? (
            <div
              className="bv-flipbook-stack bv-flipbook-stack--left"
              style={{ boxShadow: edgeShadow(visibleLeftThickness, -1) }}
              aria-hidden
            />
          ) : null}
          {!digital && restSolo === null && rightThickness > 0.2 ? (
            <div
              className="bv-flipbook-stack bv-flipbook-stack--right"
              style={{ boxShadow: edgeShadow(visibleRightThickness, 1) }}
              aria-hidden
            />
          ) : null}
          {!digital && !isFlipping && restSolo === "right" ? (
            <div
              className="bv-flipbook-stack bv-flipbook-stack--right bv-flipbook-stack--under-cover"
              style={{ boxShadow: edgeShadow(visibleRightThickness, 1) }}
              aria-hidden
            />
          ) : null}
          {!digital && !isFlipping && restSolo === "left" ? (
            <div
              className="bv-flipbook-stack bv-flipbook-stack--left bv-flipbook-stack--under-cover"
              style={{ boxShadow: edgeShadow(visibleLeftThickness, -1) }}
              aria-hidden
            />
          ) : null}
          <div
            className="bv-flipbook-inner"
            style={{
              width: bookWidth,
              height: pageHeight,
            }}
          >
            <HTMLFlipBook
              key={flipKey}
              ref={flipRef}
              className="bv-flipbook"
              style={{}}
              startPage={toFlipIndex(readIndex)}
              size="fixed"
              width={pageWidth}
              height={pageHeight}
              minWidth={pageWidth}
              maxWidth={pageWidth}
              minHeight={pageHeight}
              maxHeight={pageHeight}
              drawShadow={!digital}
              flippingTime={flipMs}
              usePortrait={portrait}
              startZIndex={0}
              // 親を 100% 伸縮させない（当たり判定が本の枠より大きくなるのを防ぐ）
              autoSize={false}
              // めくり中の重なり影（デジタルはフラットにするため 0）
              maxShadowOpacity={digital ? 0 : 0.72}
              // 表紙・裏表紙を見開きにせず単独表示する
              showCover={true}
              mobileScrollSupport={false}
              clickEventForward={false}
              useMouseEvents
              swipeDistance={24}
              showPageCorners={!digital}
              disableFlipByClick={false}
              renderOnlyPageLengthChange
              onInit={() => {
                tryApplySoftDensity(flipRef);
              }}
              onUpdate={() => {
                tryApplySoftDensity(flipRef);
              }}
              onFlip={(event: { data: number }) => {
                syncPageRef.current(event.data);
              }}
              onChangeState={(event: { data: string }) => {
                handleStateRef.current(event.data);
              }}
            >
              {pages}
            </HTMLFlipBook>
          </div>
          {/* 空半面を背景色で隠し、表紙・裏表紙を単ページとして見せる */}
          {soloSide === "right" ? (
            <div
              className="bv-flipbook-solo-mask bv-flipbook-solo-mask--left"
              aria-hidden
            />
          ) : null}
          {soloSide === "left" ? (
            <div
              className="bv-flipbook-solo-mask bv-flipbook-solo-mask--right"
              aria-hidden
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
