"use client";

import { useId } from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";

/** 起動時に毎回出すルール説明。START までゲームを開始しない */
export default function RulesIntroModal({
  open,
  copy,
  onStart,
}: {
  open: boolean;
  copy: PixelDropPuzzleDict["rules"];
  onStart: () => void;
}) {
  const titleId = useId();
  if (!open) return null;

  const steps = [copy.step1, copy.step2, copy.step3, copy.step4];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="pxd-rules-modal pointer-events-auto">
        <p className="pxd-records-rail__eyebrow">{copy.eyebrow}</p>
        <h2 id={titleId} className="pxd-rules-modal__title">
          {copy.title}
        </h2>
        <p className="pxd-rules-modal__lead">{copy.lead}</p>
        <div className="pxd-records-rail__divider" aria-hidden />
        <ol className="pxd-rules-modal__list">
          {steps.map((text, i) => (
            <li key={i} className="pxd-rules-modal__item">
              <span className="pxd-rules-modal__n">{i + 1}</span>
              <span className="pxd-rules-modal__text">{text}</span>
            </li>
          ))}
        </ol>
        <div className="pxd-records-rail__divider" aria-hidden />
        <button
          type="button"
          onClick={onStart}
          className="pxd-rules-modal__close"
        >
          {copy.close}
        </button>
      </div>
    </div>
  );
}
