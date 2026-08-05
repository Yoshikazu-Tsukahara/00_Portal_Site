"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type CompositionEvent,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { Rnd } from "react-rnd";

import { bookFontCssFamily } from "./fonts";
import { readEditableText, syncEditableText } from "./editableText";
import { frameToPixels, pixelsToFrame, snapFrame, type SnapGuide } from "./snap";
import type { FreeFrame, FreeTextBlock } from "./types";

type FreeTextBoxProps = {
  block: FreeTextBlock;
  sheetWidth: number;
  sheetHeight: number;
  scale: number;
  interactive: boolean;
  selected: boolean;
  placeholder: string;
  dragHint: string;
  onSelect: () => void;
  onChangeFrame: (frame: FreeFrame) => void;
  onChangeText: (text: string) => void;
  onGuidesChange?: (guides: SnapGuide[]) => void;
  onEditEnd?: () => void;
};

/** 用紙クリックへの伝播を止め、選択がすぐ解除されないようにする */
function stopBubble(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

/**
 * Office 風のテキストボックス（本文グリッドとは独立して配置）。
 * - 1 回クリック：選択（枠ドラッグで移動、8 点でリサイズ）
 * - ダブルクリック / Enter：文字編集
 * - Esc / 枠外フォーカス外れ：編集終了（選択は維持）
 */
export default function FreeTextBox({
  block,
  sheetWidth,
  sheetHeight,
  scale,
  interactive,
  selected,
  placeholder,
  dragHint,
  onSelect,
  onChangeFrame,
  onChangeText,
  onGuidesChange,
  onEditEnd,
}: FreeTextBoxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const px = frameToPixels(block.frame, sheetWidth, sheetHeight);
  const fontSize = Math.max(
    10,
    Math.min(sheetWidth, sheetHeight) * block.fontScale,
  );
  const zStyle: CSSProperties = {
    // 選択ブーストはしない（するとレイヤー順が選択中に見えなくなる）
    zIndex: 10 + block.zIndex,
  };
  const vertical = block.writingMode === "vertical";
  const editable = interactive && selected && editing;
  const fontCss = bookFontCssFamily(block.fontFamily);

  // 選択が外れたら編集モードも終了
  useEffect(() => {
    if (!selected) setEditing(false);
  }, [selected]);

  // 選択中（非編集）はキーボード操作（Enter / F2）のため枠にフォーカス
  useEffect(() => {
    if (!interactive || !selected || editing) return;
    const element = ref.current;
    if (!element) return;
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable)
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      element.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [interactive, selected, editing, block.id]);

  // 編集開始時だけキャレットを出す
  useEffect(() => {
    if (!editable) return;
    const element = ref.current;
    if (!element) return;
    const timer = window.setTimeout(() => {
      element.focus({ preventScroll: true });
      const selection = window.getSelection();
      if (!selection) return;
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [editable, block.id]);

  // 選択解除・閲覧・非編集時は block.text を DOM に載せる
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (editable && document.activeElement === element) return;
    syncEditableText(element, block.text);
  }, [block.text, editable]);

  function commitFrame(raw: FreeFrame) {
    const snapped = snapFrame(raw, sheetWidth, sheetHeight);
    onGuidesChange?.(snapped.guides);
    onChangeFrame(snapped.frame);
    window.setTimeout(() => onGuidesChange?.([]), 400);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function handleCompositionStart(event: CompositionEvent<HTMLDivElement>) {
    event.currentTarget.dataset.composing = "1";
  }

  function emitText(element: HTMLElement) {
    const text = readEditableText(element);
    if (element.textContent !== text) {
      syncEditableText(element, text);
    }
    onChangeText(text);
  }

  function handleCompositionEnd(event: CompositionEvent<HTMLDivElement>) {
    delete event.currentTarget.dataset.composing;
    emitText(event.currentTarget);
  }

  function beginEditing(event?: ReactMouseEvent | KeyboardEvent) {
    event?.stopPropagation();
    onSelect();
    setEditing(true);
  }

  function endEditing(element?: HTMLElement | null) {
    if (element) emitText(element);
    setEditing(false);
    onEditEnd?.();
  }

  const writingStyle: CSSProperties = {
    fontSize,
    fontFamily: fontCss,
    writingMode: vertical ? "vertical-rl" : "horizontal-tb",
  };

  const inner = (
    <div
      ref={ref}
      className="bv-free-text__inner"
      style={writingStyle}
      contentEditable={editable}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      data-empty={block.text.trim() === "" ? "true" : undefined}
      title={interactive && selected && !editing ? dragHint : undefined}
      tabIndex={interactive && selected && !editing ? 0 : undefined}
      onMouseDown={
        interactive
          ? (event) => {
              // 編集中はドラッグに吸われないよう止める。
              // 非編集時は伝播させ、Rnd が枠ごと移動できるようにする。
              if (editing) {
                event.stopPropagation();
              }
              onSelect();
            }
          : undefined
      }
      onDoubleClick={
        interactive
          ? (event) => {
              beginEditing(event);
            }
          : undefined
      }
      onClick={interactive ? stopBubble : undefined}
      onKeyDown={
        interactive && selected
          ? (event: KeyboardEvent<HTMLDivElement>) => {
              if (editing && event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                endEditing(event.currentTarget);
                return;
              }
              // 選択中（非編集）で Enter → 編集開始
              if (
                !editing &&
                (event.key === "Enter" || event.key === "F2")
              ) {
                event.preventDefault();
                beginEditing(event);
              }
            }
          : undefined
      }
      onBlur={
        editable
          ? (event) => {
              endEditing(event.currentTarget);
            }
          : undefined
      }
      onCompositionStart={editable ? handleCompositionStart : undefined}
      onCompositionEnd={editable ? handleCompositionEnd : undefined}
      onInput={
        editable
          ? (event: FormEvent<HTMLDivElement>) => {
              const native = event.nativeEvent as InputEvent;
              if (
                event.currentTarget.dataset.composing === "1" ||
                native.isComposing
              ) {
                return;
              }
              emitText(event.currentTarget);
            }
          : undefined
      }
      onPaste={editable ? handlePaste : undefined}
    />
  );

  const boxClass = [
    "bv-free-text",
    selected ? "bv-free-text--selected" : "",
    editing ? "bv-free-text--editing" : "",
    interactive && !selected ? "bv-free-text--hit" : "",
    vertical ? "bv-free-text--vertical" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // サムネ／閲覧：移動不要なので通常の絶対配置
  if (!interactive) {
    // 編集時の Rnd と同じく transform で置く（完成プレビューとの位置ずれを防ぐ）
    return (
      <div
        className={boxClass}
        style={{
          left: 0,
          top: 0,
          width: px.width,
          height: px.height,
          transform: `translate(${px.x}px, ${px.y}px)`,
          fontFamily: fontCss,
          ...zStyle,
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Rnd
      size={{ width: px.width, height: px.height }}
      position={{ x: px.x, y: px.y }}
      scale={scale}
      bounds="parent"
      minWidth={48}
      minHeight={36}
      // 編集中は文字選択優先。選択中のみ枠をドラッグ
      disableDragging={!selected || editing}
      enableResizing={
        selected
          ? {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }
          : false
      }
      style={{ ...zStyle, fontFamily: fontCss }}
      onDrag={(_event, data) => {
        const raw = pixelsToFrame(
          data.x,
          data.y,
          px.width,
          px.height,
          sheetWidth,
          sheetHeight,
        );
        onGuidesChange?.(snapFrame(raw, sheetWidth, sheetHeight).guides);
      }}
      onDragStop={(_event, data) => {
        commitFrame(
          pixelsToFrame(
            data.x,
            data.y,
            px.width,
            px.height,
            sheetWidth,
            sheetHeight,
          ),
        );
      }}
      onResize={(_event, _dir, element, _delta, position) => {
        const raw = pixelsToFrame(
          position.x,
          position.y,
          element.offsetWidth,
          element.offsetHeight,
          sheetWidth,
          sheetHeight,
        );
        onGuidesChange?.(snapFrame(raw, sheetWidth, sheetHeight).guides);
      }}
      onResizeStop={(_event, _dir, element, _delta, position) => {
        commitFrame(
          pixelsToFrame(
            position.x,
            position.y,
            element.offsetWidth,
            element.offsetHeight,
            sheetWidth,
            sheetHeight,
          ),
        );
      }}
      className={boxClass}
      onMouseDown={(event) => {
        stopBubble(event);
        onSelect();
      }}
      onDoubleClick={(event: ReactMouseEvent) => {
        beginEditing(event);
      }}
      onClick={stopBubble}
    >
      {inner}
    </Rnd>
  );
}
