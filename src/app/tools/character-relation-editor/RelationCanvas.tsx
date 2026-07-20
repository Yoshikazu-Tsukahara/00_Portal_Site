"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useI18n } from "@/i18n";
import { loadLocalJson, saveLocalJson } from "@/lib/localData";
import AvatarBubble from "./AvatarBubble";
import {
  cardConnectionPoints,
  readableLabelAngle,
  snapToGrid,
} from "./geometry";
import { ACCENT_CLASSES, CARD_H, CARD_W, GRID_SIZE } from "./styles";
import {
  clampZoom,
  DEFAULT_ZOOM,
  getCardDisplayLines,
  MAX_ZOOM,
  MIN_ZOOM,
  normalizeCanvasUiPrefs,
  RELATION_ARROW_HEADS,
  RELATION_STROKE_STYLES,
  VIEW_STORAGE_KEY,
  WORLD_H,
  WORLD_W,
  ZOOM_STEP,
  type CanvasUiPrefs,
  type CanvasViewFavorite,
  type Character,
  type PlacementMode,
  type Relation,
  type RelationArrowHead,
  type RelationStrokeStyle,
} from "./types";
import {
  relationMarkerUrls,
  strokeDasharrayFor,
} from "./relationLineRender";

type DragState = {
  id: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
};

/** 線まわりのクリック当たり判定（見た目の線より太く） */
const HIT_STROKE = 28;

/** グリッド背景のキャンバス：カード配置・関係線・ズーム */
export default function RelationCanvas({
  characters,
  relations,
  selectedCharacterId,
  selectedRelationId,
  linkFromId,
  onSelectCharacter,
  onSelectRelation,
  onMoveCharacter,
  onCompleteLink,
  onUpdateRelation,
  onOpenDetail,
}: {
  characters: Character[];
  relations: Relation[];
  selectedCharacterId: string | null;
  selectedRelationId: string | null;
  linkFromId: string | null;
  onSelectCharacter: (id: string | null) => void;
  onSelectRelation: (id: string | null) => void;
  onMoveCharacter: (id: string, x: number, y: number) => void;
  onCompleteLink: (toId: string) => void;
  onUpdateRelation: (
    id: string,
    patch: Partial<Pick<Relation, "label" | "strokeStyle" | "arrowHead">>,
  ) => void;
  onOpenDetail: (id: string) => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.characterRelation;
  const viewportRef = useRef<HTMLDivElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
  const [prefs, setPrefs] = useState<CanvasUiPrefs>({
    favorite: null,
    placementMode: "snap",
  });
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const skipLabelBlurRef = useRef(false);
  const zoomRef = useRef(zoom);
  const placementRef = useRef<PlacementMode>(prefs.placementMode);
  zoomRef.current = zoom;
  placementRef.current = prefs.placementMode;

  const charMap = useMemo(() => {
    const m = new Map<string, Character>();
    for (const c of characters) m.set(c.id, c);
    return m;
  }, [characters]);

  const selectedRelation = selectedRelationId
    ? (relations.find((r) => r.id === selectedRelationId) ?? null)
    : null;

  const favorite = prefs.favorite;
  const placementMode = prefs.placementMode;

  function persistPrefs(next: CanvasUiPrefs) {
    setPrefs(next);
    saveLocalJson(VIEW_STORAGE_KEY, next);
  }

  // UI 設定を LocalStorage から復元
  useEffect(() => {
    const raw = loadLocalJson<unknown>(VIEW_STORAGE_KEY, null);
    setPrefs(normalizeCanvasUiPrefs(raw));
  }, []);

  useEffect(() => {
    if (!editingLabelId) return;
    labelInputRef.current?.focus();
    labelInputRef.current?.select();
  }, [editingLabelId]);

  const applyZoomAround = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const el = viewportRef.current;
      const z = clampZoom(nextZoom);
      if (!el) {
        setZoom(z);
        return;
      }
      const rect = el.getBoundingClientRect();
      const cx = clientX ?? rect.left + rect.width / 2;
      const cy = clientY ?? rect.top + rect.height / 2;
      const contentX = (el.scrollLeft + (cx - rect.left)) / zoomRef.current;
      const contentY = (el.scrollTop + (cy - rect.top)) / zoomRef.current;
      setZoom(z);
      requestAnimationFrame(() => {
        el.scrollLeft = contentX * z - (cx - rect.left);
        el.scrollTop = contentY * z - (cy - rect.top);
        setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
      });
    },
    [],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      applyZoomAround(zoomRef.current + delta, e.clientX, e.clientY);
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyZoomAround]);

  useEffect(() => {
    if (!drag) return;

    function onMove(e: PointerEvent) {
      if (!drag) return;
      const z = zoomRef.current;
      const dx = (e.clientX - drag.startX) / z;
      const dy = (e.clientY - drag.startY) / z;
      const x = Math.max(8, drag.origX + dx);
      const y = Math.max(8, drag.origY + dy);
      onMoveCharacter(drag.id, x, y);
    }

    function onUp(e: PointerEvent) {
      if (drag && placementRef.current === "snap") {
        const z = zoomRef.current;
        const dx = (e.clientX - drag.startX) / z;
        const dy = (e.clientY - drag.startY) / z;
        let x = Math.max(8, drag.origX + dx);
        let y = Math.max(8, drag.origY + dy);
        x = Math.max(0, snapToGrid(x, GRID_SIZE));
        y = Math.max(0, snapToGrid(y, GRID_SIZE));
        onMoveCharacter(drag.id, x, y);
      }
      setDrag(null);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, onMoveCharacter]);

  function zoomBy(delta: number) {
    applyZoomAround(zoomRef.current + delta);
  }

  function setPlacementMode(mode: PlacementMode) {
    persistPrefs({ ...prefs, placementMode: mode });
  }

  function memorizeView() {
    const el = viewportRef.current;
    const nextFavorite: CanvasViewFavorite = {
      zoom,
      scrollLeft: el?.scrollLeft ?? 0,
      scrollTop: el?.scrollTop ?? 0,
    };
    persistPrefs({ ...prefs, favorite: nextFavorite });
  }

  function resetView() {
    const el = viewportRef.current;
    const target = favorite ?? {
      zoom: DEFAULT_ZOOM,
      scrollLeft: 0,
      scrollTop: 0,
    };
    setZoom(clampZoom(target.zoom));
    requestAnimationFrame(() => {
      if (!el) return;
      el.scrollLeft = target.scrollLeft;
      el.scrollTop = target.scrollTop;
      setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
    });
  }

  function startDrag(e: ReactPointerEvent, ch: Character) {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (linkFromId) {
      if (linkFromId !== ch.id) onCompleteLink(ch.id);
      return;
    }
    onSelectCharacter(ch.id);
    onSelectRelation(null);
    setEditingLabelId(null);
    setDrag({
      id: ch.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: ch.x,
      origY: ch.y,
    });
  }

  function setCardHeight(id: string, h: number) {
    setCardHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }

  function openLabelEditor(rel: Relation) {
    onSelectRelation(rel.id);
    onSelectCharacter(null);
    setDraftLabel(rel.label);
    setEditingLabelId(rel.id);
  }

  function commitLabelEdit() {
    if (!editingLabelId) return;
    onUpdateRelation(editingLabelId, { label: draftLabel.trim() });
    setEditingLabelId(null);
  }

  function cancelLabelEdit() {
    skipLabelBlurRef.current = true;
    setEditingLabelId(null);
  }

  function handleLabelBlur() {
    if (skipLabelBlurRef.current) {
      skipLabelBlurRef.current = false;
      return;
    }
    commitLabelEdit();
  }

  const strokeLabels: Record<RelationStrokeStyle, string> = {
    solid: copy.lineStyles.solid,
    dashed: copy.lineStyles.dashed,
    dotted: copy.lineStyles.dotted,
  };

  const arrowLabels: Record<RelationArrowHead, string> = {
    none: copy.arrowHead.none,
    end: copy.arrowHead.end,
    start: copy.arrowHead.start,
    both: copy.arrowHead.both,
  };

  const gridBgSize = GRID_SIZE * zoom;

  return (
    <div className="relative h-full min-h-[28rem] w-full overflow-hidden rounded-md border border-zinc-200/80 bg-zinc-50 shadow-sm">
      {/* 無限グリッド：ビューポート全体に敷き、スクロールに合わせてずらす */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: "#fafafa",
          backgroundImage: `
            linear-gradient(to right, rgba(24,24,27,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(24,24,27,0.045) 1px, transparent 1px)
          `,
          backgroundSize: `${gridBgSize}px ${gridBgSize}px`,
          backgroundPosition: `${-scrollPos.left}px ${-scrollPos.top}px`,
        }}
      />

      <div
        ref={viewportRef}
        className="relative z-10 h-full w-full overflow-auto bg-transparent"
        onScroll={(e) => {
          const el = e.currentTarget;
          setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
        }}
        onClick={() => {
          onSelectCharacter(null);
          onSelectRelation(null);
          setEditingLabelId(null);
        }}
      >
        <div
          style={{
            width: WORLD_W * zoom,
            height: WORLD_H * zoom,
            position: "relative",
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left transition-transform duration-150 ease-out"
            style={{
              width: WORLD_W,
              height: WORLD_H,
              transform: `scale(${zoom})`,
            }}
          >
            {/* 関係線（SVG） */}
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={WORLD_W}
              height={WORLD_H}
            >
              <defs>
                <marker
                  id="rel-arrow-end"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0.5 L7,4 L0,7.5 Z" fill="#a1a1aa" />
                </marker>
                <marker
                  id="rel-arrow-end-active"
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0.5 L7,4 L0,7.5 Z" fill="#18181b" />
                </marker>
                <marker
                  id="rel-arrow-start"
                  markerWidth="8"
                  markerHeight="8"
                  refX="1"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M7,0.5 L0,4 L7,7.5 Z" fill="#a1a1aa" />
                </marker>
                <marker
                  id="rel-arrow-start-active"
                  markerWidth="8"
                  markerHeight="8"
                  refX="1"
                  refY="4"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M7,0.5 L0,4 L7,7.5 Z" fill="#18181b" />
                </marker>
              </defs>

              {relations.map((rel) => {
                const from = charMap.get(rel.fromId);
                const to = charMap.get(rel.toId);
                if (!from || !to) return null;
                const fromH = cardHeights[from.id] ?? CARD_H;
                const toH = cardHeights[to.id] ?? CARD_H;
                const { x1, y1, x2, y2 } = cardConnectionPoints(
                  { x: from.x, y: from.y, w: CARD_W, h: fromH },
                  { x: to.x, y: to.y, w: CARD_W, h: toH },
                );
                const active = rel.id === selectedRelationId;
                const dash = strokeDasharrayFor(rel.strokeStyle);
                const markers = relationMarkerUrls(rel.arrowHead, active);
                return (
                  <g key={rel.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={active ? "#18181b" : "#a1a1aa"}
                      strokeWidth={active ? 2.25 : 1.5}
                      strokeLinecap={
                        rel.strokeStyle === "dotted" ? "round" : "round"
                      }
                      strokeDasharray={dash}
                      markerStart={markers.start}
                      markerEnd={markers.end}
                    />
                    {/* 広いヒットエリア */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="transparent"
                      strokeWidth={HIT_STROKE}
                      className="pointer-events-auto cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRelation(rel.id);
                        onSelectCharacter(null);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        openLabelEditor(rel);
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* 回転ラベル（線の向きに合わせる） */}
            {relations.map((rel) => {
              const from = charMap.get(rel.fromId);
              const to = charMap.get(rel.toId);
              if (!from || !to) return null;
              const fromH = cardHeights[from.id] ?? CARD_H;
              const toH = cardHeights[to.id] ?? CARD_H;
              const { x1, y1, x2, y2 } = cardConnectionPoints(
                { x: from.x, y: from.y, w: CARD_W, h: fromH },
                { x: to.x, y: to.y, w: CARD_W, h: toH },
              );
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const angle = readableLabelAngle(x1, y1, x2, y2);
              const active = rel.id === selectedRelationId;
              const editing = editingLabelId === rel.id;
              const display =
                rel.label.trim() || copy.canvas.labelPlaceholder;

              if (editing) {
                return (
                  <div
                    key={`edit-${rel.id}`}
                    className="absolute z-30"
                    style={{
                      left: mx,
                      top: my,
                      transform: "translate(-50%, -50%)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="rounded-md border border-zinc-300 bg-white p-2 shadow-lg">
                      <p className="mb-1 text-[10px] font-medium text-zinc-500">
                        {copy.canvas.editLabelTitle}
                      </p>
                      <input
                        ref={labelInputRef}
                        type="text"
                        value={draftLabel}
                        onChange={(e) => setDraftLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitLabelEdit();
                          }
                          if (e.key === "Escape") {
                            e.preventDefault();
                            cancelLabelEdit();
                          }
                        }}
                        onBlur={handleLabelBlur}
                        placeholder={copy.canvas.labelPlaceholder}
                        className="input-field w-44 text-[12px]"
                      />
                      <p className="mt-1 text-[10px] text-zinc-400">
                        {copy.canvas.editLabelHint}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={`label-${rel.id}`}
                  type="button"
                  title={copy.canvas.doubleClickEdit}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRelation(rel.id);
                    onSelectCharacter(null);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    openLabelEditor(rel);
                  }}
                  className={`absolute z-20 max-w-[10rem] truncate rounded-full border px-2 py-0.5 text-[11px] font-medium shadow-sm transition-colors ${
                    active
                      ? "border-zinc-400 bg-white text-zinc-900"
                      : "border-zinc-200/90 bg-white/95 text-zinc-600 hover:border-zinc-300"
                  }`}
                  style={{
                    left: mx,
                    top: my,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  }}
                >
                  {display}
                </button>
              );
            })}

            {/* キャラクターカード */}
            <div
              className="relative"
              style={{ width: WORLD_W, height: WORLD_H }}
            >
              {characters.length === 0 ? (
                <p className="absolute left-1/2 top-1/3 -translate-x-1/2 text-center text-sm text-zinc-400">
                  {copy.canvas.empty}
                </p>
              ) : null}

              {characters.map((ch) => {
                const active = ch.id === selectedCharacterId;
                const linkingFrom = linkFromId === ch.id;
                const accent = ACCENT_CLASSES[ch.accent];
                const lines = getCardDisplayLines(ch);
                return (
                  <div
                    key={ch.id}
                    role="button"
                    tabIndex={0}
                    ref={(el) => {
                      if (!el) return;
                      const h = Math.round(el.offsetHeight);
                      if (h > 0) setCardHeight(ch.id, h);
                    }}
                    onPointerDown={(e) => startDrag(e, ch)}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(ch.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSelectCharacter(ch.id);
                    }}
                    className={`absolute select-none rounded-lg border border-zinc-200/90 border-l-4 bg-white p-3 shadow-md transition-[box-shadow] duration-200 ${accent.border} ${
                      active || linkingFrom
                        ? "z-20 shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-300"
                        : "z-10 hover:shadow-lg hover:shadow-zinc-900/8"
                    } ${drag?.id === ch.id ? "cursor-grabbing" : "cursor-grab"}`}
                    style={{
                      left: ch.x,
                      top: ch.y,
                      width: CARD_W,
                      minHeight: CARD_H,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <AvatarBubble
                        src={ch.avatarDataUrl}
                        preset={ch.avatarPreset}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold tracking-tight text-zinc-900">
                          {ch.name}
                        </p>
                        {lines.length > 0 ? (
                          <ul className="mt-1 space-y-0.5">
                            {lines.map((line) => (
                              <li
                                key={line}
                                className="truncate text-[11px] leading-snug text-zinc-500"
                              >
                                {line}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-0.5 text-[11px] text-zinc-400">
                            {copy.canvas.noNote}
                          </p>
                        )}
                      </div>
                    </div>
                    {linkingFrom ? (
                      <p className="mt-2 text-[10px] font-medium text-zinc-500">
                        {copy.canvas.pickTarget}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 線種・矢印パネル（選択時） */}
      {selectedRelation ? (
        <div
          className="absolute left-3 top-3 z-30 w-[min(100%-1.5rem,17rem)] rounded-md border border-zinc-200/90 bg-white/95 p-2.5 shadow-md backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-1.5 text-[10px] font-medium text-zinc-500">
            {copy.lineStyles.heading}
          </p>
          <div className="flex flex-wrap gap-1">
            {RELATION_STROKE_STYLES.map((strokeStyle) => {
              const active = selectedRelation.strokeStyle === strokeStyle;
              return (
                <button
                  key={strokeStyle}
                  type="button"
                  onClick={() =>
                    onUpdateRelation(selectedRelation.id, { strokeStyle })
                  }
                  className={`rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {strokeLabels[strokeStyle]}
                </button>
              );
            })}
          </div>

          <p className="mb-1.5 mt-2.5 text-[10px] font-medium text-zinc-500">
            {copy.arrowHead.heading}
          </p>
          <div className="flex flex-wrap gap-1">
            {RELATION_ARROW_HEADS.map((arrowHead) => {
              const active = selectedRelation.arrowHead === arrowHead;
              return (
                <button
                  key={arrowHead}
                  type="button"
                  onClick={() =>
                    onUpdateRelation(selectedRelation.id, { arrowHead })
                  }
                  className={`rounded-md border px-2.5 py-1 text-[11px] transition-colors ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {arrowLabels[arrowHead]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => openLabelEditor(selectedRelation)}
            className="mt-2.5 w-full rounded-md border border-zinc-200 px-2 py-1 text-[11px] text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {copy.canvas.editLabelAction}
          </button>
        </div>
      ) : null}

      {/* 配置モード（左下） */}
      <div
        className="absolute bottom-3 left-3 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          role="group"
          aria-label={copy.placement.label}
          className="flex overflow-hidden rounded-md border border-zinc-200/90 bg-white/95 shadow-md backdrop-blur-sm"
        >
          {(
            [
              ["snap", copy.placement.snap],
              ["free", copy.placement.free],
            ] as const
          ).map(([mode, label]) => {
            const active = placementMode === mode;
            return (
              <button
                key={mode}
                type="button"
                title={
                  mode === "snap"
                    ? copy.placement.snapHint
                    : copy.placement.freeHint
                }
                onClick={() => setPlacementMode(mode)}
                className={`px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ズーム・表示リセット操作パネル */}
      <div
        className="absolute bottom-3 right-3 z-30 flex flex-col items-end gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex overflow-hidden rounded-md border border-zinc-200/90 bg-white/95 shadow-md backdrop-blur-sm">
          <button
            type="button"
            title={copy.view.zoomOut}
            aria-label={copy.view.zoomOut}
            disabled={zoom <= MIN_ZOOM}
            onClick={() => zoomBy(-ZOOM_STEP)}
            className="px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-300"
          >
            −
          </button>
          <span className="flex min-w-[3.25rem] items-center justify-center border-x border-zinc-100 px-1 text-[11px] tabular-nums text-zinc-500">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            title={copy.view.zoomIn}
            aria-label={copy.view.zoomIn}
            disabled={zoom >= MAX_ZOOM}
            onClick={() => zoomBy(ZOOM_STEP)}
            className="px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-300"
          >
            ＋
          </button>
        </div>
        <div className="flex overflow-hidden rounded-md border border-zinc-200/90 bg-white/95 shadow-md backdrop-blur-sm">
          <button
            type="button"
            title={copy.view.memorize}
            onClick={memorizeView}
            className="border-r border-zinc-100 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {copy.view.memorize}
          </button>
          <button
            type="button"
            title={
              favorite ? copy.view.resetToFavorite : copy.view.resetToDefault
            }
            onClick={resetView}
            className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {copy.view.reset}
          </button>
        </div>
        <p className="max-w-[12rem] text-right text-[10px] leading-snug text-zinc-400">
          {favorite ? copy.view.favoriteHint : copy.view.defaultHint}
        </p>
      </div>
    </div>
  );
}
