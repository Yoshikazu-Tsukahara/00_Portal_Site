"use client";

import { useEffect, useMemo, useState } from "react";

import AppShell from "@/components/AppShell";
import ForceLandscape from "@/components/ForceLandscape";
import { useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import { useCompactLayout } from "@/lib/useCompactLayout";
import EditMode from "./EditMode";
import HomeMode from "./HomeMode";
import ViewMode from "./ViewMode";
import { downloadMyBook } from "./storage";
import {
  APP_ID,
  STORAGE_KEY,
  emptyBook,
  emptyStudio,
  hasBookContent,
  hasReadableContent,
  normalizeBook,
  normalizeStudio,
  type BookData,
  type StudioData,
} from "./types";

/** 画面のモード */
type ModeState = "home" | "edit" | "view";

/** 読んでいる本が「自分の下書き」か「読み込んだファイル」か */
type ViewSource = "draft" | "imported";

export default function BookVisualizerPage() {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const { compact } = useCompactLayout();
  /** スマホ／縦型：編集不可。ファイル読み込み→閲覧のみ */
  const readOnly = compact;

  const [data, setData, { hydrated }] = useLocalStorageState<StudioData>(
    STORAGE_KEY,
    emptyStudio(),
  );
  const [mode, setMode] = useState<ModeState>("home");
  const [viewSource, setViewSource] = useState<ViewSource>("draft");
  // 読み込んだ .mybook は、制作中の下書きを壊さないよう別に持つ
  const [importedBook, setImportedBook] = useState<BookData | null>(null);
  const [notice, setNotice] = useState("");

  // LocalStorage の古い下書き（余白未設定など）を毎回正規化してから使う
  const studio = useMemo(() => normalizeStudio(data), [data]);

  // 読み込み専用に切り替わったら編集画面に留まらない
  useEffect(() => {
    if (readOnly && mode === "edit") {
      setMode("home");
    }
  }, [readOnly, mode]);

  function updateBook(patch: Partial<BookData>) {
    if (readOnly) return;
    setData((prev) => {
      const current = normalizeStudio(prev);
      return {
        ...current,
        book: normalizeBook({ ...current.book, ...patch }),
      };
    });
    setNotice("");
  }

  function openReader(source: ViewSource) {
    setViewSource(source);
    setMode("view");
  }

  function handleReadDraft() {
    if (!hasReadableContent(studio.book)) {
      setNotice(copy.edit.readEmpty);
      return;
    }
    openReader("draft");
  }

  function handleExport() {
    if (!hasReadableContent(studio.book)) {
      setNotice(copy.edit.exportEmpty);
      return;
    }
    downloadMyBook(studio.book);
    setNotice("");
  }

  /** 読み込んだ本を自分の下書きとして取り込む（PC 編集時のみ） */
  function handleAdopt() {
    if (readOnly || !importedBook) return;
    if (!window.confirm(copy.view.endEditConfirm)) return;
    setData((prev) => ({
      ...normalizeStudio(prev),
      book: normalizeBook(importedBook),
    }));
    setImportedBook(null);
    setMode("edit");
  }

  const viewingBook =
    viewSource === "imported"
      ? importedBook
        ? normalizeBook(importedBook)
        : null
      : studio.book;

  // 下書きを読んでいる間も背後は制作画面のままにし、閉じたらすぐ続きから編集できるようにする
  const showEditor =
    !readOnly &&
    (mode === "edit" || (mode === "view" && viewSource === "draft"));

  const actions =
    showEditor ? (
      <div className="flex min-w-0 flex-nowrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setMode("home")}
          className="btn-secondary shrink-0 !px-2 !py-1.5 text-[11px] sm:!px-3 sm:text-xs"
        >
          <span className="sm:hidden">{copy.edit.backHomeShort}</span>
          <span className="hidden sm:inline">{copy.edit.backHome}</span>
        </button>
        <button
          type="button"
          onClick={handleReadDraft}
          className="btn-secondary shrink-0 !px-2 !py-1.5 text-[11px] sm:!px-3 sm:text-xs"
        >
          <span className="sm:hidden">{copy.edit.readShort}</span>
          <span className="hidden sm:inline">{copy.edit.readButton}</span>
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="btn-primary shrink-0 !px-2 !py-1.5 text-[11px] sm:!px-3 sm:text-xs"
        >
          <span className="sm:hidden">{copy.edit.exportShort}</span>
          <span className="hidden sm:inline">{copy.edit.exportButton}</span>
        </button>
      </div>
    ) : null;

  if (!hydrated) {
    return (
      <ForceLandscape>
        <AppShell
          title={copy.shell.title}
          description={copy.shell.description}
          fillViewport
        >
          <p className="text-sm text-zinc-400">{copy.loading}</p>
        </AppShell>
      </ForceLandscape>
    );
  }

  return (
    <ForceLandscape>
      <AppShell
        title={copy.shell.title}
        description={copy.shell.description}
        fillViewport
        actions={actions}
        dataManager={
          readOnly
            ? undefined
            : {
                appId: APP_ID,
                fileNamePrefix: "book-visualizer",
                getData: () => studio,
                onImport: (raw) => {
                  setData(normalizeStudio(raw));
                  setMode("edit");
                  setNotice("");
                },
              }
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {notice ? (
            <p
              role="alert"
              className="shrink-0 break-words rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800"
            >
              {notice}
            </p>
          ) : null}

          {showEditor ? (
            <EditMode book={studio.book} onChangeBook={updateBook} />
          ) : (
            <HomeMode
              readOnly={readOnly}
              hasDraft={hasBookContent(studio.book)}
              draftTitle={studio.book.title}
              onCreate={() => {
                if (readOnly) return;
                // 下書きがあるときだけ、破棄してよいか確かめる
                if (
                  hasBookContent(studio.book) &&
                  !window.confirm(copy.home.createConfirm)
                ) {
                  return;
                }
                setData((prev) => ({
                  ...normalizeStudio(prev),
                  book: emptyBook(),
                }));
                setNotice("");
                setMode("edit");
              }}
              onResume={() => {
                if (readOnly) return;
                setNotice("");
                setMode("edit");
              }}
              onOpenBook={(book) => {
                setImportedBook(normalizeBook(book));
                openReader("imported");
              }}
            />
          )}
        </div>
      </AppShell>

      {mode === "view" && viewingBook ? (
        <ViewMode
          book={viewingBook}
          onClose={() =>
            setMode(
              readOnly || viewSource === "imported" ? "home" : "edit",
            )
          }
          onGoHome={() => setMode("home")}
          onAdopt={
            viewSource === "imported" && !readOnly ? handleAdopt : undefined
          }
        />
      ) : null}
    </ForceLandscape>
  );
}
