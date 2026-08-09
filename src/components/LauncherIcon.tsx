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
import type { Tool } from "@/data/tools";
import { fmt, useI18n } from "@/i18n";

type DragListeners = Record<string, unknown> | undefined;

type Props = {
  tool: Tool;
  editing: boolean;
  /** 合成ドロップのターゲット表示 */
  combineTarget?: boolean;
  /** 編集モード中の揺れ遅延（ms） */
  jiggleDelayMs?: number;
  isDragging?: boolean;
  style?: CSSProperties;
  setNodeRef?: Ref<HTMLLIElement>;
  attributes?: DraggableAttributes;
  listeners?: DragListeners;
  onEnterEdit: () => void;
  onRemove: () => void;
  onGroupWithNext?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
};

const LONG_PRESS_MS = 420;

/**
 * ホーム画面のデスクトップ風アプリアイコン。
 * 通常時はリンク、長押し／編集で並べ替え・削除（スマホのホームに近い操作）。
 */
export default function LauncherIcon({
  tool,
  editing,
  combineTarget = false,
  jiggleDelayMs = 0,
  isDragging = false,
  style,
  setNodeRef,
  attributes,
  listeners,
  onEnterEdit,
  onRemove,
  onGroupWithNext,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
}: Props) {
  const { t } = useI18n();
  const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
  const title = copy.title;
  const openLabel = fmt(t.home.openAria, { title });
  const dragLabel = fmt(t.home.dragAria, { title });
  const removeLabel = fmt(t.home.removeAria, { title });

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

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

  function onPointerDownNormal(e: PointerEvent) {
    // 主ボタン／タッチのみ
    if (e.pointerType === "mouse" && e.button !== 0) return;
    startLongPress();
  }

  function onPointerUpNormal() {
    clearLongPress();
  }

  function onClickNormal(e: MouseEvent) {
    // 長押しで編集に入ったあとの誤タップで遷移しない
    if (longPressFired.current) {
      e.preventDefault();
      longPressFired.current = false;
    }
  }

  function onContextMenu(e: MouseEvent) {
    // スマホの長押しメニューを抑止して編集モードへ寄せる
    if (!editing) {
      e.preventDefault();
      onEnterEdit();
    }
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
      onRemove();
    } else if (e.key === "g" || e.key === "G") {
      if (!onGroupWithNext) return;
      e.preventDefault();
      onGroupWithNext();
    }
  }

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
        >
          <span className="launcher-icon__glyph-wrap">
            <button
              type="button"
              className="launcher-icon__remove"
              aria-label={removeLabel}
              title={removeLabel}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
            >
              <span aria-hidden>×</span>
            </button>
            <span className="launcher-icon__glyph" aria-hidden>
              {tool.icon}
            </span>
          </span>
          <span className="launcher-icon__label">{title}</span>
          <span className="sr-only">
            {canMoveLeft ? `${t.home.moveLeft}. ` : ""}
            {canMoveRight ? `${t.home.moveRight}. ` : ""}
            {onGroupWithNext ? `${t.home.groupWithNext}. ` : ""}
            {removeLabel}
          </span>
        </div>
      ) : (
        <a
          href={tool.href}
          className="launcher-icon group"
          aria-label={openLabel}
          onPointerDown={onPointerDownNormal}
          onPointerUp={onPointerUpNormal}
          onPointerLeave={onPointerUpNormal}
          onPointerCancel={onPointerUpNormal}
          onClick={onClickNormal}
          onContextMenu={onContextMenu}
        >
          <span className="launcher-icon__glyph-wrap">
            <span className="launcher-icon__glyph" aria-hidden>
              {tool.icon}
            </span>
          </span>
          <span className="launcher-icon__label">{title}</span>
        </a>
      )}
    </li>
  );
}
