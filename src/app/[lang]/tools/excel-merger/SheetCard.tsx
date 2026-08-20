"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { fmt, useI18n } from "@/i18n";
import type { RefGroupTint } from "./refGroupColors";
import type { SheetEntry } from "./types";

/** 内容に関わらず揃えるカード高さ（警告バッジ分を含む） */
export const SHEET_CARD_HEIGHT_CLASS = "h-[5.75rem]";

const SORT_TRANSITION = { duration: 150, easing: "ease" } as const;

/** カード見た目（ドラッグ中の浮きコピーでも使う） */
export function SheetCardFace({
  entry,
  overlay = false,
  tint = null,
}: {
  entry: SheetEntry;
  overlay?: boolean;
  tint?: RefGroupTint | null;
}) {
  const { t } = useI18n();
  const copy = t.apps.excelMerger.card;
  const refNames = (entry.referencedSheetNames ?? []).join(" · ");
  const refLabel =
    refNames.length > 0
      ? fmt(copy.refWarningNames, { names: refNames })
      : copy.refWarning;
  const refTitle =
    refNames.length > 0
      ? fmt(copy.refWarningTitleNamed, { names: refNames })
      : copy.refWarningTitle;

  return (
    <div
      className={`${SHEET_CARD_HEIGHT_CLASS} box-border flex w-full min-w-0 flex-col justify-center rounded-md border px-3 py-2 pr-9 text-left ${
        overlay ? "shadow-sm" : "shadow-sm transition-all duration-150"
      }`}
      style={{
        backgroundColor: tint?.bg ?? "#ffffff",
        borderColor: overlay
          ? (tint?.accent ?? "rgba(33, 115, 70, 0.55)")
          : (tint?.border ?? "#e4e4e7"),
        borderLeftWidth: tint ? 3 : 1,
        borderLeftColor: tint?.accent ?? (overlay ? "rgba(33, 115, 70, 0.55)" : "#e4e4e7"),
      }}
    >
      <p className="min-w-0 truncate text-sm font-semibold leading-snug text-zinc-900">
        {entry.sheetName}
      </p>
      <p className="mt-0.5 min-w-0 truncate text-[11px] leading-snug text-zinc-400">
        {fmt(copy.fromFile, { name: entry.fileName })}
      </p>
      {entry.hasSheetRefs ? (
        <span
          title={refTitle}
          className="mt-1 block min-w-0 max-w-full truncate rounded border px-1.5 py-0.5 text-[10px] font-medium leading-tight"
          style={{
            backgroundColor: tint?.badgeBg ?? "#fffbeb",
            borderColor: tint?.badgeBorder ?? "#fcd34d",
            color: tint?.badgeText ?? "#92400e",
          }}
        >
          {refLabel}
        </span>
      ) : null}
    </div>
  );
}

/** 1 シート = 1 枚のカード（カード全体がドラッグハンドル） */
export default function SheetCard({
  entry,
  order,
  onRemove,
  tint = null,
}: {
  entry: SheetEntry;
  order: number;
  onRemove: () => void;
  tint?: RefGroupTint | null;
}) {
  const { t } = useI18n();
  const copy = t.apps.excelMerger.card;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: entry.id,
    data: { type: "sheet" },
    transition: SORT_TRANSITION,
  });

  const style = {
    // 掴んでいる本体はオーバーレイ側へ。列の中はプレースホルダーとして残す
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="relative min-w-0 list-none"
    >
      {isDragging ? (
        <div className="relative opacity-50">
          <SheetCardFace entry={entry} tint={tint} />
          <div
            className="pointer-events-none absolute inset-0 rounded-md border border-dashed"
            style={{ borderColor: tint?.accent ?? "rgba(33, 115, 70, 0.7)" }}
            aria-hidden
          />
        </div>
      ) : (
        <>
          <div
            {...attributes}
            {...listeners}
            aria-label={fmt(copy.dragAria, {
              index: order,
              name: entry.sheetName,
            })}
            className="cursor-grab touch-none"
          >
            <SheetCardFace entry={entry} tint={tint} />
          </div>
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            title={copy.remove}
            aria-label={fmt(copy.removeAria, { name: entry.sheetName })}
            className="absolute right-1 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-base leading-none text-zinc-400 transition-all duration-150 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-700 active:scale-[0.98]"
          >
            ×
          </button>
        </>
      )}
    </li>
  );
}
