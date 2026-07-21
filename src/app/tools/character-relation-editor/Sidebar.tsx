"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import AvatarBubble from "./AvatarBubble";
import RelationLinkGlyph from "./RelationLinkGlyph";
import {
  IconLink,
  IconPencil,
  IconTrash,
  SidebarIconButton,
} from "./SidebarIcons";
import type { Character, Relation } from "./types";

type SidebarTab = "characters" | "relations";

/** 左サイドバー：キャラ／関係をタブで切り替え */
export default function Sidebar({
  characters,
  relations,
  selectedCharacterId,
  selectedRelationId,
  linkFromId,
  onSelectCharacter,
  onSelectRelation,
  onAddCharacter,
  onEditCharacter,
  onDeleteCharacter,
  onDeleteRelation,
  onStartLink,
  onCancelLink,
}: {
  characters: Character[];
  relations: Relation[];
  selectedCharacterId: string | null;
  selectedRelationId: string | null;
  linkFromId: string | null;
  onSelectCharacter: (id: string | null) => void;
  onSelectRelation: (id: string | null) => void;
  onAddCharacter: () => void;
  onEditCharacter: (id: string) => void;
  onDeleteCharacter: (id: string) => void;
  onDeleteRelation: (id: string) => void;
  onStartLink: (fromId: string) => void;
  onCancelLink: () => void;
}) {
  const { t } = useI18n();
  const copy = t.apps.characterRelation;
  const [tab, setTab] = useState<SidebarTab>("characters");

  // キャンバス側の選択に合わせてタブを連動
  useEffect(() => {
    if (selectedRelationId) setTab("relations");
  }, [selectedRelationId]);

  useEffect(() => {
    if (selectedCharacterId) setTab("characters");
  }, [selectedCharacterId]);

  const nameOf = (id: string) =>
    characters.find((c) => c.id === id)?.name ?? "—";

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-zinc-200/80 bg-white shadow-sm">
      <div
        role="tablist"
        aria-label={copy.sidebar.tabsLabel}
        className="flex shrink-0 gap-1 border-b border-zinc-100 bg-zinc-50/80 p-1.5"
      >
        {(
          [
            ["characters", copy.sidebar.characters, characters.length],
            ["relations", copy.sidebar.relations, relations.length],
          ] as const
        ).map(([id, label, count]) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                active
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <span className="truncate">{label}</span>
              <span
                className={`tabular-nums ${active ? "text-zinc-400" : "text-zinc-300"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "characters" ? (
        <>
          <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-2.5 py-1.5">
            <p className="text-[10px] text-zinc-400">{copy.sidebar.charactersHint}</p>
            <button
              type="button"
              onClick={onAddCharacter}
              className="rounded-md bg-zinc-950 px-2 py-0.5 text-[10px] font-medium text-zinc-50 transition-colors hover:bg-zinc-800"
            >
              {copy.sidebar.addCharacter}
            </button>
          </div>

          {linkFromId ? (
            <p className="border-b border-amber-100 bg-amber-50/80 px-2.5 py-1.5 text-[10px] leading-relaxed text-amber-800">
              {copy.sidebar.linkHint}
            </p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
            {characters.length === 0 ? (
              <p className="px-2.5 py-6 text-center text-[11px] text-zinc-400">
                {copy.sidebar.emptyCharacters}
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {characters.map((ch) => {
                  const active = ch.id === selectedCharacterId;
                  const linking = linkFromId === ch.id;
                  return (
                    <li key={ch.id}>
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 transition-colors ${
                          active ? "bg-zinc-100" : "hover:bg-zinc-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectCharacter(ch.id)}
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                        >
                          <AvatarBubble
                            src={ch.avatarDataUrl}
                            preset={ch.avatarPreset}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium leading-tight text-zinc-900">
                              {ch.name}
                            </p>
                            {ch.details.note ? (
                              <p className="truncate text-[10px] leading-tight text-zinc-400">
                                {ch.details.note}
                              </p>
                            ) : null}
                          </div>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <SidebarIconButton
                            label={
                              linking ? copy.sidebar.linking : copy.sidebar.link
                            }
                            active={linking}
                            onClick={() =>
                              linking ? onCancelLink() : onStartLink(ch.id)
                            }
                          >
                            <IconLink />
                          </SidebarIconButton>
                          <SidebarIconButton
                            label={copy.edit}
                            onClick={() => onEditCharacter(ch.id)}
                          >
                            <IconPencil />
                          </SidebarIconButton>
                          <SidebarIconButton
                            label={copy.delete}
                            danger
                            onClick={() => onDeleteCharacter(ch.id)}
                          >
                            <IconTrash />
                          </SidebarIconButton>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex shrink-0 items-center border-b border-zinc-100 px-3 py-2">
            <p className="text-[11px] text-zinc-400">
              {copy.sidebar.relationsHint}
            </p>
          </div>

          {linkFromId ? (
            <p className="border-b border-amber-100 bg-amber-50/80 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
              {copy.sidebar.linkHint}
            </p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto" role="tabpanel">
            {relations.length === 0 ? (
              <p className="px-3 py-8 text-center text-[11px] text-zinc-400">
                {copy.sidebar.emptyRelations}
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {relations.map((rel) => {
                  const active = rel.id === selectedRelationId;
                  return (
                    <li key={rel.id}>
                      <div
                        className={`flex items-center gap-1.5 px-2 py-1 ${
                          active ? "bg-zinc-100" : "hover:bg-zinc-50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelectRelation(rel.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="flex min-w-0 items-center text-[11px] font-medium leading-tight text-zinc-800">
                            <span className="min-w-0 truncate">
                              {nameOf(rel.fromId)}
                            </span>
                            <RelationLinkGlyph
                              strokeStyle={rel.strokeStyle}
                              arrowHead={rel.arrowHead}
                              active={active}
                            />
                            <span className="min-w-0 truncate">
                              {nameOf(rel.toId)}
                            </span>
                          </p>
                          <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                            {rel.label || copy.sidebar.noLabel}
                          </p>
                        </button>
                        <SidebarIconButton
                          label={copy.delete}
                          danger
                          onClick={() => onDeleteRelation(rel.id)}
                        >
                          <IconTrash />
                        </SidebarIconButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
