"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useI18n } from "@/i18n";
import { loadLocalJson, saveLocalJson } from "@/lib/localData";
import CharacterCard from "./CharacterCard";
import {
  cardConnectionPoints,
  readableLabelAngle,
  snapToGrid,
} from "./geometry";
import { CARD_H, CARD_W, GRID_SIZE } from "./styles";
import {
  clampZoom,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  normalizeCanvasUiPrefs,
  ORIGIN_PAD,
  RELATION_ARROW_HEADS,
  RELATION_STROKE_STYLES,
  VIEW_STORAGE_KEY,
  WORLD_CONTENT_MIN,
  WORLD_EDGE_PAD,
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
  onLoadSample,
  recenterToken = 0,
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
  /** 空キャンバスからのサンプル読込 */
  onLoadSample?: () => void;
  /** 変わるたびに原点へ再センタリング（サンプル読込時など） */
  recenterToken?: number;
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
  /** ズーム適用後、レイアウト確定直後に合わせるスクロール先 */
  const pendingScrollRef = useRef<{ left: number; top: number } | null>(null);
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
  const didInitViewRef = useRef(false);
  /** サンプル読込などの recenterToken を何回処理したか */
  const handledRecenterRef = useRef(0);

  /** カード配置に応じて伸びる半無限コンテンツ領域（負座標は ORIGIN_PAD 側へはみ出し） */
  const contentSize = useMemo(() => {
    let maxX = WORLD_CONTENT_MIN;
    let maxY = WORLD_CONTENT_MIN;
    for (const c of characters) {
      const h = cardHeights[c.id] ?? CARD_H;
      maxX = Math.max(maxX, c.x + CARD_W + WORLD_EDGE_PAD);
      maxY = Math.max(maxY, c.y + h + WORLD_EDGE_PAD);
    }
    return { w: Math.ceil(maxX), h: Math.ceil(maxY) };
  }, [characters, cardHeights]);
  const contentSizeRef = useRef(contentSize);
  contentSizeRef.current = contentSize;

  const worldW = ORIGIN_PAD + contentSize.w;
  const worldH = ORIGIN_PAD + contentSize.h;

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

  /** ズーム変更後のスクロールを、描画レイアウトと同じフレームで確定させる */
  useLayoutEffect(() => {
    const pending = pendingScrollRef.current;
    if (!pending) return;
    pendingScrollRef.current = null;
    const el = viewportRef.current;
    if (!el) return;
    el.scrollLeft = pending.left;
    el.scrollTop = pending.top;
    setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
  }, [zoom]);

  /** 原点（＋）がビューポート中央に来るようスクロール */
  const goToOrigin = useCallback((nextZoom?: number) => {
    const el = viewportRef.current;
    const prevZoom = zoomRef.current;
    const z = clampZoom(nextZoom ?? prevZoom);
    const target = el
      ? {
          left: ORIGIN_PAD * z - el.clientWidth / 2,
          top: ORIGIN_PAD * z - el.clientHeight / 2,
        }
      : null;
    zoomRef.current = z;
    // ズーム値が同じだと useLayoutEffect が走らないので、その場合は即スクロール
    if (el && target && z === prevZoom) {
      el.scrollLeft = target.left;
      el.scrollTop = target.top;
      setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
      return;
    }
    if (target) pendingScrollRef.current = target;
    setZoom(z);
  }, []);

  // 初回表示は原点を画面中央に
  useEffect(() => {
    if (didInitViewRef.current) return;
    const el = viewportRef.current;
    if (!el) return;
    didInitViewRef.current = true;
    goToOrigin(DEFAULT_ZOOM);
  }, [goToOrigin]);

  // サンプル読込など、外部からの再センタリング要求（トークン変化時のみ）
  useEffect(() => {
    if (recenterToken <= 0) return;
    if (recenterToken === handledRecenterRef.current) return;
    handledRecenterRef.current = recenterToken;
    goToOrigin(DEFAULT_ZOOM);
  }, [recenterToken, goToOrigin]);

  /**
   * 指定座標（未指定ならビュー中央）を基準にズーム。
   * scale と scroll を同一レイアウトフレームで合わせ、がたつきを防ぐ。
   */
  const applyZoomAround = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const el = viewportRef.current;
      const prev = zoomRef.current;
      const z = clampZoom(nextZoom);
      if (z === prev) return;
      if (!el) {
        zoomRef.current = z;
        setZoom(z);
        return;
      }
      const rect = el.getBoundingClientRect();
      const cx = clientX ?? rect.left + rect.width / 2;
      const cy = clientY ?? rect.top + rect.height / 2;
      const contentX = (el.scrollLeft + (cx - rect.left)) / prev;
      const contentY = (el.scrollTop + (cy - rect.top)) / prev;
      zoomRef.current = z;
      pendingScrollRef.current = {
        left: contentX * z - (cx - rect.left),
        top: contentY * z - (cy - rect.top),
      };
      setZoom(z);
    },
    [],
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      // トラックパッドの連続入力に合わせて等比ズーム（ボタンの ±0.1 刻みとは別）
      const factor = Math.exp(-e.deltaY * 0.0018);
      applyZoomAround(zoomRef.current * factor, e.clientX, e.clientY);
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
      // 原点より手前（負座標）も可。パッド内に収める
      const size = contentSizeRef.current;
      const min = -(ORIGIN_PAD - GRID_SIZE * 2);
      const x = Math.min(
        Math.max(min, drag.origX + dx),
        size.w - GRID_SIZE,
      );
      const y = Math.min(
        Math.max(min, drag.origY + dy),
        size.h - GRID_SIZE,
      );
      onMoveCharacter(drag.id, x, y);
    }

    function onUp(e: PointerEvent) {
      if (drag && placementRef.current === "snap") {
        const z = zoomRef.current;
        const dx = (e.clientX - drag.startX) / z;
        const dy = (e.clientY - drag.startY) / z;
        const size = contentSizeRef.current;
        const min = -(ORIGIN_PAD - GRID_SIZE * 2);
        let x = Math.min(
          Math.max(min, drag.origX + dx),
          size.w - GRID_SIZE,
        );
        let y = Math.min(
          Math.max(min, drag.origY + dy),
          size.h - GRID_SIZE,
        );
        x = Math.min(
          Math.max(min, snapToGrid(x, GRID_SIZE)),
          size.w - GRID_SIZE,
        );
        y = Math.min(
          Math.max(min, snapToGrid(y, GRID_SIZE)),
          size.h - GRID_SIZE,
        );
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
    if (favorite) {
      const el = viewportRef.current;
      const z = clampZoom(favorite.zoom);
      zoomRef.current = z;
      if (el && z === zoom) {
        el.scrollLeft = favorite.scrollLeft;
        el.scrollTop = favorite.scrollTop;
        setScrollPos({ left: el.scrollLeft, top: el.scrollTop });
        return;
      }
      pendingScrollRef.current = {
        left: favorite.scrollLeft,
        top: favorite.scrollTop,
      };
      setZoom(z);
      return;
    }
    goToOrigin(DEFAULT_ZOOM);
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
            width: worldW * zoom,
            height: worldH * zoom,
            position: "relative",
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left will-change-transform"
            style={{
              width: worldW,
              height: worldH,
              transform: `scale(${zoom})`,
            }}
          >
            {/* 論理原点 (0,0) を ORIGIN_PAD だけずらした作業領域 */}
            <div
              className="absolute"
              style={{
                left: ORIGIN_PAD,
                top: ORIGIN_PAD,
                width: contentSize.w,
                height: contentSize.h,
              }}
            >
            {/* 原点マーカー（グリッド交点に合わせた＋） */}
            <div
              aria-hidden
              className="pointer-events-none absolute z-[1]"
              style={{ left: 0, top: 0 }}
              title="origin"
            >
              <span className="absolute left-0 top-1/2 h-px w-3.5 -translate-x-1/2 -translate-y-1/2 bg-zinc-400/90" />
              <span className="absolute left-1/2 top-0 h-3.5 w-px -translate-x-1/2 -translate-y-1/2 bg-zinc-400/90" />
              <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500/80" />
            </div>

            {/* 関係線（SVG） */}
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={contentSize.w}
              height={contentSize.h}
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
              style={{ width: contentSize.w, height: contentSize.h }}
            >
              {characters.map((ch) => {
                const active = ch.id === selectedCharacterId;
                const linkingFrom = linkFromId === ch.id;
                return (
                  <CharacterCard
                    key={ch.id}
                    character={ch}
                    active={active}
                    linkingFrom={linkingFrom}
                    dragging={drag?.id === ch.id}
                    noNoteLabel={copy.canvas.noNote}
                    pickTargetLabel={copy.canvas.pickTarget}
                    onPointerDown={(e) => startDrag(e, ch)}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onOpenDetail(ch.id);
                    }}
                    onSelect={() => onSelectCharacter(ch.id)}
                    onHeightChange={(h) => setCardHeight(ch.id, h)}
                  />
                );
              })}
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* 空状態はビューポート中央（スクロール非依存） */}
      {characters.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
          <div className="pointer-events-auto flex w-[min(18rem,90%)] flex-col items-center gap-3 text-center">
            <p className="text-sm text-zinc-400">{copy.canvas.empty}</p>
            {onLoadSample ? (
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="btn-secondary !px-3 !py-1.5 text-xs"
                >
                  {copy.canvas.emptyLoadSample}
                </button>
                <p className="text-[10px] leading-relaxed text-zinc-400">
                  {copy.sample.hint}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
                      ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900"
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
                      ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900"
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
                    ? "bg-[var(--accent)] text-zinc-900"
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
            title={copy.view.goToOriginTitle}
            aria-label={copy.view.goToOriginTitle}
            onClick={() => goToOrigin()}
            className="border-r border-zinc-100 px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            {copy.view.goToOrigin}
          </button>
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
        <p className="max-w-[14rem] text-right text-[10px] leading-snug text-zinc-400">
          {favorite ? copy.view.favoriteHint : copy.view.defaultHint}
        </p>
      </div>
    </div>
  );
}
