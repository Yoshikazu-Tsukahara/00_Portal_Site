"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  Ref,
} from "react";
import { useRef } from "react";
import ToolGlyph from "@/components/ToolGlyph";
import type { Tool } from "@/data/tools";
import { fmt, useI18n } from "@/i18n";
import type { HomeFolderItem } from "@/lib/homePins";
import { type LaunchOrigin, readLaunchOrigin } from "@/lib/launcher/motion";

type DragListeners = Record<string, unknown> | undefined;

type Props = {
  folder: HomeFolderItem;
  previewTools: Tool[];
  editing: boolean;
  combineTarget?: boolean;
  jiggleDelayMs?: number;
  isDragging?: boolean;
  style?: CSSProperties;
  setNodeRef?: Ref<HTMLLIElement>;
  attributes?: DraggableAttributes;
  listeners?: DragListeners;
  onEnterEdit: () => void;
  /** アイコン以外（セル余白）タップで編集終了 */
  onExitEdit?: () => void;
  onOpen: (origin: LaunchOrigin | null) => void;
  onDissolve: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
};

const LONG_PRESS_MS = 420;

/**
 * ホーム上のフォルダアイコン（2×2 プレビュー）。
 */
export default function LauncherFolderIcon({
  folder,
  previewTools,
  editing,
  combineTarget = false,
  jiggleDelayMs = 0,
  isDragging = false,
  style,
  setNodeRef,
  attributes,
  listeners,
  onEnterEdit,
  onExitEdit,
  onOpen,
  onDissolve,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
}: Props) {
  const { t } = useI18n();
  const title = folder.name.trim() || t.home.folderDefaultName;
  const openLabel = fmt(t.home.openFolderAria, { title });
  const dragLabel = fmt(t.home.folderDragAria, { title });
  const dissolveLabel = fmt(t.home.dissolveFolderAria, { title });

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);
  const glyphRef = useRef<HTMLSpanElement | null>(null);

  function openWithOrigin() {
    const el =
      glyphRef.current?.querySelector(".launcher-icon__glyph") ??
      glyphRef.current;
    onOpen(readLaunchOrigin(el));
  }

  function clearLongPress() {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function startLongPress() {
    clearLongPress();
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      try {
        navigator.vibrate?.(12);
      } catch {
        /* 未対応端末は無視 */
      }
      onEnterEdit();
    }, LONG_PRESS_MS);
  }

  function onKeyDownEdit(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      if (!canMoveLeft || !onMoveLeft) return;
      e.preventDefault();
      onMoveLeft();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      if (!canMoveRight || !onMoveRight) return;
      e.preventDefault();
      onMoveRight();
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      onDissolve();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openWithOrigin();
    }
  }

  const slots = [0, 1, 2, 3].map((i) => previewTools[i] ?? null);

  const glyph = (
    <span
      ref={glyphRef}
      className="launcher-icon__glyph launcher-folder__glyph"
      aria-hidden
    >
      <span className="launcher-folder__grid">
        {slots.map((tool, i) => (
          <span key={i} className="launcher-folder__cell">
            {tool ? <ToolGlyph tool={tool} /> : null}
          </span>
        ))}
      </span>
    </span>
  );

  return (
    <li
      ref={setNodeRef}
      style={
        {
          ...style,
          ["--launcher-jiggle-delay" as string]: `${jiggleDelayMs}ms`,
        } as CSSProperties
      }
      className={`launcher-icon-item${isDragging ? " launcher-icon-item--dragging" : ""}${
        editing ? " launcher-icon-item--editing" : ""
      }${combineTarget ? " launcher-icon-item--combine" : ""}`}
      onClick={(e) => {
        if (!editing || !onExitEdit) return;
        if ((e.target as HTMLElement).closest(".launcher-icon")) return;
        onExitEdit();
      }}
    >
      {editing ? (
        <div
          className="launcher-icon launcher-icon--editing"
          {...attributes}
          {...listeners}
          role="button"
          tabIndex={0}
          aria-roledescription="sortable"
          aria-label={dragLabel}
          aria-grabbed={isDragging || undefined}
          onKeyDown={onKeyDownEdit}
          onDoubleClick={(e) => {
            e.preventDefault();
            openWithOrigin();
          }}
        >
          <span className="launcher-icon__glyph-wrap">
            <button
              type="button"
              className="launcher-icon__remove"
              aria-label={dissolveLabel}
              title={dissolveLabel}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDissolve();
              }}
            >
              <span aria-hidden>×</span>
            </button>
            {glyph}
          </span>
        </div>
      ) : (
        <button
          type="button"
          className="launcher-icon group"
          aria-label={openLabel}
          onPointerDown={(e: PointerEvent) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            startLongPress();
          }}
          onPointerUp={clearLongPress}
          onPointerLeave={clearLongPress}
          onPointerCancel={clearLongPress}
          onClick={(e: MouseEvent) => {
            if (longPressFired.current) {
              e.preventDefault();
              longPressFired.current = false;
              return;
            }
            openWithOrigin();
          }}
          onContextMenu={(e: MouseEvent) => {
            e.preventDefault();
            onEnterEdit();
          }}
        >
          <span className="launcher-icon__glyph-wrap">{glyph}</span>
        </button>
      )}
      <span className="launcher-icon__label" aria-hidden>
        {title}
      </span>
    </li>
  );
}
