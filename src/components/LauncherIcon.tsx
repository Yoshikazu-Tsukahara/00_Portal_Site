"use client";

import type { DraggableAttributes } from "@dnd-kit/core";
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  Ref,
} from "react";
import { useRef } from "react";
import LauncherLockBadge from "@/components/LauncherLockBadge";
import ToolGlyph from "@/components/ToolGlyph";
import type { Tool } from "@/data/tools";
import { fmt, useI18n } from "@/i18n";
import {
  type LaunchOrigin,
  readLaunchOrigin,
  shouldSkipLaunchAnimation,
} from "@/lib/launcher/motion";
import { useCompactLayout } from "@/lib/useCompactLayout";

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
  /** アイコン以外（セル余白）タップで編集終了 */
  onExitEdit?: () => void;
  onRemove: () => void;
  onGroupWithNext?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  /** 起動アニメ付きでアプリを開く */
  onLaunchApp?: (payload: {
    href: string;
    icon: ReactNode;
    title: string;
    origin: LaunchOrigin | null;
  }) => void;
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
  onExitEdit,
  onRemove,
  onGroupWithNext,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = false,
  canMoveRight = false,
  onLaunchApp,
}: Props) {
  const { t } = useI18n();
  const { compact } = useCompactLayout();
  const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
  const title = copy.title;
  /** スマホ非対応アプリは縦長（狭い画面）では起動不可 */
  const lockedOnMobile = compact && tool.isMobileSupported === false;
  const openLabel = lockedOnMobile
    ? fmt(t.home.lockedOnMobileAria, { title })
    : fmt(t.home.openAria, { title });
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

  function onClickNormal(e: MouseEvent<HTMLAnchorElement>) {
    // 長押しで編集に入ったあとの誤タップで遷移しない
    if (longPressFired.current) {
      e.preventDefault();
      longPressFired.current = false;
      return;
    }
    if (!onLaunchApp || shouldSkipLaunchAnimation(e)) return;
    e.preventDefault();
    const glyph =
      (e.currentTarget.querySelector(".launcher-icon__glyph") as Element | null) ??
      e.currentTarget;
    onLaunchApp({
      href: tool.href,
      icon: <ToolGlyph tool={tool} />,
      title,
      origin: readLaunchOrigin(glyph),
    });
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
      onClick={(e) => {
        if (!editing || !onExitEdit) return;
        // アイコン本体以外（セル余白・ラベル下）なら編集終了
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
            <span
              className={`launcher-icon__glyph${
                lockedOnMobile ? " launcher-icon__glyph--locked" : ""
              }`}
              aria-hidden
            >
              <ToolGlyph tool={tool} />
            </span>
            {lockedOnMobile ? <LauncherLockBadge /> : null}
          </span>
          <span className="sr-only">
            {canMoveLeft ? `${t.home.moveLeft}. ` : ""}
            {canMoveRight ? `${t.home.moveRight}. ` : ""}
            {onGroupWithNext ? `${t.home.groupWithNext}. ` : ""}
            {removeLabel}
          </span>
        </div>
      ) : lockedOnMobile ? (
        <button
          type="button"
          className="launcher-icon launcher-icon--locked group"
          aria-label={openLabel}
          aria-disabled="true"
          title={openLabel}
          onPointerDown={onPointerDownNormal}
          onPointerUp={onPointerUpNormal}
          onPointerLeave={onPointerUpNormal}
          onPointerCancel={onPointerUpNormal}
          onClick={(e) => {
            e.preventDefault();
            if (longPressFired.current) {
              longPressFired.current = false;
            }
          }}
          onContextMenu={onContextMenu}
        >
          <span className="launcher-icon__glyph-wrap">
            <span className="launcher-icon__glyph launcher-icon__glyph--locked" aria-hidden>
              <ToolGlyph tool={tool} />
            </span>
            <LauncherLockBadge />
          </span>
        </button>
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
              <ToolGlyph tool={tool} />
            </span>
          </span>
        </a>
      )}
      <span className="launcher-icon__label" aria-hidden>
        {title}
      </span>
    </li>
  );
}
