"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import LauncherAppLaunch from "@/components/LauncherAppLaunch";
import LauncherFolderIcon from "@/components/LauncherFolderIcon";
import LauncherFolderSheet from "@/components/LauncherFolderSheet";
import LauncherIcon from "@/components/LauncherIcon";
import { findToolById, type Tool } from "@/data/tools";
import { fmt, useI18n } from "@/i18n";
import type { HomeFolderItem, HomeItem } from "@/lib/homePins";
import type { LaunchOrigin } from "@/lib/launcher/motion";

type AppLaunchState = {
  href: string;
  icon: ReactNode;
  title: string;
  origin: LaunchOrigin | null;
};

type Props = {
  items: HomeItem[];
  onReorder: (activeId: string, overId: string) => void;
  onCombine: (activeId: string, overId: string) => boolean;
  onRemove: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
  onGroupWithNext: (id: string) => string | null;
  onDissolveFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, name: string) => void;
  onEjectFromFolder: (folderId: string, appId: string) => void;
};

/** アプリ同士：ゾーンに居続けたらフォルダ作成 */
const COMBINE_HOVER_MS = 220;
/** 既存フォルダへ：すぐ追加できるように短くする */
const COMBINE_FOLDER_HOVER_MS = 80;
/**
 * 相手アイコンの何割を「重ねゾーン」とみなすか。
 * 1 超は外側パディング（当てやすくする）。端の細い帯だけ並べ替え。
 */
const COMBINE_ZONE_RATIO = 1.05;
/** すでに重ね狙い中のとき、外れ判定をさらにゆるくする */
const COMBINE_ZONE_RATIO_LOOSE = 1.25;

type ClientRectLike = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * ドラッグ中アイコンが相手の重ねゾーンに入っているか。
 * アイテム全体（ラベル含む）だと中心が下にずれるため、上寄りの点で判定する。
 */
function isInCombineZone(
  activeRect: ClientRectLike | null | undefined,
  overRect: ClientRectLike | null | undefined,
  loose = false,
): boolean {
  if (!activeRect || !overRect) return false;
  if (overRect.width <= 0 || overRect.height <= 0) return false;

  const ratio = loose ? COMBINE_ZONE_RATIO_LOOSE : COMBINE_ZONE_RATIO;
  // ラベルを除いたアイコン付近を「つかんでいる点」とみなす
  const cx = activeRect.left + activeRect.width / 2;
  const cy = activeRect.top + activeRect.height * 0.32;

  const halfW = (overRect.width * ratio) / 2;
  const halfH = (overRect.height * ratio) / 2;
  const midX = overRect.left + overRect.width / 2;
  const midY = overRect.top + overRect.height * 0.38;

  return (
    Math.abs(cx - midX) <= halfW && Math.abs(cy - midY) <= halfH
  );
}

function previewToolsForFolder(folder: HomeFolderItem): Tool[] {
  return folder.appIds
    .map((id) => findToolById(id))
    .filter((tool): tool is Tool => Boolean(tool));
}

function SortableHomeItem({
  item,
  index,
  editing,
  combineTarget,
  freezeLayout,
  onEnterEdit,
  onExitEdit,
  onRemove,
  onMove,
  onGroupWithNext,
  onOpenFolder,
  onDissolveFolder,
  onLaunchApp,
  total,
}: {
  item: HomeItem;
  index: number;
  editing: boolean;
  combineTarget: boolean;
  /** 重ね操作中は他アイコンをずらさない（ターゲットが逃げないように） */
  freezeLayout: boolean;
  onEnterEdit: () => void;
  onExitEdit: () => void;
  onRemove: (id: string) => void;
  onMove: (id: string, toIndex: number) => void;
  onGroupWithNext: (id: string) => void;
  onOpenFolder: (folderId: string, origin: LaunchOrigin | null) => void;
  onDissolveFolder: (folderId: string) => void;
  onLaunchApp: (payload: AppLaunchState) => void;
  total: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: !editing,
    animateLayoutChanges: () => false,
  });

  // 重ね狙いのときはソート用のずれを止める（ドラッグ中本体はそのまま）
  const resolvedTransform =
    freezeLayout && !isDragging ? null : transform;

  const style = {
    transform: CSS.Transform.toString(resolvedTransform),
    transition: freezeLayout && !isDragging ? undefined : transition,
    zIndex: isDragging ? 20 : combineTarget ? 15 : undefined,
  };

  const shared = {
    editing,
    combineTarget,
    jiggleDelayMs: (index % 5) * 40,
    isDragging,
    style,
    setNodeRef,
    attributes: editing ? attributes : undefined,
    listeners: editing ? listeners : undefined,
    onEnterEdit,
    onExitEdit,
    canMoveLeft: index > 0,
    canMoveRight: index < total - 1,
    onMoveLeft: () => onMove(item.id, index - 1),
    onMoveRight: () => onMove(item.id, index + 1),
  };

  if (item.type === "folder") {
    return (
      <LauncherFolderIcon
        {...shared}
        folder={item}
        previewTools={previewToolsForFolder(item)}
        onOpen={(origin) => onOpenFolder(item.id, origin)}
        onDissolve={() => onDissolveFolder(item.id)}
      />
    );
  }

  const tool = findToolById(item.id);
  if (!tool) return null;

  return (
    <LauncherIcon
      {...shared}
      tool={tool}
      onLaunchApp={onLaunchApp}
      onRemove={() => onRemove(tool.id)}
      onGroupWithNext={
        index < total - 1 ? () => onGroupWithNext(item.id) : undefined
      }
    />
  );
}

/**
 * ホームのアプリアイコングリッド。
 * 長押しで並べ替え・フォルダ化・削除（余白タップまたは Esc で終了）。
 */
export default function LauncherGrid({
  items,
  onReorder,
  onCombine,
  onRemove,
  onMove,
  onGroupWithNext,
  onDissolveFolder,
  onRenameFolder,
  onEjectFromFolder,
}: Props) {
  const { t } = useI18n();
  const dndId = useId();
  const [editing, setEditing] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [combineTargetId, setCombineTargetId] = useState<string | null>(null);
  /** 中央ゾーン滞在中（タイマー待ち含む）→ レイアウト固定用 */
  const [combineAimId, setCombineAimId] = useState<string | null>(null);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [openFolderOrigin, setOpenFolderOrigin] =
    useState<LaunchOrigin | null>(null);
  /** フォルダ開いているあいだホームを少し沈める（閉じ始めですぐ戻す） */
  const [folderDimmed, setFolderDimmed] = useState(false);
  const [appLaunch, setAppLaunch] = useState<AppLaunchState | null>(null);
  const combineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverOverId = useRef<string | null>(null);
  const activeDragId = useRef<string | null>(null);
  const combineReadyRef = useRef<string | null>(null);
  const combineAimIdRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!editing) return;
    setAnnounce(t.home.editingAnnounce);
  }, [editing, t.home.editingAnnounce]);

  useEffect(() => {
    if (!editing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !openFolderId) {
        e.preventDefault();
        setEditing(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, openFolderId]);

  useEffect(() => {
    if (editing) return;
    // 編集終了時に合成ハイライトをクリア
    clearCombineTimer();
    hoverOverId.current = null;
    combineReadyRef.current = null;
    combineAimIdRef.current = null;
    setCombineTargetId(null);
    setCombineAimId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  useEffect(() => {
    return () => {
      if (combineTimer.current) clearTimeout(combineTimer.current);
    };
  }, []);

  // フォルダが消えたらシートを閉じる
  useEffect(() => {
    if (!openFolderId) return;
    const still = items.some(
      (item) => item.type === "folder" && item.id === openFolderId,
    );
    if (!still) setOpenFolderId(null);
  }, [items, openFolderId]);

  function clearCombineTimer() {
    if (combineTimer.current) {
      clearTimeout(combineTimer.current);
      combineTimer.current = null;
    }
  }

  function resetCombine() {
    clearCombineTimer();
    hoverOverId.current = null;
    combineReadyRef.current = null;
    combineAimIdRef.current = null;
    setCombineTargetId(null);
    setCombineAimId(null);
  }

  function setAim(overId: string) {
    combineAimIdRef.current = overId;
    setCombineAimId(overId);
  }

  function enterEdit() {
    setEditing(true);
  }

  function canCombine(activeId: string, overId: string): boolean {
    if (activeId === overId) return false;
    const active = items.find((item) => item.id === activeId);
    const over = items.find((item) => item.id === overId);
    if (!active || !over) return false;
    // アプリをアプリ／フォルダへ重ねるときだけ合成
    return active.type === "app";
  }

  function applyCombine(activeId: string, overId: string): boolean {
    const overItem = items.find((item) => item.id === overId);
    const ok = onCombine(activeId, overId);
    if (!ok) return false;
    if (overItem?.type === "folder") {
      const title = t.tools[activeId]?.title ?? activeId;
      setAnnounce(fmt(t.home.folderAddedAnnounce, { title }));
    } else {
      setAnnounce(t.home.folderCreatedAnnounce);
    }
    return true;
  }

  function handleDragStart(event: { active: { id: string | number } }) {
    activeDragId.current = String(event.active.id);
    resetCombine();
  }

  function handleDragOver(event: DragOverEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const activeRect =
      event.active.rect.current.translated ?? event.active.rect.current.initial;
    const overRect = event.over?.rect;
    const aimingSame =
      Boolean(overId) && hoverOverId.current === overId;
    const inZone =
      Boolean(overId) &&
      isInCombineZone(activeRect, overRect, aimingSame);

    // 端にいる／合成不可 → 並べ替えモード（重ね待機を解除）
    if (!overId || !canCombine(activeId, overId) || !inZone) {
      if (hoverOverId.current !== null || combineReadyRef.current !== null) {
        resetCombine();
      }
      return;
    }

    // 重ねゾーン：レイアウトを固定してターゲットが逃げないようにする
    setAim(overId);

    if (hoverOverId.current === overId) return;
    hoverOverId.current = overId;
    clearCombineTimer();
    combineReadyRef.current = null;
    setCombineTargetId(null);

    const overItem = items.find((item) => item.id === overId);
    const delay =
      overItem?.type === "folder" ? COMBINE_FOLDER_HOVER_MS : COMBINE_HOVER_MS;

    combineTimer.current = setTimeout(() => {
      if (hoverOverId.current === overId && activeDragId.current === activeId) {
        combineReadyRef.current = overId;
        setCombineTargetId(overId);
        try {
          navigator.vibrate?.(10);
        } catch {
          /* 未対応端末は無視 */
        }
      }
    }, delay);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = String(active.id);
    const readyCombine = combineReadyRef.current;
    const aimId = combineAimIdRef.current;
    const activeRect =
      active.rect.current.translated ?? active.rect.current.initial;
    resetCombine();
    activeDragId.current = null;

    // 1) ハイライト済み → over が外れてもフォルダ作成／追加を優先
    if (readyCombine && canCombine(activeId, readyCombine)) {
      if (applyCombine(activeId, readyCombine)) return;
    }

    // 2) 既存フォルダ上で離した → 短いホバーでも追加（並べ替えより優先）
    const overId = over ? String(over.id) : null;
    if (over && overId && overId !== activeId && canCombine(activeId, overId)) {
      const overItem = items.find((item) => item.id === overId);
      if (
        overItem?.type === "folder" &&
        isInCombineZone(activeRect, over.rect, true)
      ) {
        if (applyCombine(activeId, overId)) return;
      }
    }

    // 3) フォルダを狙っていたが over が隣にずれた場合も追加を試す
    if (
      aimId &&
      aimId !== activeId &&
      canCombine(activeId, aimId) &&
      items.find((item) => item.id === aimId)?.type === "folder"
    ) {
      if (applyCombine(activeId, aimId)) return;
    }

    if (!over || active.id === over.id || !overId) return;

    const to = items.findIndex((item) => item.id === overId);
    if (to < 0) return;
    onReorder(activeId, overId);
    const activeItem = items.find((item) => item.id === activeId);
    const title =
      activeItem?.type === "folder"
        ? activeItem.name.trim() || t.home.folderDefaultName
        : (t.tools[activeId]?.title ?? activeId);
    setAnnounce(
      fmt(t.home.reorderedAnnounce, {
        title,
        n: String(to + 1),
      }),
    );
  }

  function handleDragCancel() {
    resetCombine();
    activeDragId.current = null;
  }

  function handleRemove(id: string) {
    const title = t.tools[id]?.title ?? id;
    onRemove(id);
    setAnnounce(fmt(t.home.removedAnnounce, { title }));
  }

  function handleMove(id: string, toIndex: number) {
    const item = items.find((x) => x.id === id);
    const title =
      item?.type === "folder"
        ? item.name.trim() || t.home.folderDefaultName
        : (t.tools[id]?.title ?? id);
    onMove(id, toIndex);
    setAnnounce(
      fmt(t.home.reorderedAnnounce, {
        title,
        n: String(toIndex + 1),
      }),
    );
  }

  function handleGroupWithNext(id: string) {
    const folderId = onGroupWithNext(id);
    if (folderId) setAnnounce(t.home.folderCreatedAnnounce);
  }

  function handleDissolve(folderId: string) {
    onDissolveFolder(folderId);
    setAnnounce(t.home.folderDissolvedAnnounce);
    if (openFolderId === folderId) setOpenFolderId(null);
  }

  const openFolder =
    openFolderId != null
      ? items.find(
          (item): item is HomeFolderItem =>
            item.type === "folder" && item.id === openFolderId,
        )
      : undefined;

  const openFolderTools = openFolder
    ? previewToolsForFolder(openFolder)
    : [];

  const ids = items.map((item) => item.id);

  function exitEdit() {
    if (!editing) return;
    setEditing(false);
    resetCombine();
  }

  function handleOpenFolder(folderId: string, origin: LaunchOrigin | null) {
    setOpenFolderOrigin(origin);
    setOpenFolderId(folderId);
    setFolderDimmed(true);
  }

  function handleCloseFolder() {
    setOpenFolderId(null);
    setOpenFolderOrigin(null);
    setFolderDimmed(false);
  }

  return (
    <div
      className={`launcher-home flex min-h-0 flex-1 flex-col${
        folderDimmed ? " launcher-home--folder-open" : ""
      }${appLaunch ? " launcher-home--launching" : ""}`}
      onClick={(e) => {
        // アイコン以外（余白）をタップしたら編集終了
        if (editing && e.target === e.currentTarget) exitEdit();
      }}
    >
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announce}
      </div>

      {/* ぼかしは背後グリッドだけ（シートは外に出してモザイク化を防ぐ） */}
      <div className="launcher-home__stage">
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={ids} strategy={rectSortingStrategy}>
            <ul
              className="launcher-grid"
              aria-label={t.home.gridLabel}
              onClick={(e) => {
                if (editing && e.target === e.currentTarget) exitEdit();
              }}
            >
              {items.map((item, index) => (
                <SortableHomeItem
                  key={item.id}
                  item={item}
                  index={index}
                  editing={editing}
                  combineTarget={combineTargetId === item.id}
                  freezeLayout={combineAimId !== null}
                  total={items.length}
                  onEnterEdit={enterEdit}
                  onExitEdit={exitEdit}
                  onRemove={handleRemove}
                  onMove={handleMove}
                  onGroupWithNext={handleGroupWithNext}
                  onOpenFolder={handleOpenFolder}
                  onDissolveFolder={handleDissolve}
                  onLaunchApp={setAppLaunch}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {openFolder ? (
        <LauncherFolderSheet
          folder={openFolder}
          tools={openFolderTools}
          editing={editing}
          origin={openFolderOrigin}
          onClosing={() => setFolderDimmed(false)}
          onClose={handleCloseFolder}
          onRename={(name) => onRenameFolder(openFolder.id, name)}
          onEject={(appId) => {
            const title = t.tools[appId]?.title ?? appId;
            onEjectFromFolder(openFolder.id, appId);
            setAnnounce(fmt(t.home.ejectedAnnounce, { title }));
          }}
          onRemoveFromHome={(appId) => {
            handleRemove(appId);
          }}
          onLaunchApp={setAppLaunch}
        />
      ) : null}

      {appLaunch ? (
        <LauncherAppLaunch
          href={appLaunch.href}
          icon={appLaunch.icon}
          title={appLaunch.title}
          origin={appLaunch.origin}
        />
      ) : null}
    </div>
  );
}
