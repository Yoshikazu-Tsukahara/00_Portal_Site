"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useI18n } from "@/i18n";
import FileCard, { FILE_CARD_WIDTH } from "./FileCard";
import type { FileGroup } from "./fileGroups";

const GAP_Y = 12;
const PAD = 12;
const MIN_GAP_X = 8;

type GridLayout = {
  cols: number;
  availW: number;
};

/** 幅から1行の列数を算出（枚数では縮めず左詰め） */
function computeFileGridLayout(
  containerW: number,
  fileCount: number,
): GridLayout {
  const availW = Math.max(0, containerW - PAD * 2);
  if (fileCount <= 0 || availW <= 0) {
    return { cols: 1, availW };
  }

  const maxCols = Math.max(
    1,
    Math.floor((availW + MIN_GAP_X) / (FILE_CARD_WIDTH + MIN_GAP_X)),
  );

  for (let cols = maxCols; cols >= 1; cols--) {
    if (cols === 1) {
      if (availW >= FILE_CARD_WIDTH) return { cols, availW };
      continue;
    }
    const gap = (availW - cols * FILE_CARD_WIDTH) / (cols - 1);
    if (gap >= MIN_GAP_X) {
      return { cols, availW };
    }
  }

  return { cols: 1, availW };
}

function computeRowGap(availW: number, cols: number): number {
  if (cols <= 1) return MIN_GAP_X;
  return Math.max(MIN_GAP_X, (availW - cols * FILE_CARD_WIDTH) / (cols - 1));
}

/** ファイル単位モードのグリッド（PDF型カード・左詰め） */
export default function FileGroupList({
  groups,
  selectedIds,
  onSelectFile,
  onClearSelection,
  onRename,
  onRemove,
  onDuplicate,
}: {
  groups: FileGroup[];
  selectedIds: Set<string>;
  onSelectFile: (
    index: number,
    sourceId: string,
    event: MouseEvent,
  ) => void;
  onClearSelection: () => void;
  onRename: (sourceId: string, name: string) => void;
  onRemove: (sourceId: string) => void;
  onDuplicate: (sourceId: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.pdfEditor.fileList;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [gridLayout, setGridLayout] = useState<GridLayout>({
    cols: 1,
    availW: 0,
  });

  const rows = useMemo(() => {
    const result: FileGroup[][] = [];
    for (let i = 0; i < groups.length; i += gridLayout.cols) {
      result.push(groups.slice(i, i + gridLayout.cols));
    }
    return result;
  }, [groups, gridLayout.cols]);

  const updateLayout = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    setGridLayout(computeFileGridLayout(scroll.clientWidth, groups.length));
  }, [groups.length]);

  useLayoutEffect(() => {
    updateLayout();
    const scroll = scrollRef.current;
    if (!scroll) return;
    const observer = new ResizeObserver(() => updateLayout());
    observer.observe(scroll);
    window.addEventListener("resize", updateLayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [updateLayout]);

  if (groups.length === 0) {
    return (
      <div className="flex min-h-[40dvh] flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/30 md:min-h-0 md:max-h-[650px] md:h-[60vh]">
        <p className="text-sm text-zinc-400">{copy.noFiles}</p>
      </div>
    );
  }

  const rowGap = computeRowGap(gridLayout.availW, gridLayout.cols);

  return (
    <div
      ref={scrollRef}
      className="min-h-[40dvh] flex-1 overflow-x-hidden overflow-y-auto rounded-lg border border-zinc-200/60 bg-zinc-50/30 [scrollbar-width:thin] md:min-h-0 md:max-h-[650px] md:h-[60vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClearSelection();
      }}
    >
      <div
        style={{ padding: PAD }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClearSelection();
        }}
      >
        <SortableContext
          items={groups.map((g) => g.sourceId)}
          strategy={rectSortingStrategy}
        >
          <div
            className="flex w-full flex-col items-stretch"
            style={{ rowGap: GAP_Y }}
          >
            {rows.map((row, rowIndex) => {
              const startIndex = rowIndex * gridLayout.cols;
              return (
                <div
                  key={`file-row-${startIndex}-${row
                    .map((g) => g.sourceId)
                    .join("-")}`}
                  className="flex w-full shrink-0 justify-start"
                  style={{ columnGap: rowGap }}
                >
                  {row.map((group, i) => {
                    const index = startIndex + i;
                    return (
                      <FileCard
                        key={group.sourceId}
                        group={group}
                        isSelected={selectedIds.has(group.sourceId)}
                        onSelect={(event) =>
                          onSelectFile(index, group.sourceId, event)
                        }
                        onRename={onRename}
                        onRemove={onRemove}
                        onDuplicate={onDuplicate}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
