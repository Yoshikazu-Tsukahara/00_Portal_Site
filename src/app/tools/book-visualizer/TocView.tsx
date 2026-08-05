"use client";

import { useI18n } from "@/i18n";
import type { PageMetrics } from "./metrics";
import type { PaperSizeId } from "./paper";
import {
  resolveTocVisualStyle,
  type TocEntry,
  type TocVisualStyle,
} from "./toc";
import type { BookData } from "./types";

type TocViewProps = {
  book: BookData;
  metrics: PageMetrics;
  /** この目次ページに載せる項目（親がページ分割済み） */
  entries: TocEntry[];
  /** 段ごとの項目（length 1 or 2） */
  columnEntries: TocEntry[][];
  /** 先頭の目次ページだけ見出しを出す */
  showHeading?: boolean;
};

function folioLabel(entry: TocEntry): string {
  return entry.folio !== null ? String(entry.folio) : "—";
}

function EntryList({
  style,
  entries,
  startIndex = 0,
}: {
  style: TocVisualStyle;
  entries: TocEntry[];
  startIndex?: number;
}) {
  return (
    <ul className="bv-toc__list">
      {entries.map((entry, index) => (
        <li
          key={entry.id}
          className={`bv-toc__item bv-toc__item--${entry.level}`}
        >
          {style === "photo" ? (
            <span className="bv-toc__index" aria-hidden>
              {String(startIndex + index + 1).padStart(2, "0")}
            </span>
          ) : null}
          <span className="bv-toc__title">{entry.title}</span>
          {style !== "photo" ? (
            <span className="bv-toc__leader" aria-hidden>
              ················································
            </span>
          ) : null}
          <span className="bv-toc__folio">{folioLabel(entry)}</span>
        </li>
      ))}
    </ul>
  );
}

function TocBody({
  style,
  paperSize,
  vertical,
  columns,
  columnEntries,
  title,
  empty,
  showHeading,
}: {
  style: TocVisualStyle;
  paperSize: PaperSizeId;
  vertical: boolean;
  columns: 1 | 2;
  columnEntries: TocEntry[][];
  title: string;
  empty: string;
  showHeading: boolean;
}) {
  const flat = columnEntries.flat();
  const col0 = columnEntries[0] ?? [];
  const col1 = columnEntries[1] ?? [];

  return (
    <div
      className={`bv-toc bv-toc--${style} bv-toc--paper-${paperSize} ${
        vertical ? "bv-toc--vertical" : "bv-toc--horizontal"
      } ${columns === 2 ? "bv-toc--split-lr" : ""}`}
    >
      {showHeading ? <h2 className="bv-toc__heading">{title}</h2> : null}
      {flat.length === 0 ? (
        <p className="bv-toc__empty">{empty}</p>
      ) : columns === 2 ? (
        <div className="bv-toc__panes bv-toc__panes--lr">
          {vertical ? (
            <>
              {/* 画面左＝後続、画面右＝先頭（縦書きの読み始め） */}
              <EntryList
                style={style}
                entries={col1}
                startIndex={col0.length}
              />
              <EntryList style={style} entries={col0} />
            </>
          ) : (
            <>
              <EntryList style={style} entries={col0} />
              <EntryList
                style={style}
                entries={col1}
                startIndex={col0.length}
              />
            </>
          )}
        </div>
      ) : (
        <EntryList style={style} entries={col0} />
      )}
    </div>
  );
}

/**
 * 目次 1 ページ分の表示。
 * ページ分割・段数は親（TocSync / PageCanvas）が決める。ここでは見切れない分だけ描く。
 */
export default function TocView({
  book,
  metrics,
  entries,
  columnEntries,
  showHeading = true,
}: TocViewProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.edit.toc;
  const style = resolveTocVisualStyle(book.layout, book.format.paperSize);
  const vertical = metrics.vertical;
  const columns = book.format.tocColumns === 2 ? 2 : 1;
  const cols =
    columnEntries.length > 0
      ? columnEntries
      : columns === 2
        ? [[], []]
        : [entries];

  return (
    <div
      className="bv-toc-root"
      style={{ fontSize: Math.max(10, metrics.fontSize) }}
    >
      <TocBody
        style={style}
        paperSize={book.format.paperSize}
        vertical={vertical}
        columns={columns}
        columnEntries={cols}
        title={copy.title}
        empty={copy.empty}
        showHeading={showHeading}
      />
    </div>
  );
}

/** 計測用に同じ見た目を描く（TocSync から利用） */
export function TocProbeBody({
  book,
  metrics,
  entries,
  columns,
  showHeading,
}: {
  book: BookData;
  metrics: PageMetrics;
  entries: TocEntry[];
  columns: 1 | 2;
  showHeading: boolean;
}) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.edit.toc;
  const style = resolveTocVisualStyle(book.layout, book.format.paperSize);
  const mid = columns === 2 ? Math.ceil(entries.length / 2) : entries.length;
  const columnEntries =
    columns === 2
      ? [entries.slice(0, mid), entries.slice(mid)]
      : [entries];

  return (
    <TocBody
      style={style}
      paperSize={book.format.paperSize}
      vertical={metrics.vertical}
      columns={columns}
      columnEntries={columnEntries}
      title={copy.title}
      empty={copy.empty}
      showHeading={showHeading}
    />
  );
}
