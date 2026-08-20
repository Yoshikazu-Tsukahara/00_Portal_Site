"use client";

import { strokeDasharrayFor } from "./relationLineRender";
import type { RelationArrowHead, RelationStrokeStyle } from "./types";

/** サイドバー用：キャンバスと同じ線種・矢印を示すミニコネクタ */
export default function RelationLinkGlyph({
  strokeStyle,
  arrowHead,
  active = false,
}: {
  strokeStyle: RelationStrokeStyle;
  arrowHead: RelationArrowHead;
  active?: boolean;
}) {
  const stroke = active ? "#18181b" : "#a1a1aa";
  const dash = strokeDasharrayFor(strokeStyle);
  const uid = `${strokeStyle}-${arrowHead}-${active ? "a" : "i"}`;
  const showStart = arrowHead === "start" || arrowHead === "both";
  const showEnd = arrowHead === "end" || arrowHead === "both";

  return (
    <svg
      width="36"
      height="12"
      viewBox="0 0 36 12"
      className="mx-1 inline-block shrink-0 align-middle"
      aria-hidden
    >
      <defs>
        <marker
          id={`sb-end-${uid}`}
          markerWidth="6"
          markerHeight="6"
          refX="5.5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0.4 L5.5,3 L0,5.6 Z" fill={stroke} />
        </marker>
        <marker
          id={`sb-start-${uid}`}
          markerWidth="6"
          markerHeight="6"
          refX="0.5"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M5.5,0.4 L0,3 L5.5,5.6 Z" fill={stroke} />
        </marker>
      </defs>
      <line
        x1="3"
        y1="6"
        x2="33"
        y2="6"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={dash}
        markerStart={showStart ? `url(#sb-start-${uid})` : undefined}
        markerEnd={showEnd ? `url(#sb-end-${uid})` : undefined}
      />
    </svg>
  );
}
