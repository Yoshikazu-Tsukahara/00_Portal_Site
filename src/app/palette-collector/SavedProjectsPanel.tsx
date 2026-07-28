"use client";

import { FolderOpen, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { fmt } from "@/i18n";
import type { PaletteCollectorDict } from "@/i18n/apps/paletteCollector";
import type { SavedProject } from "./types";

function formatSavedAt(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
}

export default function SavedProjectsPanel({
  projects,
  canSave,
  saving,
  locale,
  copy,
  onSave,
  onLoad,
  onDelete,
}: {
  projects: SavedProject[];
  canSave: boolean;
  saving: boolean;
  locale: string;
  copy: PaletteCollectorDict["projects"];
  onSave: (name: string) => void | Promise<void>;
  onLoad: (project: SavedProject) => void | Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [openList, setOpenList] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed || !canSave || saving) return;
    await onSave(trimmed);
    setName("");
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm sm:p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
          {copy.heading}
        </h2>
        <span className="text-[10px] font-medium tabular-nums text-gray-400">
          {fmt(copy.countLabel, { count: projects.length })}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
        {copy.description}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void handleSave();
            }
          }}
          maxLength={80}
          placeholder={copy.namePlaceholder}
          disabled={!canSave || saving}
          aria-label={copy.nameLabel}
          className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:bg-white disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={!canSave || saving || !name.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gray-900 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-default disabled:opacity-40"
        >
          <Save className="size-3.5" aria-hidden />
          {saving ? copy.saving : copy.saveButton}
        </button>
      </div>

      {!canSave ? (
        <p className="mt-2 text-[10px] text-gray-400">{copy.needImage}</p>
      ) : null}

      <div className="mt-3 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setOpenList((v) => !v)}
          aria-expanded={openList}
          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <span className="inline-flex items-center gap-1.5">
            <FolderOpen className="size-3.5 text-gray-500" aria-hidden />
            {copy.listToggle}
          </span>
          <span className="text-[10px] font-semibold text-gray-400">
            {openList ? "−" : "+"}
          </span>
        </button>

        {openList ? (
          projects.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-gray-200 py-5 text-center text-[11px] text-gray-400">
              {copy.empty}
            </p>
          ) : (
            <ul className="mt-2 max-h-52 space-y-1.5 overflow-y-auto pr-0.5">
              {projects.map((project) => (
                <li key={project.id}>
                  <div className="group flex items-center gap-2 rounded-xl border border-transparent px-1.5 py-1.5 transition-colors hover:border-gray-200 hover:bg-gray-50">
                    <button
                      type="button"
                      onClick={() => void onLoad(project)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      title={fmt(copy.loadAria, { name: project.name })}
                    >
                      {/* data URL のサムネイルなので next/image は使わない */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.imageDataUrl}
                        alt=""
                        className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-gray-800">
                          {project.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-gray-400">
                          {fmt(copy.metaLabel, {
                            count: project.colors.length,
                            date: formatSavedAt(project.updatedAt, locale),
                          })}
                        </span>
                        <span className="mt-1 flex gap-0.5">
                          {project.colors.slice(0, 6).map((c) => (
                            <span
                              key={c.id}
                              className="size-2.5 rounded-full ring-1 ring-black/10"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(copy.deleteConfirm)) {
                          onDelete(project.id);
                        }
                      }}
                      aria-label={fmt(copy.deleteAria, { name: project.name })}
                      className="shrink-0 rounded-lg p-1.5 text-gray-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500 group-focus-within:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </section>
  );
}
