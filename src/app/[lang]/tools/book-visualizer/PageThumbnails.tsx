"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { fmt, useI18n } from "@/i18n";
import { computePageMetrics, type PageMetrics } from "./metrics";
import PageCanvas from "./PageCanvas";
import type { BookData, BookPage } from "./types";

type PageThumbnailsProps = {
  book: BookData;
  currentIndex: number;
  onSelect: (index: number) => void;
  onAddPage: () => void;
  onReorderPages: (pages: BookPage[], nextIndex: number) => void;
  onRemovePage: (index: number) => void;
};

/** 番号＋削除アイコン列 */
const META_COL_CLASS = "w-4";

function TrashIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

/**
 * 親幅いっぱい・アスペクト比固定のプレビュー。
 * 内側リングなので枠外にはみ出さない。
 */
function ThumbPreview({
  book,
  page,
  pageIndex,
  metrics,
}: {
  book: BookData;
  page: BookPage;
  pageIndex: number;
  metrics: PageMetrics;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const update = () => {
      setBoxWidth(Math.floor(element.clientWidth));
    };
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
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{
            width: metrics.width,
            height: metrics.height,
            transform: `scale(${scale})`,
          }}
        >
          <PageCanvas
            book={book}
            page={page}
            pageIndex={pageIndex}
            metrics={metrics}
            interactive={false}
          />
        </div>
      ) : null}
    </div>
  );
}

function SortableThumb({
  page,
  index,
  active,
  canRemove,
  metrics,
  book,
  pageLabel,
  dragHint,
  removeLabel,
  onSelect,
  onRemove,
}: {
  page: BookPage;
  index: number;
  active: boolean;
  canRemove: boolean;
  metrics: PageMetrics;
  book: BookData;
  pageLabel: string;
  dragHint: string;
  removeLabel: string;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`w-full min-w-0 shrink-0 ${isDragging ? "z-20 opacity-40" : ""}`}
    >
      <div className="flex w-full min-w-0 items-start gap-1.5">
        <div
          className={`flex ${META_COL_CLASS} shrink-0 flex-col items-center gap-0.5 pt-0.5`}
        >
          <span
            className={`text-[10px] font-medium tabular-nums ${
              active ? "text-zinc-900" : "text-zinc-400"
            }`}
          >
            {pageLabel}
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            disabled={!canRemove}
            aria-label={removeLabel}
            title={removeLabel}
            className="rounded p-0.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:pointer-events-none disabled:opacity-20"
          >
            <TrashIcon />
          </button>
        </div>
        <button
          type="button"
          onClick={onSelect}
          title={dragHint}
          className={`min-w-0 flex-1 basis-0 cursor-grab overflow-hidden rounded-md text-start transition active:cursor-grabbing ${
            active
              ? "ring-2 ring-inset ring-zinc-900"
              : "ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400"
          }`}
          {...attributes}
          {...listeners}
        >
          <ThumbPreview
            book={book}
            page={page}
            pageIndex={index}
            metrics={metrics}
          />
        </button>
      </div>
    </li>
  );
}

/**
 * 左ペイン：ページ一覧（ドラッグで並べ替え）。
 */
export default function PageThumbnails({
  book,
  currentIndex,
  onSelect,
  onAddPage,
  onReorderPages,
  onRemovePage,
}: PageThumbnailsProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer.edit.thumbnails;
  const dndId = useId();
  const metrics = computePageMetrics(book.layout, book.format);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const pageIds = book.pages.map((page) => page.id);
  const activePage = activeId
    ? book.pages.find((page) => page.id === activeId)
    : null;
  const activeIndex = activePage
    ? book.pages.findIndex((page) => page.id === activePage.id)
    : -1;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = book.pages.findIndex((page) => page.id === active.id);
    const to = book.pages.findIndex((page) => page.id === over.id);
    if (from < 0 || to < 0) return;
    const pages = arrayMove(book.pages, from, to);
    onReorderPages(pages, to);
  }

  return (
    <aside className="flex h-full min-h-0 w-full min-w-0 flex-col gap-2 overflow-hidden border-b border-zinc-200 bg-zinc-50/80 p-2 lg:border-b-0 lg:border-r">
      <div className="flex shrink-0 min-w-0 items-baseline justify-between gap-1 px-0.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
          {copy.title}
        </p>
        <p className="truncate text-[9px] text-zinc-400">{copy.dragHint}</p>
      </div>

      {/* 一覧だけスクロール。プレビュー枠は縮めず本来の比率を保つ */}
      <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContext items={pageIds} strategy={rectSortingStrategy}>
            <ul className="flex w-full min-w-0 flex-col gap-2.5">
              {book.pages.map((page, index) => (
                <SortableThumb
                  key={page.id}
                  page={page}
                  index={index}
                  active={index === currentIndex}
                  canRemove={book.pages.length > 1}
                  metrics={metrics}
                  book={book}
                  pageLabel={fmt(copy.pageLabel, { n: String(index + 1) })}
                  dragHint={copy.dragHint}
                  removeLabel={copy.removePage}
                  onSelect={() => onSelect(index)}
                  onRemove={() => onRemovePage(index)}
                />
              ))}
            </ul>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activePage && activeIndex >= 0 ? (
              <div className="flex w-40 items-start gap-1.5">
                <span
                  className={`${META_COL_CLASS} shrink-0 pt-0.5 text-center text-[10px] font-medium tabular-nums text-zinc-900`}
                >
                  {fmt(copy.pageLabel, { n: String(activeIndex + 1) })}
                </span>
                <div className="min-w-0 flex-1 overflow-hidden rounded-md shadow-lg ring-2 ring-inset ring-zinc-900">
                  <ThumbPreview
                    book={book}
                    page={activePage}
                    pageIndex={activeIndex}
                    metrics={metrics}
                  />
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <button
        type="button"
        onClick={onAddPage}
        className="btn-secondary w-full shrink-0 justify-center text-xs"
      >
        {copy.addPage}
      </button>
    </aside>
  );
}
