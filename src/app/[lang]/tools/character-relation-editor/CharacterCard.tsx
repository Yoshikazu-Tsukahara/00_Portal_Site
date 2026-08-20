"use client";

import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { getCardLayoutData, hasCardBodyContent } from "./cardLayout";
import AvatarBubble from "./AvatarBubble";
import { ACCENT_CLASSES, CARD_H, CARD_W } from "./styles";
import type { Character } from "./types";

/** キャンバス上のキャラクターカード */
export default function CharacterCard({
  character: ch,
  active,
  linkingFrom,
  dragging,
  noNoteLabel,
  pickTargetLabel,
  onPointerDown,
  onDoubleClick,
  onSelect,
  onHeightChange,
}: {
  character: Character;
  active: boolean;
  linkingFrom: boolean;
  dragging: boolean;
  noNoteLabel: string;
  pickTargetLabel: string;
  onPointerDown: (e: ReactPointerEvent) => void;
  onDoubleClick: (e: ReactMouseEvent) => void;
  onSelect: () => void;
  onHeightChange: (h: number) => void;
}) {
  const accent = ACCENT_CLASSES[ch.accent];
  const layout = getCardLayoutData(ch);
  const hasBody = hasCardBodyContent(layout);

  return (
    <div
      role="button"
      tabIndex={0}
      ref={(el) => {
        if (!el) return;
        const h = Math.round(el.offsetHeight);
        if (h > 0) onHeightChange(h);
      }}
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect();
      }}
      className={`absolute select-none rounded-lg border border-zinc-200/90 border-l-4 bg-white p-2.5 shadow-md transition-[box-shadow] duration-200 ${accent.border} ${
        active || linkingFrom
          ? "z-20 shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-300"
          : "z-10 hover:shadow-lg hover:shadow-zinc-900/8"
      } ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        left: ch.x,
        top: ch.y,
        width: CARD_W,
        minHeight: CARD_H,
      }}
    >
      <div className="flex items-start gap-2">
        {/* アイコン＋二つ名 */}
        <div className="flex w-9 shrink-0 flex-col items-center gap-0.5">
          <AvatarBubble
            src={ch.avatarDataUrl}
            preset={ch.avatarPreset}
            size="md"
          />
          {layout.nickname ? (
            <p
              className="w-full truncate text-center text-[9px] leading-tight text-zinc-500"
              title={layout.nickname}
            >
              {layout.nickname}
            </p>
          ) : null}
        </div>

        {/* 名前・年齢/性別・その他 */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold tracking-tight text-zinc-900">
            {ch.name}
          </p>

          {layout.age || layout.gender ? (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-zinc-500">
              {layout.age ? (
                <span className="truncate">{layout.age}</span>
              ) : null}
              {layout.age && layout.gender ? (
                <span className="text-zinc-300" aria-hidden>
                  ·
                </span>
              ) : null}
              {layout.gender ? (
                <span className="truncate">{layout.gender}</span>
              ) : null}
            </div>
          ) : null}

          {layout.extras.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {layout.extras.map((item) =>
                item.compact ? (
                  <span
                    key={item.key}
                    className="max-w-full truncate rounded-md border border-zinc-200/90 bg-zinc-50 px-1.5 py-0.5 text-[10px] leading-tight text-zinc-600"
                  >
                    {item.text}
                  </span>
                ) : (
                  <span
                    key={item.key}
                    className="basis-full truncate text-[11px] leading-snug text-zinc-500"
                  >
                    {item.text}
                  </span>
                ),
              )}
            </div>
          ) : !hasBody ? (
            <p className="mt-0.5 text-[11px] text-zinc-400">{noNoteLabel}</p>
          ) : null}
        </div>
      </div>

      {linkingFrom ? (
        <p className="mt-1.5 text-[10px] font-medium text-zinc-500">
          {pickTargetLabel}
        </p>
      ) : null}
    </div>
  );
}
