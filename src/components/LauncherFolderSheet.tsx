"use client";

import { useEffect, useId, useRef } from "react";
import type { Tool } from "@/data/tools";
import { fmt, useI18n } from "@/i18n";
import type { HomeFolderItem } from "@/lib/homePins";

type Props = {
  folder: HomeFolderItem;
  tools: Tool[];
  editing: boolean;
  onClose: () => void;
  onRename: (name: string) => void;
  onEject: (appId: string) => void;
  onRemoveFromHome: (appId: string) => void;
};

/**
 * フォルダを開いたときのシート（名前変更・中身の取り出し／削除）。
 */
export default function LauncherFolderSheet({
  folder,
  tools,
  editing,
  onClose,
  onRename,
  onEject,
  onRemoveFromHome,
}: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const displayName = folder.name.trim() || t.home.folderDefaultName;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      className="launcher-folder-sheet"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="launcher-folder-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="launcher-folder-sheet__header">
          <label className="sr-only" htmlFor={`${titleId}-name`}>
            {t.home.renameFolderAria}
          </label>
          <input
            id={`${titleId}-name`}
            className="launcher-folder-sheet__name"
            value={folder.name}
            placeholder={t.home.renameFolderPlaceholder}
            aria-label={t.home.renameFolderAria}
            onChange={(e) => onRename(e.target.value)}
          />
          <button
            ref={closeRef}
            type="button"
            className="btn-secondary !px-3 !py-1.5 text-xs"
            onClick={onClose}
          >
            {t.home.closeFolder}
          </button>
        </div>

        <p id={titleId} className="sr-only">
          {displayName}
        </p>

        <ul className="launcher-folder-sheet__grid" aria-label={displayName}>
          {tools.map((tool) => {
            const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
            const title = copy.title;
            return (
              <li key={tool.id} className="launcher-folder-sheet__item">
                {editing ? (
                  <div className="launcher-icon launcher-icon--editing launcher-folder-sheet__app">
                    <span className="launcher-icon__glyph-wrap">
                      <button
                        type="button"
                        className="launcher-icon__remove"
                        aria-label={fmt(t.home.removeAria, { title })}
                        title={fmt(t.home.removeAria, { title })}
                        onClick={() => onRemoveFromHome(tool.id)}
                      >
                        <span aria-hidden>×</span>
                      </button>
                      <span className="launcher-icon__glyph" aria-hidden>
                        {tool.icon}
                      </span>
                    </span>
                    <span className="launcher-icon__label">{title}</span>
                    <button
                      type="button"
                      className="launcher-folder-sheet__eject"
                      aria-label={fmt(t.home.ejectFromFolderAria, { title })}
                      onClick={() => onEject(tool.id)}
                    >
                      {t.home.ejectFromFolder}
                    </button>
                  </div>
                ) : (
                  <a
                    href={tool.href}
                    className="launcher-icon group launcher-folder-sheet__app"
                    aria-label={fmt(t.home.openAria, { title })}
                  >
                    <span className="launcher-icon__glyph-wrap">
                      <span className="launcher-icon__glyph" aria-hidden>
                        {tool.icon}
                      </span>
                    </span>
                    <span className="launcher-icon__label">{title}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
