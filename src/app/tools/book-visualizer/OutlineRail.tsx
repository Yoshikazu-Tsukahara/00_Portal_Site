"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FilePlus2, Trash2 } from "lucide-react";

import { fmt, useI18n } from "@/i18n";
import type { PageMetrics } from "./metrics";
import type { OutlineEntry } from "./outline";
import PageCanvas from "./PageCanvas";
import PagedBodyView from "./PagedBodyView";
import type { PaginatedPage } from "./paginate";
import type { TocPageSlice } from "./toc";
import type { BookData, BookPage } from "./types";

type OutlineRailProps = {
  book: BookData;
  outline: OutlineEntry[];
  currentIndex: number;
  metrics: PageMetrics;
  bodyPages?: PaginatedPage[];
  tocSlices?: TocPageSlice[];
  onSelect: (index: number) => void;
  onAddPage: () => void;
  onReorderPages: (pages: BookPage[], focusPageIndex: number) => void;
  onRemoveEntry: (index: number) => void;
};

const META_COL_CLASS = "w-4";

/** ページ削除ボタン（固定ページ・本文ページ共通） */
function RemoveThumbButton({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        onRemove();
      }}
      className="rounded-md p-1 text-zinc-500 transition-all duration-150 ease-in-out hover:bg-red-500/15 hover:text-red-400"
    >
      <Trash2 className="size-3" aria-hidden />
    </button>
  );
}

function pageLabelClass(active: boolean): string {
  return active
    ? "text-center text-[10px] font-semibold tabular-nums text-zinc-100"
    : "text-center text-[10px] font-medium tabular-nums text-zinc-500";
}

function ThumbBox({
  metrics,
  children,
}: {
  metrics: PageMetrics;
  children: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const update = () => setBoxWidth(Math.floor(element.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = boxWidth > 0 ? boxWidth / metrics.width : 0;

  return (
    <div
      ref={boxRef}
      className="bv-thumb-preview relative w-full overflow-hidden bg-white"
      style={{ aspectRatio: `${metrics.width} / ${metrics.height}` }}
      aria-hidden
    >
      {scale > 0 ? (
        <div
          className="pointer-events-none origin-top-left"
          style={{
            width: metrics.width,
            height: metrics.height,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SortableFixedThumb({
  entry,
  outlineIndex,
  active,
  book,
  metrics,
  bodyPages,
  tocSlices,
  label,
  canRemove,
  removeLabel,
  onSelect,
  onRemove,
}: {
  entry: Extract<OutlineEntry, { kind: "page" }>;
  outlineIndex: number;
  active: boolean;
  book: BookData;
  metrics: PageMetrics;
  bodyPages?: PaginatedPage[];
  tocSlices?: TocPageSlice[];
  label: string;
  canRemove: boolean;
  removeLabel: string;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const page = book.pages[entry.pageIndex];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page?.id ?? entry.key });

  if (!page) return null;

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="flex w-full min-w-0 shrink-0 items-start gap-1.5"
    >
      <div
        className={`${META_COL_CLASS} flex shrink-0 flex-col items-center gap-1 pt-0.5`}
      >
        <span className={pageLabelClass(active)}>{label}</span>
        {canRemove ? (
          <RemoveThumbButton label={removeLabel} onRemove={onRemove} />
        ) : null}
      </div>
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className="bv-ui-thumb cursor-grab active:cursor-grabbing"
      >
        <ThumbBox metrics={metrics}>
          <PageCanvas
            book={book}
            page={page}
            pageIndex={entry.pageIndex}
            metrics={metrics}
            bodyPages={bodyPages}
            tocSlices={tocSlices}
          />
        </ThumbBox>
      </button>
      <span className="sr-only">{outlineIndex}</span>
    </li>
  );
}

/**
 * ページ一覧レール：固定ページ＋本文仮想ページ。
 * どちらも削除ボタンを出し、能力と表示を揃える。
 */
export default function OutlineRail({
  book,
  outline,
  currentIndex,
  metrics,
  bodyPages,
  tocSlices,
  onSelect,
  onAddPage,
  onReorderPages,
  onRemoveEntry,
}: OutlineRailProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.edit.thumbnails;
  const dndId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sortableIds = outline
    .filter((entry): entry is Extract<OutlineEntry, { kind: "page" }> =>
      entry.kind === "page",
    )
    .map((entry) => book.pages[entry.pageIndex]?.id)
    .filter((id): id is string => Boolean(id));

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = book.pages.findIndex((page) => page.id === active.id);
    const to = book.pages.findIndex((page) => page.id === over.id);
    if (from < 0 || to < 0) return;
    onReorderPages(arrayMove(book.pages, from, to), to);
  }

  const activePage =
    activeId !== null
      ? book.pages.find((page) => page.id === activeId) ?? null
      : null;

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col gap-2 overflow-hidden border-b border-zinc-800 bg-zinc-900 p-2 lg:border-b-0 lg:border-r">
      <div className="flex shrink-0 min-w-0 items-baseline justify-between gap-1 px-0.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {copy.title}
        </p>
        <p className="truncate text-[9px] text-zinc-500">{copy.dragHint}</p>
      </div>

      {/* 右に余白を残し、選択枠（ring-offset）がスクロールバーに被らないようにする */}
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => setActiveId(String(event.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <ul className="flex w-full min-w-0 flex-col gap-3 py-1 pl-1 pr-3">
              {outline.map((entry, index) => {
                const label = fmt(copy.pageLabel, { n: String(index + 1) });
                const active = index === currentIndex;
                if (entry.kind === "page") {
                  return (
                    <SortableFixedThumb
                      key={entry.key}
                      entry={entry}
                      outlineIndex={index}
                      active={active}
                      book={book}
                      metrics={metrics}
                      bodyPages={bodyPages}
                      tocSlices={tocSlices}
                      label={label}
                      canRemove={book.pages.length > 0}
                      removeLabel={copy.removePage}
                      onSelect={() => onSelect(index)}
                      onRemove={() => onRemoveEntry(index)}
                    />
                  );
                }
                // 本文仮想ページも固定ページと同様に削除できる
                const canRemoveBody =
                  Boolean(
                    entry.columnIndex > 0 &&
                      bodyPages?.[entry.columnIndex - 1]?.manualBreakId,
                  ) ||
                  Boolean(
                    (bodyPages?.[entry.columnIndex]?.slices.length ?? 0) > 0,
                  );
                return (
                  <li
                    key={entry.key}
                    className="flex w-full min-w-0 shrink-0 items-start gap-1.5"
                  >
                    <div
                      className={`${META_COL_CLASS} flex shrink-0 flex-col items-center gap-1 pt-0.5`}
                    >
                      <span className={pageLabelClass(active)}>{label}</span>
                      {canRemoveBody ? (
                        <RemoveThumbButton
                          label={copy.removePage}
                          onRemove={() => onRemoveEntry(index)}
                        />
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelect(index)}
                      aria-current={active ? "page" : undefined}
                      className="bv-ui-thumb"
                    >
                      <ThumbBox metrics={metrics}>
                        <PagedBodyView
                          body={book.body}
                          layout={book.layout}
                          metrics={metrics}
                          fontFamilies={{
                            h1: book.format.fontFamilyH1,
                            h2: book.format.fontFamilyH2,
                            p: book.format.fontFamilyP,
                          }}
                          pageIndex={entry.columnIndex}
                          pages={bodyPages}
                          editable={false}
                          freeBlocks={
                            book.bodyOverlays?.[entry.columnIndex] ?? []
                          }
                        />
                      </ThumbBox>
                    </button>
                  </li>
                );
              })}
            </ul>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activePage ? (
              <div className="w-40 overflow-hidden rounded-md shadow-2xl ring-2 ring-zinc-100">
                <ThumbBox metrics={metrics}>
                  <PageCanvas
                    book={book}
                    page={activePage}
                    pageIndex={book.pages.indexOf(activePage)}
                    bodyPages={bodyPages}
                    tocSlices={tocSlices}
                    metrics={metrics}
                  />
                </ThumbBox>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <button type="button" onClick={onAddPage} className="bv-ui-btn w-full">
        <FilePlus2 className="size-4" aria-hidden />
        {copy.addPage}
      </button>
    </aside>
  );
}
