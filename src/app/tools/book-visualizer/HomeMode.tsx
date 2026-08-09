"use client";

import { useRef, useState, type DragEvent } from "react";

import { fmt, useI18n } from "@/i18n";
import { SAMPLE_IDS, type SampleId } from "./samples";
import { readMyBookFile } from "./storage";
import { MYBOOK_EXTENSION, type BookData } from "./types";

type HomeModeProps = {
  /** 制作中の下書きがあるか */
  hasDraft: boolean;
  draftTitle: string;
  onCreate: () => void;
  onResume: () => void;
  /** サンプルを読み込んで編集を開く */
  onLoadSample: (id: SampleId) => void;
  /** 読み込んだ本を閲覧モードで開く */
  onOpenBook: (book: BookData) => void;
};

const SAMPLE_ICONS: Record<SampleId, string> = {
  novel: "📕",
  western: "📘",
};

/**
 * 入口となるポータル画面。
 * 制作・サンプル・もらった本を読む、の導線をまとめる。
 */
export default function HomeMode({
  hasDraft,
  draftTitle,
  onCreate,
  onResume,
  onLoadSample,
  onOpenBook,
}: HomeModeProps) {
  const { t } = useI18n();
  const copy = t.apps.bookVisualizer;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    const book = await readMyBookFile(file);
    if (!book) {
      setError(copy.home.error);
      return;
    }
    onOpenBook(book);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    void handleFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="flex min-h-0 w-full max-w-full flex-col gap-3 overflow-y-auto">
      <div className="grid min-w-0 auto-rows-min gap-3 md:grid-cols-2 md:gap-4">
        {/* 左：制作 */}
        <section className="bv-paper flex flex-col justify-between gap-6 rounded-2xl border border-[#e6dfd2] p-5 shadow-sm sm:p-8">
          <div className="space-y-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#a3937c]">
              Create
            </span>
            <h2 className="bv-serif-jp text-xl font-medium tracking-wide sm:text-2xl">
              {copy.home.createTitle}
            </h2>
            <p className="text-xs leading-relaxed text-[#6f665b]">
              {copy.home.createLead}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onCreate}
              className="btn-primary min-h-11 w-full"
            >
              {copy.home.createButton}
            </button>
            {hasDraft ? (
              <button
                type="button"
                onClick={onResume}
                className="btn-secondary min-h-11 w-full !border-[#ded5c5] !bg-white/70 text-xs"
              >
                {fmt(copy.home.resumeNote, {
                  title: draftTitle || copy.view.untitled,
                })}
              </button>
            ) : null}
          </div>
        </section>

        {/* 右：もらった .mybook を読む */}
        <section className="flex min-w-0 flex-col gap-2">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`bv-dropzone flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-3 rounded-2xl bg-white/60 p-5 text-center sm:p-8 ${
              dragActive ? "bv-dropzone--active" : ""
            }`}
          >
            <span className="text-3xl" aria-hidden>
              📖
            </span>
            <h2 className="bv-serif-jp break-words text-base font-medium tracking-wide text-[#33302c] sm:text-lg">
              {dragActive ? copy.home.dropActive : copy.home.readTitle}
            </h2>
            <p className="max-w-sm break-words text-xs leading-relaxed text-[#6f665b]">
              {copy.home.readLead}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-secondary min-h-11 !border-[#ded5c5]"
            >
              {copy.home.readButton}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={`${MYBOOK_EXTENSION},application/json`}
              className="hidden"
              onChange={(event) => {
                void handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
          {error ? (
            <p role="alert" className="break-words text-xs text-red-600">
              {error}
            </p>
          ) : null}
        </section>
      </div>

      {/* サンプルから始める */}
      <section className="rounded-2xl border border-[#e6dfd2] bg-white/70 p-4 sm:p-5">
        <div className="mb-3 space-y-1">
          <h2 className="bv-serif-jp text-base font-medium tracking-wide text-[#33302c] sm:text-lg">
            {copy.home.samplesHeading}
          </h2>
          <p className="break-words text-xs leading-relaxed text-[#6f665b]">
            {copy.home.samplesLead}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {SAMPLE_IDS.map((id) => {
            const sample = copy.home.samples[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onLoadSample(id)}
                className="flex min-h-11 min-w-0 flex-col gap-1.5 rounded-xl border border-[#ded5c5] bg-[#f8f5ef] p-3.5 text-left transition-all hover:border-[#c4b8a4] hover:bg-[#f3eee4] active:scale-[0.99]"
              >
                <span className="text-lg" aria-hidden>
                  {SAMPLE_ICONS[id]}
                </span>
                <span className="break-words text-sm font-semibold text-[#33302c]">
                  {sample.title}
                </span>
                <span className="break-words text-[11px] leading-relaxed text-[#6f665b]">
                  {sample.lead}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
