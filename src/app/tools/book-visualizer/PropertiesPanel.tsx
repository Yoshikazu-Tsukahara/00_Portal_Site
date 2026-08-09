"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BookOpen,
  Columns2,
  Expand,
  FileText,
  Frame,
  Hash,
  Heading1,
  Layers,
  ListTree,
  MoveDown,
  MoveUp,
  Pilcrow,
  Proportions,
  Replace,
  Rows3,
  Ruler,
  SlidersHorizontal,
  Text,
  Trash2,
  Type,
  User,
} from "lucide-react";

import { fmt, useI18n } from "@/i18n";
import {
  BOOK_FONT_IDS,
  BOOK_FONTS,
  defaultLevelFonts,
  type BookFontId,
} from "./fonts";
import type { LayerAction } from "./layers";
import { computePageMetrics } from "./metrics";
import {
  getBookBinding,
  getPaperPreset,
  PAPER_SIZE_IDS,
  type PaperSizeId,
} from "./paper";
import VariablesPanel from "./VariablesPanel";
import {
  BOOK_LAYOUTS,
  CHROME_ALIGNS,
  FORMAT_LIMITS,
  HEADER_MODES,
  FREE_TEXT_WRITING_MODES,
  isFreeBlock,
  PAGE_TYPES,
  SPREAD_HEADER_PLACEMENTS,
  usedPageTypes,
  TEXT_LEVELS,
  TOC_DEPTHS,
  canAssignCoverOrBackCover,
  canShowHeaderOnPageType,
  isUniquePageTypeTaken,
  type Block,
  type BookData,
  type BookFormat,
  type BookLayout,
  type BookPage,
  type ChromeAlign,
  type FreeTextWritingMode,
  type HeaderMode,
  type PageType,
  type SpreadHeaderPlacement,
  type TextLevel,
  type TocDepth,
} from "./types";

type PanelTab = "format" | "page" | "block" | "variables";

type PropertiesPanelProps = {
  book: BookData;
  /** 本文ストリーム選択中は null */
  currentPage: BookPage | null;
  onChangeBook: (patch: Partial<BookData>) => void;
  onChangeFormat: (patch: Partial<BookFormat>) => void;
  onChangePage: (patch: Partial<Pick<BookPage, "pageType">>) => void;
  selectedBlock: Block | null;
  onChangeLevel: (level: TextLevel) => void;
  onChangeCaption: (caption: string) => void;
  onChangeFontScale: (fontScale: number) => void;
  onChangeWritingMode: (writingMode: FreeTextWritingMode) => void;
  /** 自由文字ボックス個別の書体 */
  onChangeBlockFontFamily: (fontFamily: BookFontId) => void;
  onReplaceImage: () => void;
  onFullBleed: () => void;
  onLayerAction: (action: LayerAction) => void;
  onMoveBlock: (delta: number) => void;
  onRemoveBlock: () => void;
};

/** 設定 1 項目のラベル（アイコン＋文字） */
function FieldLabel({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="bv-ui-label">
      {icon}
      {children}
    </span>
  );
}

/** 書体ドロップダウン（章・節・本文・自由文字で共用） */
function FontFamilySelect({
  label,
  icon,
  value,
  groupJapanese,
  groupLatin,
  onChange,
}: {
  label: string;
  icon?: ReactNode;
  value: BookFontId;
  groupJapanese: string;
  groupLatin: string;
  onChange: (value: BookFontId) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as BookFontId)}
        className="bv-ui-field"
        style={{ fontFamily: BOOK_FONTS[value]?.cssFamily }}
      >
        <optgroup label={groupJapanese}>
          {BOOK_FONT_IDS.filter(
            (id) => BOOK_FONTS[id].script === "japanese",
          ).map((id) => (
            <option
              key={id}
              value={id}
              style={{ fontFamily: BOOK_FONTS[id].cssFamily }}
            >
              {BOOK_FONTS[id].label}
            </option>
          ))}
        </optgroup>
        <optgroup label={groupLatin}>
          {BOOK_FONT_IDS.filter((id) => BOOK_FONTS[id].script === "latin").map(
            (id) => (
              <option
                key={id}
                value={id}
                style={{ fontFamily: BOOK_FONTS[id].cssFamily }}
              >
                {BOOK_FONTS[id].label}
              </option>
            ),
          )}
        </optgroup>
      </select>
    </label>
  );
}

/** 数値スライダー＋直接入力の 1 行 */
function NumberField({
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  icon?: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="flex items-center justify-between gap-2">
        <FieldLabel icon={icon}>{label}</FieldLabel>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="bv-ui-field bv-ui-field--num bv-ui-field--fixed"
        />
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="bv-ui-range"
      />
    </label>
  );
}

/** ホイールで増減できるコンパクトな数値入力 */
function WheelNumberInput({
  label,
  value,
  min,
  max,
  wheelHint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  wheelHint: string;
  onChange: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const element = inputRef.current;
    if (!element) return;

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      const current = Number(element!.value);
      const base = Number.isFinite(current) ? current : value;
      const next = Math.min(
        max,
        Math.max(min, base + (event.deltaY < 0 ? 1 : -1)),
      );
      if (next !== base) onChangeRef.current(next);
    }

    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [min, max, value]);

  return (
    <label className="flex min-w-0 items-center gap-1.5">
      <span className="w-4 shrink-0 text-[11px] font-medium text-zinc-400">
        {label}
      </span>
      <input
        ref={inputRef}
        type="number"
        value={value}
        min={min}
        max={max}
        step={1}
        title={wheelHint}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(max, Math.max(min, next)));
        }}
        className="bv-ui-field bv-ui-field--num"
      />
    </label>
  );
}

/** 余白：数値のみ＋上下／左右の連動 */
function MarginFields({
  format,
  labels,
  onChangeFormat,
}: {
  format: BookFormat;
  labels: {
    margins: string;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    marginsHint: string;
    marginLinkVertical: string;
    marginLinkHorizontal: string;
    marginWheelHint: string;
  };
  onChangeFormat: (patch: Partial<BookFormat>) => void;
}) {
  const { min, max } = FORMAT_LIMITS.margin;
  const [linkVertical, setLinkVertical] = useState(
    format.marginTop === format.marginBottom,
  );
  const [linkHorizontal, setLinkHorizontal] = useState(
    format.marginLeft === format.marginRight,
  );

  function clamp(value: number) {
    return Math.min(max, Math.max(min, value));
  }

  function changeTop(value: number) {
    const marginTop = clamp(value);
    onChangeFormat(
      linkVertical ? { marginTop, marginBottom: marginTop } : { marginTop },
    );
  }

  function changeBottom(value: number) {
    const marginBottom = clamp(value);
    onChangeFormat(
      linkVertical
        ? { marginTop: marginBottom, marginBottom }
        : { marginBottom },
    );
  }

  function changeLeft(value: number) {
    const marginLeft = clamp(value);
    onChangeFormat(
      linkHorizontal ? { marginLeft, marginRight: marginLeft } : { marginLeft },
    );
  }

  function changeRight(value: number) {
    const marginRight = clamp(value);
    onChangeFormat(
      linkHorizontal
        ? { marginLeft: marginRight, marginRight }
        : { marginRight },
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <FieldLabel icon={<Ruler className="size-4" aria-hidden />}>
          {labels.margins}
        </FieldLabel>
        <span className="text-[10px] text-zinc-500">
          {labels.marginWheelHint}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-300">
          <input
            type="checkbox"
            checked={linkVertical}
            onChange={(event) => {
              const linked = event.target.checked;
              setLinkVertical(linked);
              if (linked) {
                onChangeFormat({ marginBottom: format.marginTop });
              }
            }}
            className="bv-ui-check"
          />
          {labels.marginLinkVertical}
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-300">
          <input
            type="checkbox"
            checked={linkHorizontal}
            onChange={(event) => {
              const linked = event.target.checked;
              setLinkHorizontal(linked);
              if (linked) {
                onChangeFormat({ marginRight: format.marginLeft });
              }
            }}
            className="bv-ui-check"
          />
          {labels.marginLinkHorizontal}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
        <WheelNumberInput
          label={labels.marginTop}
          value={format.marginTop}
          min={min}
          max={max}
          wheelHint={labels.marginWheelHint}
          onChange={changeTop}
        />
        <WheelNumberInput
          label={labels.marginBottom}
          value={format.marginBottom}
          min={min}
          max={max}
          wheelHint={labels.marginWheelHint}
          onChange={changeBottom}
        />
        <WheelNumberInput
          label={labels.marginLeft}
          value={format.marginLeft}
          min={min}
          max={max}
          wheelHint={labels.marginWheelHint}
          onChange={changeLeft}
        />
        <WheelNumberInput
          label={labels.marginRight}
          value={format.marginRight}
          min={min}
          max={max}
          wheelHint={labels.marginWheelHint}
          onChange={changeRight}
        />
      </div>

      <p className="bv-ui-hint">{labels.marginsHint}</p>
    </div>
  );
}

/** 2〜3 個の択一ボタン */
function Segmented<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon?: ReactNode;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <div
        className="bv-ui-seg"
        style={
          {
            "--bv-seg-count": options.length,
            "--bv-seg-index": activeIndex,
          } as CSSProperties
        }
      >
        <span className="bv-ui-seg__thumb" aria-hidden />
        {options.map((option) => {
          const active = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={active}
              data-active={active}
              className="bv-ui-seg__item"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function pageTypeLabel(
  pageType: PageType,
  labels: {
    pageTypeStandard: string;
    pageTypeCover: string;
    pageTypeBackCover: string;
    pageTypeTitlePage: string;
    pageTypeToc: string;
  },
): string {
  switch (pageType) {
    case "cover":
      return labels.pageTypeCover;
    case "backCover":
      return labels.pageTypeBackCover;
    case "titlePage":
      return labels.pageTypeTitlePage;
    case "toc":
      return labels.pageTypeToc;
    default:
      return labels.pageTypeStandard;
  }
}

/** 右側のプロパティパネル：書式 / ページ / ブロック / 名前変換 */
export default function PropertiesPanel({
  book,
  currentPage,
  onChangeBook,
  onChangeFormat,
  onChangePage,
  selectedBlock,
  onChangeLevel,
  onChangeCaption,
  onChangeFontScale,
  onChangeWritingMode,
  onChangeBlockFontFamily,
  onReplaceImage,
  onFullBleed,
  onLayerAction,
  onMoveBlock,
  onRemoveBlock,
}: PropertiesPanelProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const [tab, setTab] = useState<PanelTab>("format");
  const metrics = computePageMetrics(book.layout, book.format);
  const freeSelected = selectedBlock && isFreeBlock(selectedBlock);

  // ブロックを選んだらブロックタブへ（設定欄の開閉は変えない）
  useEffect(() => {
    if (!selectedBlock) return;
    setTab("block");
  }, [selectedBlock?.id]);
  // 本文ストリームがあるときは「標準」も表に出す（固定ページが無くても柱・ノンブルを設定できる）
  const activePageTypes = (() => {
    const used = new Set(usedPageTypes(book.pages));
    if (book.body.length > 0) used.add("standard");
    return PAGE_TYPES.filter((type) => used.has(type));
  })();
  const anyFolioOn = activePageTypes.some(
    (type) => book.format.folioOnPageTypes[type],
  );
  const headerChecksEnabled = book.format.headerMode !== "none";
  /** 本文ページ選択中は標準ページ扱い（柱などの詳細設定を出す） */
  const focusPageType: PageType = currentPage?.pageType ?? "standard";

  function toggleChromeFlag(
    key: "headerOnPageTypes" | "folioOnPageTypes" | "countInTotalPageTypes",
    pageType: PageType,
    checked: boolean,
  ) {
    // 本文以外に柱は付けられない
    if (key === "headerOnPageTypes" && !canShowHeaderOnPageType(pageType)) {
      return;
    }
    const nextFlags = { ...book.format[key], [pageType]: checked };
    // 総ページ数から外すときはノンブル表示も連動してオフ
    if (key === "countInTotalPageTypes" && !checked) {
      onChangeFormat({
        countInTotalPageTypes: nextFlags,
        folioOnPageTypes: {
          ...book.format.folioOnPageTypes,
          [pageType]: false,
        },
      });
      return;
    }
    onChangeFormat({ [key]: nextFlags });
  }

  const tabs: { id: PanelTab; label: string; icon: ReactNode }[] = [
    {
      id: "format",
      label: copy.edit.panel.tabFormat,
      icon: <SlidersHorizontal className="size-4" aria-hidden />,
    },
    {
      id: "page",
      label: copy.edit.panel.tabPage,
      icon: <FileText className="size-4" aria-hidden />,
    },
    {
      id: "block",
      label: copy.edit.panel.tabBlock,
      icon: <Frame className="size-4" aria-hidden />,
    },
    {
      id: "variables",
      label: copy.edit.panel.tabVariables,
      icon: <Replace className="size-4" aria-hidden />,
    },
  ];

  return (
    <div
      data-bv-panel
      className="bv-ui-surface flex h-full max-h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl"
    >
      <div
        role="tablist"
        aria-label={copy.edit.panel.openLabel}
        className="bv-ui-tabs"
        style={
          {
            "--bv-tab-count": tabs.length,
            "--bv-tab-index": Math.max(
              0,
              tabs.findIndex((item) => item.id === tab),
            ),
          } as CSSProperties
        }
      >
        <span className="bv-ui-tabs__thumb" aria-hidden />
        {tabs.map(({ id, label, icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              title={label}
              className="bv-ui-tab"
            >
              {icon}
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {tab === "variables" ? (
        <VariablesPanel
          variables={book.variables}
          onChange={(variables) => onChangeBook({ variables })}
        />
      ) : tab === "format" ? (
        <div className="flex h-0 min-h-0 flex-1 flex-col gap-3.5 overflow-x-hidden overflow-y-auto overscroll-contain p-3">
          <label className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel icon={<BookOpen className="size-4" aria-hidden />}>
              {copy.edit.format.title}
            </FieldLabel>
            <input
              type="text"
              value={book.title}
              onChange={(event) => onChangeBook({ title: event.target.value })}
              placeholder={copy.edit.format.titlePlaceholder}
              className="bv-ui-field"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel icon={<User className="size-4" aria-hidden />}>
              {copy.edit.format.author}
            </FieldLabel>
            <input
              type="text"
              value={book.author}
              onChange={(event) => onChangeBook({ author: event.target.value })}
              placeholder={copy.edit.format.authorPlaceholder}
              className="bv-ui-field"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1.5">
            <FieldLabel icon={<Proportions className="size-4" aria-hidden />}>
              {copy.edit.format.bookType}
            </FieldLabel>
            <select
              value={book.format.paperSize}
              onChange={(event) => {
                const paperSize = event.target.value as PaperSizeId;
                const preset = getPaperPreset(paperSize);
                const fonts = defaultLevelFonts(preset.defaultLayout);
                onChangeBook({
                  layout: preset.defaultLayout,
                  format: {
                    ...book.format,
                    paperSize,
                    fontFamilyH1: fonts.h1,
                    fontFamilyH2: fonts.h2,
                    fontFamilyP: fonts.p,
                  },
                });
              }}
              className="bv-ui-field"
            >
              {PAPER_SIZE_IDS.map((id) => (
                <option key={id} value={id}>
                  {copy.paper[id]}
                </option>
              ))}
            </select>
          </label>
          <p className="bv-ui-hint -mt-2">
            {getBookBinding(book.format.paperSize) === "right"
              ? copy.edit.format.bindingHintRight
              : copy.edit.format.bindingHintLeft}
          </p>

          <Segmented<BookLayout>
            label={copy.edit.format.layoutMode}
            icon={<ListTree className="size-4" aria-hidden />}
            value={book.layout}
            options={BOOK_LAYOUTS.map((layout) => ({
              id: layout,
              label: copy.layout[layout],
            }))}
            onChange={(layout) => {
              const fonts = defaultLevelFonts(layout);
              onChangeBook({
                layout,
                format: {
                  ...book.format,
                  fontFamilyH1: fonts.h1,
                  fontFamilyH2: fonts.h2,
                  fontFamilyP: fonts.p,
                },
              });
            }}
          />
          <p className="bv-ui-hint -mt-2">
            {book.layout === "japanese"
              ? copy.layout.japaneseHint
              : book.layout === "western"
                ? copy.layout.westernHint
                : copy.layout.photoHint}
          </p>

          <div className="bv-ui-section flex flex-col gap-2.5">
            <FieldLabel icon={<Type className="size-4" aria-hidden />}>
              {copy.edit.format.fontFamily}
            </FieldLabel>
            <FontFamilySelect
              label={copy.edit.format.fontFamilyH1}
              icon={<Heading1 className="size-4" aria-hidden />}
              value={book.format.fontFamilyH1}
              groupJapanese={copy.edit.format.fontGroupJapanese}
              groupLatin={copy.edit.format.fontGroupLatin}
              onChange={(fontFamilyH1) => onChangeFormat({ fontFamilyH1 })}
            />
            <FontFamilySelect
              label={copy.edit.format.fontFamilyH2}
              icon={<Text className="size-4" aria-hidden />}
              value={book.format.fontFamilyH2}
              groupJapanese={copy.edit.format.fontGroupJapanese}
              groupLatin={copy.edit.format.fontGroupLatin}
              onChange={(fontFamilyH2) => onChangeFormat({ fontFamilyH2 })}
            />
            <FontFamilySelect
              label={copy.edit.format.fontFamilyP}
              icon={<Pilcrow className="size-4" aria-hidden />}
              value={book.format.fontFamilyP}
              groupJapanese={copy.edit.format.fontGroupJapanese}
              groupLatin={copy.edit.format.fontGroupLatin}
              onChange={(fontFamilyP) => onChangeFormat({ fontFamilyP })}
            />
            <span className="bv-ui-hint">
              {copy.edit.format.fontFamilyHint}
            </span>
          </div>

          <div className="bv-ui-section flex flex-col gap-3">
            <NumberField
              label={
                book.layout === "japanese"
                  ? copy.edit.format.linesPerPageVertical
                  : copy.edit.format.linesPerPage
              }
              icon={<Rows3 className="size-4" aria-hidden />}
              value={book.format.linesPerPage}
              min={FORMAT_LIMITS.linesPerPage.min}
              max={FORMAT_LIMITS.linesPerPage.max}
              onChange={(linesPerPage) => onChangeFormat({ linesPerPage })}
            />
            <NumberField
              label={copy.edit.format.charsPerLine}
              icon={<Text className="size-4" aria-hidden />}
              value={book.format.charsPerLine}
              min={FORMAT_LIMITS.charsPerLine.min}
              max={FORMAT_LIMITS.charsPerLine.max}
              onChange={(charsPerLine) => onChangeFormat({ charsPerLine })}
            />
            <Segmented<"1" | "2">
              label={copy.edit.format.columns}
              icon={<Columns2 className="size-4" aria-hidden />}
              value={book.format.columns === 2 ? "2" : "1"}
              options={[
                { id: "1", label: copy.edit.format.columnsOne },
                {
                  id: "2",
                  label:
                    book.layout === "japanese"
                      ? copy.edit.format.columnsTwoVertical
                      : copy.edit.format.columnsTwoHorizontal,
                },
              ]}
              onChange={(value) =>
                onChangeFormat({ columns: value === "2" ? 2 : 1 })
              }
            />
            <p className="bv-ui-hint">{copy.edit.format.columnsHint}</p>
          </div>

          <dl className="bv-ui-section grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] text-zinc-400">
            <dt>{copy.edit.format.sheetSize}</dt>
            <dd className="bv-ui-value text-right">
              {Math.round(metrics.width)} × {Math.round(metrics.height)} px
            </dd>
            <dt>{copy.edit.format.computedFont}</dt>
            <dd className="bv-ui-value text-right">
              {fmt(copy.edit.format.computedFontValue, {
                size: String(metrics.fontSize),
                cellInline: metrics.cellInline.toFixed(1),
                cellBlock: metrics.cellBlock.toFixed(1),
              })}
            </dd>
            <dt>{copy.edit.format.capacity}</dt>
            <dd className="bv-ui-value text-right">
              {fmt(copy.edit.format.capacityValue, {
                chars:
                  book.format.charsPerLine *
                  book.format.linesPerPage *
                  book.format.columns,
                lines: book.format.linesPerPage * book.format.columns,
              })}
            </dd>
          </dl>
        </div>
      ) : tab === "page" ? (
        <div className="flex h-0 min-h-0 flex-1 flex-col gap-3.5 overflow-x-hidden overflow-y-auto overscroll-contain p-3">
          {!currentPage ? (
            <p className="bv-ui-hint">{copy.edit.page.bodyStreamHint}</p>
          ) : (
            <>
              <label className="flex min-w-0 flex-col gap-1.5">
                <FieldLabel icon={<FileText className="size-4" aria-hidden />}>
                  {copy.edit.page.pageType}
                </FieldLabel>
                <select
                  value={currentPage.pageType}
                  onChange={(event) =>
                    onChangePage({ pageType: event.target.value as PageType })
                  }
                  className="bv-ui-field"
                >
                  {PAGE_TYPES.map((pageType) => {
                    const taken = isUniquePageTypeTaken(
                      book.pages,
                      pageType,
                      currentPage.id,
                    );
                    const edgeBlocked =
                      (pageType === "cover" || pageType === "backCover") &&
                      pageType !== currentPage.pageType &&
                      !canAssignCoverOrBackCover(
                        pageType,
                        currentPage.id,
                        book.pages,
                      );
                    const disabled = taken || edgeBlocked;
                    const label = pageTypeLabel(pageType, copy.edit.page);
                    const suffix = taken
                      ? copy.edit.page.pageTypeTakenSuffix
                      : edgeBlocked && pageType === "cover"
                        ? copy.edit.page.pageTypeCoverEdgeOnly
                        : edgeBlocked && pageType === "backCover"
                          ? copy.edit.page.pageTypeBackCoverEdgeOnly
                          : "";
                    return (
                      <option
                        key={pageType}
                        value={pageType}
                        disabled={disabled}
                      >
                        {suffix ? `${label}${suffix}` : label}
                      </option>
                    );
                  })}
                </select>
              </label>
              <p className="bv-ui-hint -mt-2">{copy.edit.page.pageTypeHint}</p>
              <p className="bv-ui-hint -mt-2">
                {copy.edit.page.pageTypeUniqueHint}
              </p>
              {currentPage.pageType === "toc" ? (
                <div className="-mt-1 flex flex-col gap-2">
                  <p className="bv-ui-hint">{copy.edit.toc.hint}</p>
                  <Segmented<"1" | "2">
                    label={copy.edit.toc.columns}
                    icon={<Columns2 className="size-4" aria-hidden />}
                    value={book.format.tocColumns === 2 ? "2" : "1"}
                    options={[
                      { id: "1", label: copy.edit.toc.columnsOne },
                      { id: "2", label: copy.edit.toc.columnsTwo },
                    ]}
                    onChange={(value) =>
                      onChangeFormat({ tocColumns: value === "2" ? 2 : 1 })
                    }
                  />
                  <p className="bv-ui-hint">{copy.edit.toc.columnsHint}</p>
                  <Segmented<TocDepth>
                    label={copy.edit.toc.depth}
                    icon={<ListTree className="size-4" aria-hidden />}
                    value={book.format.tocDepth}
                    options={TOC_DEPTHS.map((depth) => ({
                      id: depth,
                      label:
                        depth === "chapter"
                          ? copy.edit.toc.depthChapter
                          : copy.edit.toc.depthSection,
                    }))}
                    onChange={(tocDepth) => onChangeFormat({ tocDepth })}
                  />
                  <p className="bv-ui-hint">{copy.edit.toc.depthHint}</p>
                </div>
              ) : null}
            </>
          )}

          <div
            className={`flex flex-col gap-2 ${currentPage ? "bv-ui-section" : ""}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <FieldLabel icon={<Hash className="size-4" aria-hidden />}>
                {copy.edit.page.chromeByType}
              </FieldLabel>
              <span className="text-[10px] text-zinc-500">
                {copy.edit.page.chromeByTypeHint}
              </span>
            </div>

            {activePageTypes.length === 0 ? (
              <p className="bv-ui-hint">{copy.edit.page.chromeNoTypes}</p>
            ) : (
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="text-zinc-500">
                    <th className="pb-1 text-left font-medium">
                      {copy.edit.page.pageType}
                    </th>
                    <th
                      className="w-10 pb-1 text-center font-medium"
                      title={copy.edit.page.chromeCountHint}
                    >
                      {copy.edit.page.chromeCount}
                    </th>
                    <th className="w-10 pb-1 text-center font-medium">
                      {copy.edit.page.chromeHeader}
                    </th>
                    <th className="w-12 pb-1 text-center font-medium">
                      {copy.edit.page.chromeFolio}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activePageTypes.map((pageType) => {
                    const counted =
                      book.format.countInTotalPageTypes[pageType];
                    const typeLabel = pageTypeLabel(pageType, copy.edit.page);
                    const headerAllowed = canShowHeaderOnPageType(pageType);
                    return (
                      <tr key={pageType} className="border-t border-zinc-800">
                        <td className="py-2 pr-1 font-medium text-zinc-300">
                          {typeLabel}
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={counted}
                            onChange={(event) =>
                              toggleChromeFlag(
                                "countInTotalPageTypes",
                                pageType,
                                event.target.checked,
                              )
                            }
                            aria-label={`${typeLabel} ${copy.edit.page.chromeCount}`}
                            title={copy.edit.page.chromeCountHint}
                            className="bv-ui-check"
                          />
                        </td>
                        <td className="py-2 text-center">
                          {headerAllowed ? (
                            <input
                              type="checkbox"
                              checked={
                                headerChecksEnabled &&
                                book.format.headerOnPageTypes[pageType]
                              }
                              disabled={!headerChecksEnabled}
                              onChange={(event) =>
                                toggleChromeFlag(
                                  "headerOnPageTypes",
                                  pageType,
                                  event.target.checked,
                                )
                              }
                              aria-label={`${typeLabel} ${copy.edit.page.chromeHeader}`}
                              className="bv-ui-check"
                            />
                          ) : (
                            <span
                              className="text-[10px] text-zinc-600"
                              title={copy.edit.page.chromeHeaderBodyOnly}
                              aria-label={copy.edit.page.chromeHeaderBodyOnly}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-center">
                          <input
                            type="checkbox"
                            checked={
                              counted && book.format.folioOnPageTypes[pageType]
                            }
                            disabled={!counted}
                            onChange={(event) =>
                              toggleChromeFlag(
                                "folioOnPageTypes",
                                pageType,
                                event.target.checked,
                              )
                            }
                            aria-label={`${typeLabel} ${copy.edit.page.chromeFolio}`}
                            title={
                              counted
                                ? undefined
                                : copy.edit.page.chromeFolioNeedsCount
                            }
                            className="bv-ui-check"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <p className="bv-ui-hint">{copy.edit.page.chromeCountHint}</p>
            {!headerChecksEnabled ? (
              <p className="bv-ui-hint">
                {copy.edit.page.chromeHeaderDisabledHint}
              </p>
            ) : null}
          </div>

          {canShowHeaderOnPageType(focusPageType) || anyFolioOn ? (
            <div className="bv-ui-section flex flex-col gap-3">
              {/* 柱の内容設定は本文（標準）ページを見ているときだけ */}
              {canShowHeaderOnPageType(focusPageType) ? (
                <>
                  <Segmented<HeaderMode>
                    label={copy.edit.format.headerMode}
                    icon={<Text className="size-4" aria-hidden />}
                    value={book.format.headerMode}
                    options={HEADER_MODES.map((mode) => ({
                      id: mode,
                      label:
                        mode === "title"
                          ? copy.edit.format.headerTitle
                          : mode === "chapter"
                            ? copy.edit.format.headerChapter
                            : copy.edit.format.headerNone,
                    }))}
                    onChange={(headerMode) => onChangeFormat({ headerMode })}
                  />
                  {book.format.headerMode !== "none" ? (
                    <>
                      <Segmented<SpreadHeaderPlacement>
                        label={copy.edit.format.headerSpread}
                        icon={<Columns2 className="size-4" aria-hidden />}
                        value={book.format.headerSpreadPlacement}
                        options={SPREAD_HEADER_PLACEMENTS.map((placement) => ({
                          id: placement,
                          label:
                            placement === "both"
                              ? copy.edit.format.headerSpreadBoth
                              : placement === "left"
                                ? copy.edit.format.headerSpreadLeft
                                : copy.edit.format.headerSpreadRight,
                        }))}
                        onChange={(headerSpreadPlacement) =>
                          onChangeFormat({ headerSpreadPlacement })
                        }
                      />
                      <p className="bv-ui-hint -mt-2">
                        {copy.edit.format.headerSpreadHint}
                      </p>
                      <Segmented<ChromeAlign>
                        label={copy.edit.format.headerAlign}
                        icon={<Text className="size-4" aria-hidden />}
                        value={book.format.headerAlign}
                        options={CHROME_ALIGNS.map((align) => ({
                          id: align,
                          label:
                            align === "left"
                              ? copy.edit.format.alignLeft
                              : align === "center"
                                ? copy.edit.format.alignCenter
                                : copy.edit.format.alignRight,
                        }))}
                        onChange={(headerAlign) =>
                          onChangeFormat({ headerAlign })
                        }
                      />
                    </>
                  ) : null}
                </>
              ) : null}
              {anyFolioOn ? (
                <Segmented<ChromeAlign>
                  label={copy.edit.format.folioAlign}
                  icon={<Hash className="size-4" aria-hidden />}
                  value={book.format.folioAlign}
                  options={CHROME_ALIGNS.map((align) => ({
                    id: align,
                    label:
                      align === "left"
                        ? copy.edit.format.alignLeft
                        : align === "center"
                          ? copy.edit.format.alignCenter
                          : copy.edit.format.alignRight,
                  }))}
                  onChange={(folioAlign) => onChangeFormat({ folioAlign })}
                />
              ) : null}
            </div>
          ) : null}

          <div className="bv-ui-section">
            <MarginFields
              format={book.format}
              labels={copy.edit.format}
              onChangeFormat={onChangeFormat}
            />
          </div>
        </div>
      ) : (
        <div className="flex h-0 min-h-0 flex-1 flex-col gap-3.5 overflow-x-hidden overflow-y-auto overscroll-contain p-3">
          {!selectedBlock ? (
            <p className="bv-ui-empty">{copy.edit.block.none}</p>
          ) : (
            <>
              <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <Frame className="size-4 text-zinc-500" aria-hidden />
                {selectedBlock.type === "image"
                  ? copy.edit.block.kindImage
                  : selectedBlock.type === "freeText"
                    ? copy.edit.block.kindFreeText
                    : copy.edit.block.kindText}
              </p>

              {selectedBlock.type === "text" ? (
                <Segmented<TextLevel>
                  label={copy.edit.block.level}
                  icon={<Heading1 className="size-4" aria-hidden />}
                  value={selectedBlock.level}
                  options={TEXT_LEVELS.map((level) => ({
                    id: level,
                    label:
                      level === "h1"
                        ? copy.edit.block.levelH1
                        : level === "h2"
                          ? copy.edit.block.levelH2
                          : copy.edit.block.levelP,
                  }))}
                  onChange={onChangeLevel}
                />
              ) : null}

              {selectedBlock.type === "image" ? (
                <>
                  <label className="flex min-w-0 flex-col gap-1.5">
                    <FieldLabel icon={<Text className="size-4" aria-hidden />}>
                      {copy.edit.block.caption}
                    </FieldLabel>
                    <input
                      type="text"
                      value={selectedBlock.caption}
                      onChange={(event) => onChangeCaption(event.target.value)}
                      placeholder={copy.edit.block.captionPlaceholder}
                      className="bv-ui-field"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={onReplaceImage}
                    className="bv-ui-btn w-full"
                  >
                    <Replace className="size-4" aria-hidden />
                    {copy.edit.block.replaceImage}
                  </button>
                  <button
                    type="button"
                    onClick={onFullBleed}
                    className="bv-ui-btn w-full"
                  >
                    <Expand className="size-4" aria-hidden />
                    {copy.edit.block.fullBleed}
                  </button>
                  <p className="bv-ui-hint -mt-2">
                    {copy.edit.block.fullBleedHint}
                  </p>
                </>
              ) : null}

              {selectedBlock.type === "freeText" ? (
                <>
                  <Segmented<FreeTextWritingMode>
                    label={copy.edit.block.writingMode}
                    icon={<Type className="size-4" aria-hidden />}
                    value={selectedBlock.writingMode}
                    options={FREE_TEXT_WRITING_MODES.map((mode) => ({
                      id: mode,
                      label:
                        mode === "vertical"
                          ? copy.edit.block.writingVertical
                          : copy.edit.block.writingHorizontal,
                    }))}
                    onChange={onChangeWritingMode}
                  />
                  <p className="bv-ui-hint -mt-2">
                    {copy.edit.block.writingModeHint}
                  </p>
                  <FontFamilySelect
                    label={copy.edit.block.fontFamily}
                    icon={<Type className="size-4" aria-hidden />}
                    value={selectedBlock.fontFamily}
                    groupJapanese={copy.edit.format.fontGroupJapanese}
                    groupLatin={copy.edit.format.fontGroupLatin}
                    onChange={onChangeBlockFontFamily}
                  />
                  <NumberField
                    label={copy.edit.block.fontScale}
                    icon={<Ruler className="size-4" aria-hidden />}
                    value={Math.round(selectedBlock.fontScale * 100)}
                    min={2}
                    max={20}
                    onChange={(percent) => onChangeFontScale(percent / 100)}
                  />
                </>
              ) : null}

              {freeSelected ? (
                <div className="bv-ui-section flex flex-col gap-1.5">
                  <FieldLabel icon={<Layers className="size-4" aria-hidden />}>
                    {copy.edit.block.layer}
                  </FieldLabel>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        ["front", copy.edit.block.layerFront],
                        ["forward", copy.edit.block.layerForward],
                        ["backward", copy.edit.block.layerBackward],
                        ["back", copy.edit.block.layerBack],
                      ] as const
                    ).map(([action, label]) => (
                      <button
                        key={action}
                        type="button"
                        onClick={() => onLayerAction(action as LayerAction)}
                        className="bv-ui-btn bv-ui-btn--sm"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="bv-ui-hint">{copy.edit.block.layerHint}</p>
                </div>
              ) : null}

              <div className="bv-ui-section flex items-center gap-1.5">
                {selectedBlock.type === "text" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onMoveBlock(-1)}
                      className="bv-ui-btn flex-1"
                    >
                      <MoveUp className="size-4" aria-hidden />
                      {copy.edit.block.moveUp}
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveBlock(1)}
                      className="bv-ui-btn flex-1"
                    >
                      <MoveDown className="size-4" aria-hidden />
                      {copy.edit.block.moveDown}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={onRemoveBlock}
                  className="bv-ui-btn bv-ui-btn--danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                  {copy.edit.block.remove}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
