"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { Tool } from "@/data/tools";
import { fmt, useI18n } from "@/i18n";
import type { HomeFolderItem } from "@/lib/homePins";
import {
  type LaunchOrigin,
  originToCssVars,
  prefersReducedMotion,
  readLaunchOrigin,
  shouldSkipLaunchAnimation,
} from "@/lib/launcher/motion";

type Props = {
  folder: HomeFolderItem;
  tools: Tool[];
  editing: boolean;
  /** 開いたフォルダアイコンの位置（拡大の起点） */
  origin: LaunchOrigin | null;
  /** 閉じアニメ開始（背後のスケール戻し用） */
  onClosing?: () => void;
  onClose: () => void;
  onRename: (name: string) => void;
  onEject: (appId: string) => void;
  onRemoveFromHome: (appId: string) => void;
  /** 中のアプリを開く（起動アニメ付き） */
  onLaunchApp: (payload: {
    href: string;
    icon: ReactNode;
    title: string;
    origin: LaunchOrigin | null;
  }) => void;
};

const CLOSE_MS = 280;
const PANEL_W = 512;
const PANEL_H = 420;

/**
 * フォルダを開いたときのシート（名前変更・中身の取り出し／削除）。
 * アイコン位置から広がる／閉じるアニメ付き。
 */
export default function LauncherFolderSheet({
  folder,
  tools,
  editing,
  origin,
  onClosing,
  onClose,
  onRename,
  onEject,
  onRemoveFromHome,
  onLaunchApp,
}: Props) {
  const { t } = useI18n();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const displayName = folder.name.trim() || t.home.folderDefaultName;
  const [phase, setPhase] = useState<"enter" | "open" | "exit">("enter");
  const [cssVars, setCssVars] = useState<Record<string, string>>(() =>
    originToCssVars(origin, PANEL_W, PANEL_H),
  );
  const reduced = useRef(false);

  useLayoutEffect(() => {
    reduced.current = prefersReducedMotion();
    const panel = panelRef.current;
    if (panel) {
      const rect = panel.getBoundingClientRect();
      setCssVars(
        originToCssVars(
          origin,
          rect.width || PANEL_W,
          rect.height || PANEL_H,
        ),
      );
    } else {
      setCssVars(originToCssVars(origin, PANEL_W, PANEL_H));
    }

    if (reduced.current) {
      setPhase("open");
      return;
    }

    const raf = requestAnimationFrame(() => setPhase("open"));
    return () => cancelAnimationFrame(raf);
  }, [origin]);

  useEffect(() => {
    if (phase === "open") {
      closeRef.current?.focus();
    }
  }, [phase]);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  function requestClose() {
    if (phaseRef.current === "exit") return;
    if (reduced.current || prefersReducedMotion()) {
      onClosing?.();
      onClose();
      return;
    }
    onClosing?.();
    setPhase("exit");
  }

  useEffect(() => {
    if (phase !== "exit") return;
    const timer = window.setTimeout(() => onClose(), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, onClose]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        requestClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // requestClose は最新の phaseRef / コールバックを参照
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, onClosing]);

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

  function onAppClick(e: MouseEvent<HTMLAnchorElement>, tool: Tool) {
    if (shouldSkipLaunchAnimation(e)) return;
    e.preventDefault();
    const glyph =
      (e.currentTarget.querySelector(".launcher-icon__glyph") as Element | null) ??
      e.currentTarget;
    const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
    onLaunchApp({
      href: tool.href,
      icon: tool.icon,
      title: copy.title,
      origin: readLaunchOrigin(glyph),
    });
  }

  const phaseClass =
    phase === "enter"
      ? " launcher-folder-sheet--enter"
      : phase === "exit"
        ? " launcher-folder-sheet--exit"
        : " launcher-folder-sheet--open";

  return (
    <div
      className={`launcher-folder-sheet${phaseClass}`}
      role="presentation"
      onClick={requestClose}
    >
      <div
        ref={panelRef}
        className="launcher-folder-sheet__panel"
        style={cssVars as CSSProperties}
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
            onClick={requestClose}
          >
            {t.home.closeFolder}
          </button>
        </div>

        <p id={titleId} className="sr-only">
          {displayName}
        </p>

        <ul className="launcher-folder-sheet__grid" aria-label={displayName}>
          {tools.map((tool, index) => {
            const copy = t.tools[tool.id] ?? { title: tool.id, description: "" };
            const title = copy.title;
            return (
              <li
                key={tool.id}
                className="launcher-folder-sheet__item"
                style={{ ["--launcher-stagger" as string]: `${index * 28}ms` }}
              >
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
                    onClick={(e) => onAppClick(e, tool)}
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
