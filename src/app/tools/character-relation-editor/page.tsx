"use client";

import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import { fmt, useI18n } from "@/i18n";
import { loadLocalJson, useLocalStorageState } from "@/lib/localData";
import CharacterModal from "./CharacterModal";
import DetailEditor from "./DetailEditor";
import RelationCanvas from "./RelationCanvas";
import Sidebar from "./Sidebar";
import {
  APP_ID,
  createId,
  emptyDetails,
  emptyDiagram,
  normalizeDiagram,
  STORAGE_KEY,
  type Character,
  type DiagramData,
  type Relation,
} from "./types";

/** 旧バージョンの保存キー（v2 へ一度だけ移行） */
const LEGACY_STORAGE_KEY = "character-relation-editor:v1";

type MainTab = "canvas" | "detail";

export default function CharacterRelationEditorPage() {
  const { t } = useI18n();
  const copy = t.apps.characterRelation;
  const [data, setData, { hydrated }] = useLocalStorageState<DiagramData>(
    STORAGE_KEY,
    emptyDiagram(),
  );
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null,
  );
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(
    null,
  );
  const [linkFromId, setLinkFromId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mainTab, setMainTab] = useState<MainTab>("canvas");

  const selectedCharacter = useMemo(
    () => data.characters.find((c) => c.id === selectedCharacterId) ?? null,
    [data.characters, selectedCharacterId],
  );

  // 読み込み直後に正規化し、旧キー（v1）があれば移行
  useEffect(() => {
    if (!hydrated) return;
    const normalized = normalizeDiagram(data);
    const needsNormalize =
      JSON.stringify(normalized) !== JSON.stringify(data);
    if (needsNormalize) {
      setData(normalized);
      return;
    }
    if (data.characters.length > 0 || data.relations.length > 0) return;
    const legacy = loadLocalJson<unknown>(LEGACY_STORAGE_KEY, null);
    if (!legacy) return;
    const migrated = normalizeDiagram(legacy);
    if (migrated.characters.length === 0 && migrated.relations.length === 0) {
      return;
    }
    setData(migrated);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回 hydrate 時のみ
  }, [hydrated]);

  function update(partial: Partial<DiagramData>) {
    setData({
      characters: partial.characters ?? data.characters,
      relations: partial.relations ?? data.relations,
    });
  }

  function openCreate() {
    setModalOpen(true);
  }

  /** サイドバー編集／カードダブルクリック → 詳細エディタへ */
  function openDetail(id: string) {
    setSelectedCharacterId(id);
    setSelectedRelationId(null);
    setMainTab("detail");
  }

  function handleSaveCharacter(draft: {
    name: string;
    avatarDataUrl: string;
    avatarPreset: Character["avatarPreset"];
    accent: Character["accent"];
    note: string;
  }) {
    const n = data.characters.length;
    const next: Character = {
      id: createId("ch"),
      name: draft.name,
      avatarDataUrl: draft.avatarDataUrl,
      avatarPreset: draft.avatarDataUrl ? "" : draft.avatarPreset,
      accent: draft.accent,
      x: 64 + (n % 4) * 200,
      y: 64 + Math.floor(n / 4) * 140,
      details: { ...emptyDetails(), note: draft.note },
      cardVisibleKeys: draft.note.trim() ? ["note"] : [],
    };
    update({ characters: [...data.characters, next] });
    setSelectedCharacterId(next.id);
    setSelectedRelationId(null);
    setMainTab("detail");
    setModalOpen(false);
  }

  function handleUpdateCharacter(next: Character) {
    update({
      characters: data.characters.map((c) => (c.id === next.id ? next : c)),
    });
  }

  function handleDeleteCharacter(id: string) {
    const name = data.characters.find((c) => c.id === id)?.name ?? "";
    if (!window.confirm(fmt(copy.confirmDeleteCharacter, { name }))) {
      return;
    }
    update({
      characters: data.characters.filter((c) => c.id !== id),
      relations: data.relations.filter(
        (r) => r.fromId !== id && r.toId !== id,
      ),
    });
    if (selectedCharacterId === id) setSelectedCharacterId(null);
    if (linkFromId === id) setLinkFromId(null);
  }

  function handleDeleteRelation(id: string) {
    update({ relations: data.relations.filter((r) => r.id !== id) });
    if (selectedRelationId === id) setSelectedRelationId(null);
  }

  function handleMoveCharacter(id: string, x: number, y: number) {
    update({
      characters: data.characters.map((c) =>
        c.id === id ? { ...c, x, y } : c,
      ),
    });
  }

  function handleCompleteLink(toId: string) {
    if (!linkFromId || linkFromId === toId) {
      setLinkFromId(null);
      return;
    }
    const exists = data.relations.some(
      (r) =>
        (r.fromId === linkFromId && r.toId === toId) ||
        (r.fromId === toId && r.toId === linkFromId),
    );
    if (!exists) {
      const next: Relation = {
        id: createId("rel"),
        fromId: linkFromId,
        toId,
        label: "",
        strokeStyle: "solid",
        arrowHead: "none",
      };
      update({ relations: [...data.relations, next] });
      setSelectedRelationId(next.id);
    }
    setLinkFromId(null);
  }

  function handleUpdateRelation(
    id: string,
    patch: Partial<Pick<Relation, "label" | "strokeStyle" | "arrowHead">>,
  ) {
    update({
      relations: data.relations.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      ),
    });
  }

  if (!hydrated) {
    return (
      <AppShell
        title={copy.shell.title}
        description={copy.shell.description}
        fillViewport
      >
        <p className="text-sm text-zinc-400">{copy.loading}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport
      dataManager={{
        appId: APP_ID,
        fileNamePrefix: "character-relation-editor",
        getData: () => data,
        onImport: (raw) => {
          const next = normalizeDiagram(raw);
          setData(next);
          setSelectedCharacterId(null);
          setSelectedRelationId(null);
          setLinkFromId(null);
          setMainTab("canvas");
        },
      }}
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary !px-3 !py-1.5 text-xs sm:text-sm"
        >
          {copy.sidebar.addCharacter}
        </button>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <p className="shrink-0 rounded-md border border-zinc-200/80 bg-zinc-100/70 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-600">
          {copy.privacyBanner}
        </p>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)]">
          <div className="min-h-0 max-h-[min(70vh,40rem)] lg:max-h-none">
            <Sidebar
              characters={data.characters}
              relations={data.relations}
              selectedCharacterId={selectedCharacterId}
              selectedRelationId={selectedRelationId}
              linkFromId={linkFromId}
              onSelectCharacter={(id) => {
                setSelectedCharacterId(id);
                setSelectedRelationId(null);
              }}
              onSelectRelation={(id) => {
                setSelectedRelationId(id);
                setSelectedCharacterId(null);
              }}
              onAddCharacter={openCreate}
              onEditCharacter={openDetail}
              onDeleteCharacter={handleDeleteCharacter}
              onDeleteRelation={handleDeleteRelation}
              onStartLink={(fromId) => {
                setLinkFromId(fromId);
                setSelectedCharacterId(fromId);
                setSelectedRelationId(null);
                setMainTab("canvas");
              }}
              onCancelLink={() => setLinkFromId(null)}
            />
          </div>

          <div className="flex min-h-[28rem] min-w-0 flex-1 flex-col gap-2">
            {/* 右側メイン：キャンバス／詳細のタブ */}
            <div
              role="tablist"
              aria-label={copy.tabs.label}
              className="flex shrink-0 gap-1 rounded-md border border-zinc-200/80 bg-zinc-100/80 p-1"
            >
              {(
                [
                  ["canvas", copy.tabs.canvas],
                  ["detail", copy.tabs.detail],
                ] as const
              ).map(([id, label]) => {
                const active = mainTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMainTab(id)}
                    className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-0 flex-1" role="tabpanel">
              {mainTab === "canvas" ? (
                <RelationCanvas
                  characters={data.characters}
                  relations={data.relations}
                  selectedCharacterId={selectedCharacterId}
                  selectedRelationId={selectedRelationId}
                  linkFromId={linkFromId}
                  onSelectCharacter={setSelectedCharacterId}
                  onSelectRelation={setSelectedRelationId}
                  onMoveCharacter={handleMoveCharacter}
                  onCompleteLink={handleCompleteLink}
                  onUpdateRelation={handleUpdateRelation}
                  onOpenDetail={openDetail}
                />
              ) : (
                <DetailEditor
                  character={selectedCharacter}
                  onChange={handleUpdateCharacter}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CharacterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCharacter}
      />
    </AppShell>
  );
}
